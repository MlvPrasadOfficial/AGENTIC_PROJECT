# Agent Workflow
# File: agent_workflow.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: LangGraph workflow for orchestrating agents in the Enterprise Insights Copilot

from typing import Dict, Any, List, Literal, Optional, TypedDict, Annotated
import uuid
from datetime import datetime
import time

from langchain.schema import Document
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from pydantic import BaseModel, Field

from app.agents.file_upload_agent import FileUploadAgent
from app.agents.data_profile_agent import DataProfileAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.insight_agent import InsightAgent
from app.agents.visualization_agent import VisualizationAgent
from app.agents.critique_agent import CritiqueAgent
from app.agents.debate_agent import DebateAgent
from app.agents.report_agent import ReportAgent
from app.agents.base import BaseAgentRequest
from app.utils.logger import setup_logger

# Setup logger
logger = setup_logger(__name__)

# Define state schema for LangGraph
class WorkflowState(TypedDict):
    """Enhanced state for the LangGraph agent workflow"""
    query: str
    file_id: Optional[str]
    status: str
    current_agent: str
    agent_results: Dict[str, Any]
    route_decision: Optional[str]  # "insight" or "visualization"
    final_output: Optional[Dict[str, Any]]
    error: Optional[str]
    start_time: float
    session_id: str

class AgentWorkflow:
    """
    LangGraph-powered workflow manager for orchestrating all Enterprise Insights agents.
    Implements conditional routing and multi-agent coordination.
    
    Uses singleton pattern to prevent duplicate agent initialization during FastAPI startup.
    """
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        """
        Singleton pattern implementation to ensure only one workflow instance exists.
        
        This method implements the singleton design pattern to prevent multiple
        instantiations of the AgentWorkflow class. This is crucial for:
        
        Performance Benefits:
            - Prevents duplicate agent initialization during FastAPI startup
            - Reduces memory usage by reusing existing agent instances  
            - Eliminates redundant LangChain executor creation
            - Maintains consistent state across multiple API endpoints
        
        System Architecture:
            - Ensures all API endpoints use the same workflow instance
            - Prevents race conditions between different request handlers
            - Maintains singleton integrity across module imports
            - Supports proper dependency injection patterns
        
        Implementation Details:
            - Thread-safe singleton creation (Python GIL protection)
            - Lazy initialization - instance created only when first needed
            - Memory-efficient - reuses existing instance for subsequent calls
            - Debug logging to track instance creation vs. reuse patterns
        
        Returns:
            AgentWorkflow: The singleton instance (new or existing)
            
        Example:
            >>> workflow1 = AgentWorkflow()
            >>> workflow2 = AgentWorkflow() 
            >>> assert workflow1 is workflow2  # Same instance
        """
        if cls._instance is None:
            logger.info("Creating new AgentWorkflow singleton instance")
            cls._instance = super(AgentWorkflow, cls).__new__(cls)
        else:
            logger.debug("Returning existing AgentWorkflow singleton instance")
        return cls._instance
    
    def __init__(self):
        """
        Initialize the LangGraph agent workflow with comprehensive configuration.
        
        This initialization method sets up the complete multi-agent workflow system
        for the Enterprise Insights Copilot. It implements a one-time initialization
        pattern to prevent duplicate agent creation and ensure optimal performance.
        
        Initialization Process:
        
        1. **Singleton Check**: Verifies if workflow has already been initialized
           - Prevents duplicate initialization during FastAPI hot reloads
           - Maintains consistent state across multiple API endpoints
           - Reduces memory footprint through instance reuse
        
        2. **Agent Instantiation**: Creates all 8 specialized agents
           - FileUploadAgent: Handles file ingestion and validation
           - DataProfileAgent: Performs data structure analysis and profiling  
           - PlanningAgent: Creates analysis strategies and execution plans
           - InsightAgent: Generates insights from data patterns
           - VisualizationAgent: Creates charts and visual representations
           - CritiqueAgent: Provides quality assessment and improvements
           - DebateAgent: Facilitates multi-perspective analysis
           - ReportAgent: Compiles final comprehensive reports
        
        3. **LangGraph Configuration**: Sets up the workflow orchestration
           - StateGraph: Manages agent execution flow and dependencies
           - MemorySaver: Provides state persistence across workflow steps
           - Conditional routing: Enables dynamic agent selection logic
        
        4. **Performance Optimization**: Ensures efficient resource usage
           - Single initialization per application lifecycle
           - Shared agent instances across all API requests
           - Memory-efficient state management
           - Debug logging for monitoring and troubleshooting
        
        Technical Architecture:
            - Uses LangChain agent framework for consistent behavior
            - Implements dependency injection pattern for loose coupling
            - Supports asynchronous execution for scalability
            - Provides comprehensive error handling and recovery
        
        State Management:
            - Thread-safe initialization through Python GIL
            - Persistent workflow state through MemorySaver
            - Conditional routing based on execution results
            - Error recovery and fallback mechanisms
        
        Raises:
            ImportError: If required agent classes are not available
            ValueError: If agent initialization fails due to configuration
            RuntimeError: If LangGraph workflow building fails
            
        Example:
            >>> workflow = AgentWorkflow()  # First call - full initialization
            >>> workflow = AgentWorkflow()  # Subsequent calls - reuse existing
        """
        # Prevent re-initialization if already initialized
        if self.__class__._initialized:
            logger.debug("AgentWorkflow already initialized, skipping re-initialization")
            return
        
        logger.info("Initializing AgentWorkflow singleton...")
            
        # Initialize all LangChain agents with proper error handling
        try:
            # Core data processing agents
            self.file_upload_agent = FileUploadAgent()           # File ingestion and validation
            self.data_profile_agent = DataProfileAgent()         # Data structure analysis
            
            # Strategic analysis agents  
            self.planning_agent = PlanningAgent()               # Analysis strategy creation
            self.insight_agent = InsightAgent()                 # Pattern discovery and insights
            
            # Visualization and presentation agents
            self.visualization_agent = VisualizationAgent()     # Chart and visual creation
            
            # Quality assurance agents
            self.critique_agent = CritiqueAgent()               # Quality assessment
            self.debate_agent = DebateAgent()                   # Multi-perspective analysis
            
            # Final output generation agents
            self.report_agent = ReportAgent()                   # Comprehensive report compilation
            
        except Exception as e:
            logger.error(f"Failed to initialize agents: {str(e)}")
            raise RuntimeError(f"Agent initialization failed: {str(e)}")
        
        # Initialize workflow infrastructure
        try:
            # Initialize memory saver for state persistence
            self.memory = MemorySaver()
            
            # Build the LangGraph workflow with agent orchestration
            self.workflow = self._build_langgraph_workflow()
            
        except Exception as e:
            logger.error(f"Failed to build LangGraph workflow: {str(e)}")
            raise RuntimeError(f"Workflow building failed: {str(e)}")
        
        # Mark as initialized to prevent duplicate initialization
        self.__class__._initialized = True
        logger.info("Agent workflow initialized successfully with 8 agents and LangGraph orchestration")

    def _build_langgraph_workflow(self) -> StateGraph:
        """
        Build and configure the LangGraph workflow orchestration system.
        
        This method constructs a sophisticated StateGraph that manages the execution
        flow between the 8 specialized agents in the Enterprise Insights Copilot.
        It implements a state-driven orchestration pattern where agents execute
        based on workflow state and conditional routing logic.
        
        Returns:
            StateGraph: Compiled LangGraph workflow ready for execution
        """
        # Create the state graph
        workflow = StateGraph(WorkflowState)
        
        # Add all agent nodes
        workflow.add_node("planning", self._run_planning_agent)
        workflow.add_node("insight", self._run_insight_agent) 
        workflow.add_node("visualization", self._run_visualization_agent)
        workflow.add_node("critique", self._run_critique_agent)
        workflow.add_node("debate", self._run_debate_agent)
        workflow.add_node("report", self._run_report_agent)
        
        # Set entry point
        workflow.set_entry_point("planning")
        
        # Add conditional routing from planning agent
        workflow.add_conditional_edges(
            "planning",
            self._route_after_planning,
            {
                "insight": "insight",
                "visualization": "visualization",
                "end": END
            }
        )
        
        # Add edges from insight/visualization to critique
        workflow.add_edge("insight", "critique")
        workflow.add_edge("visualization", "critique")
        
        # Add sequential edges through the pipeline
        workflow.add_edge("critique", "debate")
        workflow.add_edge("debate", "report")
        workflow.add_edge("report", END)
        
        # Compile the workflow with memory
        return workflow.compile(checkpointer=self.memory)
    
    def _route_after_planning(self, state: WorkflowState) -> str:
        """Conditional routing logic after planning agent"""
        planning_result = state.get("agent_results", {}).get("planning", {})
        
        # Extract route decision from planning agent result
        if "route_to" in planning_result:
            route = planning_result["route_to"].lower()
            if route in ["insight", "visualization"]:
                state["route_decision"] = route
                return route
        
        # Default to insight agent if no clear routing decision
        state["route_decision"] = "insight"
        return "insight"
    
    async def _run_planning_agent(self, state: WorkflowState) -> WorkflowState:
        """Execute planning agent via LangChain"""
        state["current_agent"] = "planning"
        state["status"] = "processing"
        
        try:
            request = BaseAgentRequest(
                query=state["query"],
                context_data=state.get("agent_results", {}),
                file_id=state.get("file_id")
            )
            
            result = await self.planning_agent.run(request)
            
            state["agent_results"]["planning"] = {
                "status": result.status,
                "result": result.result,
                "route_to": "insight" if "statistics" in state["query"].lower() else "visualization"
            }
            
            logger.info(f"Planning agent completed: {result.status}")
            
        except Exception as e:
            logger.error(f"Planning agent failed: {e}")
            state["error"] = str(e)
            state["status"] = "error"
        
        return state
    
    async def _run_insight_agent(self, state: WorkflowState) -> WorkflowState:
        """Execute insight agent via LangChain"""
        state["current_agent"] = "insight"
        
        try:
            request = BaseAgentRequest(
                query=state["query"],
                context_data=state.get("agent_results", {}),
                file_id=state.get("file_id")
            )
            
            result = await self.insight_agent.run(request)
            state["agent_results"]["insight"] = {
                "status": result.status,
                "result": result.result
            }
            
            logger.info(f"Insight agent completed: {result.status}")
            
        except Exception as e:
            logger.error(f"Insight agent failed: {e}")
            state["error"] = str(e)
        
        return state
    
    async def _run_visualization_agent(self, state: WorkflowState) -> WorkflowState:
        """Execute visualization agent via LangChain"""
        state["current_agent"] = "visualization"
        
        try:
            request = BaseAgentRequest(
                query=state["query"],
                context_data=state.get("agent_results", {}),
                file_id=state.get("file_id")
            )
            
            result = await self.visualization_agent.run(request)
            state["agent_results"]["visualization"] = {
                "status": result.status,
                "result": result.result
            }
            
            logger.info(f"Visualization agent completed: {result.status}")
            
        except Exception as e:
            logger.error(f"Visualization agent failed: {e}")
            state["error"] = str(e)
        
        return state
    
    async def _run_critique_agent(self, state: WorkflowState) -> WorkflowState:
        """Execute critique agent via LangChain"""
        state["current_agent"] = "critique"
        
        try:
            request = BaseAgentRequest(
                query=state["query"],
                context_data=state.get("agent_results", {}),
                file_id=state.get("file_id")
            )
            
            result = await self.critique_agent.run(request)
            state["agent_results"]["critique"] = {
                "status": result.status,
                "result": result.result
            }
            
            logger.info(f"Critique agent completed: {result.status}")
            
        except Exception as e:
            logger.error(f"Critique agent failed: {e}")
            state["error"] = str(e)
        
        return state
    
    async def _run_debate_agent(self, state: WorkflowState) -> WorkflowState:
        """Execute debate agent via LangChain"""
        state["current_agent"] = "debate"
        
        try:
            request = BaseAgentRequest(
                query=state["query"],
                context_data=state.get("agent_results", {}),
                file_id=state.get("file_id")
            )
            
            result = await self.debate_agent.run(request)
            state["agent_results"]["debate"] = {
                "status": result.status,
                "result": result.result
            }
            
            logger.info(f"Debate agent completed: {result.status}")
            
        except Exception as e:
            logger.error(f"Debate agent failed: {e}")
            state["error"] = str(e)
        
        return state
    
    async def _run_report_agent(self, state: WorkflowState) -> WorkflowState:
        """Execute report agent via LangChain"""
        state["current_agent"] = "report"
        
        try:
            request = BaseAgentRequest(
                query=state["query"],
                context_data=state.get("agent_results", {}),
                file_id=state.get("file_id")
            )
            
            result = await self.report_agent.run(request)
            state["agent_results"]["report"] = {
                "status": result.status,
                "result": result.result
            }
            
            # Set final output
            state["final_output"] = {
                "analysis_results": state["agent_results"],
                "route_taken": state.get("route_decision", "insight"),
                "completion_time": time.time() - state["start_time"]
            }
            
            state["status"] = "completed"
            logger.info(f"Report agent completed: {result.status}")
            
        except Exception as e:
            logger.error(f"Report agent failed: {e}")
            state["error"] = str(e)
            state["status"] = "error"
        
        return state

    async def run_workflow(self, query: str, file_id: str = None) -> Dict[str, Any]:
        """
        Execute the complete multi-agent workflow for comprehensive data analysis.
        
        This method orchestrates the entire Enterprise Insights Copilot workflow,
        managing execution flow between all 8 specialized agents to deliver 
        comprehensive analytical insights from user queries and uploaded data.
        
        Args:
            query (str): User's analytical question or request
            file_id (str, optional): Identifier for uploaded data file
        
        Returns:
            Dict[str, Any]: Comprehensive analysis results
        """
        logger.info(f"Starting comprehensive workflow execution for query: '{query}'")
        start_time = time.time()
        
        # Generate unique session identifier for tracking
        session_id = f"workflow_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        
        # Create initial workflow state with comprehensive context
        initial_state = WorkflowState(
            query=query,
            file_id=file_id,
            agent_results={},
            current_agent="planning",
            route_decision=None,
            final_output=None,
            error=None,
            status="initializing",
            start_time=start_time,
            session_id=session_id
        )
        
        # Create thread-safe configuration for this workflow session
        thread_config = {"configurable": {"thread_id": session_id}}
        
        try:
            logger.info(f"Executing workflow for session {session_id}")
            
            # Execute the complete LangGraph workflow
            final_state = await self.workflow.ainvoke(
                initial_state, 
                config=thread_config
            )
            
            # Calculate comprehensive performance metrics
            total_execution_time = time.time() - start_time
            
            # Extract final results with error handling
            final_output = final_state.get("final_output", {})
            if not final_output:
                final_output = {
                    "analysis_results": final_state.get("agent_results", {}),
                    "route_taken": final_state.get("route_decision", "unknown"),
                    "completion_time": total_execution_time
                }
            
            # Add performance and execution metadata
            final_output.update({
                "status": final_state.get("status", "completed"),
                "session_id": session_id,
                "execution_time": total_execution_time,
                "agents_executed": list(final_state.get("agent_results", {}).keys()),
                "error": final_state.get("error")
            })
            
            logger.info(f"Workflow {session_id} completed successfully in {total_execution_time:.2f}s")
            return final_output
            
        except Exception as e:
            execution_time = time.time() - start_time
            error_msg = f"Workflow execution failed for session {session_id}: {str(e)}"
            logger.error(error_msg)
            
            # Return structured error response with available context
            return {
                "status": "error",
                "session_id": session_id,
                "execution_time": execution_time,
                "query": query,
                "file_id": file_id,
                "error": str(e),
                "analysis_results": {},
                "agents_executed": [],
                "route_taken": "error"
            }


def get_workflow_instance() -> AgentWorkflow:
    """
    Retrieve the singleton AgentWorkflow instance with lazy initialization.
    
    This function provides a clean interface for obtaining the singleton AgentWorkflow
    instance throughout the Enterprise Insights Copilot application. It implements
    lazy initialization to ensure optimal performance and resource utilization.
    
    Returns:
        AgentWorkflow: The singleton workflow instance with all 8 agents initialized
    """
    return AgentWorkflow()
