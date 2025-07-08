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
from pydantic import BaseModel, Field

from app.agents.file_upload_agent import FileUploadAgent
from app.agents.data_profile_agent import DataProfileAgent
from app.agents.planning_agent import PlanningAgent
from app.utils.logger import setup_logger

# Setup logger
logger = setup_logger(__name__)

# Define state schema
class WorkflowState(TypedDict):
    """State for the agent workflow"""
    query: str
    file_id: Optional[str]
    status: str
    current_agent: str
    agent_results: Dict[str, Any]
    error: Optional[str]
    start_time: float
    

class AgentWorkflow:
    """
    Workflow manager for orchestrating agents using LangGraph.
    This class manages the flow between agents in the Enterprise Insights Copilot.
    """
    
    def __init__(self):
        """Initialize the agent workflow"""
        # Initialize agents
        self.file_upload_agent = FileUploadAgent()
        self.data_profile_agent = DataProfileAgent()
        self.planning_agent = PlanningAgent()
        
        # Build the workflow graph
        self.workflow = self._build_workflow()
        logger.info("Agent workflow initialized")
    
    def _build_workflow(self) -> StateGraph:
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
