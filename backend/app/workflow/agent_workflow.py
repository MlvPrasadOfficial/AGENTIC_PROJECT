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
    """
    
    def __init__(self):
        """Initialize the LangGraph agent workflow"""
        # Initialize all LangChain agents
        self.file_upload_agent = FileUploadAgent()
        self.data_profile_agent = DataProfileAgent()
        self.planning_agent = PlanningAgent()
        self.insight_agent = InsightAgent()
        self.visualization_agent = VisualizationAgent()
        self.critique_agent = CritiqueAgent()
        self.debate_agent = DebateAgent()
        self.report_agent = ReportAgent()
        
        # Initialize memory saver for state persistence
        self.memory = MemorySaver()
        
        # Build the LangGraph workflow
        self.workflow = self._build_langgraph_workflow()
        logger.info("Agent workflow initialized")
    
    def _build_langgraph_workflow(self) -> StateGraph:
        """Build the LangGraph workflow with all agents and conditional routing"""
        
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
        """
        Build the LangGraph workflow for agent orchestration.
        
        Returns:
            StateGraph for the agent workflow
        """
        # Create a new graph
        workflow = StateGraph(WorkflowState)
        
        # Add nodes for each agent
        workflow.add_node("file_upload", self._run_file_upload_agent)
        workflow.add_node("data_profile", self._run_data_profile_agent)
        workflow.add_node("planning", self._run_planning_agent)
        
        # Add conditional edges
        workflow.add_conditional_edges(
            "file_upload",
            self._route_after_file_upload,
            {
                "success": "data_profile",
                "error": END
            }
        )
        
        workflow.add_conditional_edges(
            "data_profile",
            self._route_after_data_profile,
            {
                "success": "planning",
                "error": END
            }
        )
        
        workflow.add_conditional_edges(
            "planning",
            self._route_after_planning,
            {
                "success": END,
                "error": END
            }
        )
        
        # Set the entry point
        workflow.set_entry_point("file_upload")
        
        return workflow
    
    async def run_workflow(self, query: str, file_id: str) -> Dict[str, Any]:
        """
        Run the agent workflow with a query and file ID.
        
        Args:
            query: User's query or analytics request
            file_id: ID of the file to process
            
        Returns:
            Result of the workflow execution
        """
        # Initialize workflow state
        initial_state: WorkflowState = {
            "query": query,
            "file_id": file_id,
            "status": "started",
            "current_agent": "file_upload",
            "agent_results": {},
            "error": None,
            "start_time": time.time()
        }
        
        try:
            logger.info(f"Starting workflow for file ID: {file_id}, Query: '{query}'")
            # Execute the workflow
            result = await self.workflow.acontinue_from(initial_state)
            
            # Calculate total processing time
            total_time = time.time() - initial_state["start_time"]
            
            # Prepare final response
            final_result = {
                "status": result["status"],
                "query": query,
                "file_id": file_id,
                "processing_time": total_time,
                "completed_agents": list(result["agent_results"].keys()),
                "results": result["agent_results"],
                "error": result["error"]
            }
            
            logger.info(f"Workflow completed with status: {result['status']}")
            return final_result
            
        except Exception as e:
            logger.error(f"Error in workflow execution: {str(e)}")
            return {
                "status": "error",
                "query": query,
                "file_id": file_id,
                "processing_time": time.time() - initial_state["start_time"],
                "completed_agents": [],
                "results": {},
                "error": str(e)
            }
    
    async def _run_file_upload_agent(self, state: WorkflowState) -> WorkflowState:
        """
        Run the File Upload Agent.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated workflow state
        """
        try:
            logger.info("Running File Upload Agent")
            state["current_agent"] = "file_upload"
            
            # Run the agent
            response = await self.file_upload_agent.run(
                query=state["query"],
                file_id=state["file_id"]
            )
            
            # Update state
            state["agent_results"]["file_upload"] = response.dict()
            
            if response.status == "success":
                state["status"] = "file_uploaded"
            else:
                state["status"] = "error"
                state["error"] = response.message
                
            return state
            
        except Exception as e:
            logger.error(f"Error in File Upload Agent: {str(e)}")
            state["status"] = "error"
            state["error"] = f"File Upload Agent error: {str(e)}"
            return state
    
    async def _run_data_profile_agent(self, state: WorkflowState) -> WorkflowState:
        """
        Run the Data Profile Agent.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated workflow state
        """
        try:
            logger.info("Running Data Profile Agent")
            state["current_agent"] = "data_profile"
            
            # Get context from previous agent
            context = {"file_upload_result": state["agent_results"]["file_upload"]}
            
            # Run the agent
            response = await self.data_profile_agent.run(
                query=state["query"],
                context=context,
                file_id=state["file_id"]
            )
            
            # Update state
            state["agent_results"]["data_profile"] = response.dict()
            
            if response.status == "success":
                state["status"] = "profiled"
            else:
                state["status"] = "error"
                state["error"] = response.message
                
            return state
            
        except Exception as e:
            logger.error(f"Error in Data Profile Agent: {str(e)}")
            state["status"] = "error"
            state["error"] = f"Data Profile Agent error: {str(e)}"
            return state
    
    async def _run_planning_agent(self, state: WorkflowState) -> WorkflowState:
        """
        Run the Planning Agent.
        
        Args:
            state: Current workflow state
            
        Returns:
            Updated workflow state
        """
        try:
            logger.info("Running Planning Agent")
            state["current_agent"] = "planning"
            
            # Get context from previous agents
            context = {
                "file_upload_result": state["agent_results"]["file_upload"],
                "data_profile_result": state["agent_results"]["data_profile"]
            }
            
            # Run the agent
            response = await self.planning_agent.run(
                query=state["query"],
                context=context,
                file_id=state["file_id"]
            )
            
            # Update state
            state["agent_results"]["planning"] = response.dict()
            
            if response.status == "success":
                state["status"] = "planned"
            else:
                state["status"] = "error"
                state["error"] = response.message
                
            return state
            
        except Exception as e:
            logger.error(f"Error in Planning Agent: {str(e)}")
            state["status"] = "error"
            state["error"] = f"Planning Agent error: {str(e)}"
            return state
    
    def _route_after_file_upload(self, state: WorkflowState) -> Literal["success", "error"]:
        """Determine next step after File Upload Agent"""
        return "success" if state["status"] == "file_uploaded" else "error"
    
    def _route_after_data_profile(self, state: WorkflowState) -> Literal["success", "error"]:
        """Determine next step after Data Profile Agent"""
        return "success" if state["status"] == "profiled" else "error"
    
    def _route_after_planning(self, state: WorkflowState) -> Literal["success", "error"]:
        """Determine next step after Planning Agent"""
        return "success" if state["status"] == "planned" else "error"
