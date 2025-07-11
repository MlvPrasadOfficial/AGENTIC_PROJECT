# Agent Service
# File: agent_service.py
# Author: GitHub Copilot
# Date: 2025-07-10
# Purpose: Service layer for agent operations and pipeline management

import asyncio
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.schemas.agent import AgentType, AgentStatus, PipelineStatus, AgentResponse, PipelineResponse
from app.agents.file_upload_agent import FileUploadAgent
from app.agents.data_profile_agent import DataProfileAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.insight_agent import InsightAgent
from app.agents.viz_agent import VizAgent
from app.agents.critique_agent import CritiqueAgent
from app.agents.debate_agent import DebateAgent
from app.agents.report_agent import ReportAgent
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class AgentService:
    """Service for managing agent execution and pipelines"""
    
    def __init__(self):
        self.agents = {
            AgentType.FILE_UPLOAD: FileUploadAgent(),
            AgentType.DATA_PROFILE: DataProfileAgent(),
            AgentType.PLANNING: PlanningAgent(),
            AgentType.INSIGHT: InsightAgent(),
            AgentType.VISUALIZATION: VizAgent(),
            AgentType.CRITIQUE: CritiqueAgent(),
            AgentType.DEBATE: DebateAgent(),
            AgentType.REPORT: ReportAgent(),
        }
        self.active_pipelines: Dict[str, Dict[str, Any]] = {}
    
    async def run_agent(self, agent_type: AgentType, query: str = None, 
                       file_id: str = None, context_data: Dict[str, Any] = None) -> AgentResponse:
        """Run a single agent"""
        try:
            start_time = datetime.now()
            agent = self.agents.get(agent_type)
            
            if not agent:
                raise ValueError(f"Agent type {agent_type} not found")
            
            # Prepare agent request
            from app.agents.base import BaseAgentRequest
            request = BaseAgentRequest(
                query=query or "",
                context_data=context_data or {},
                file_id=file_id
            )
            
            # Execute agent
            result = await agent.run(request)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return AgentResponse(
                agent_type=agent_type,
                agent_name=result.agent_name,
                status=AgentStatus.SUCCESS,
                message=result.message,
                result=result.result,
                metadata={"processing_time": processing_time},
                processing_time=processing_time,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Agent {agent_type} execution failed: {str(e)}")
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return AgentResponse(
                agent_type=agent_type,
                agent_name=agent_type.value,
                status=AgentStatus.FAILED,
                message=f"Agent execution failed: {str(e)}",
                result=None,
                processing_time=processing_time,
                timestamp=datetime.now(),
                error=str(e)
            )
    
    async def start_pipeline(self, query: str, file_id: str = None, 
                           context: Dict[str, Any] = None) -> str:
        """Start a new agent pipeline"""
        pipeline_id = str(uuid.uuid4())
        
        self.active_pipelines[pipeline_id] = {
            "id": pipeline_id,
            "status": PipelineStatus.RUNNING,
            "query": query,
            "file_id": file_id,
            "context": context or {},
            "current_agent": None,
            "completed_agents": [],
            "failed_agents": [],
            "results": {},
            "started_at": datetime.now(),
            "completed_at": None
        }
        
        # Start pipeline execution in background
        asyncio.create_task(self._execute_pipeline(pipeline_id))
        
        return pipeline_id
    
    async def _execute_pipeline(self, pipeline_id: str):
        """Execute the agent pipeline"""
        pipeline = self.active_pipelines.get(pipeline_id)
        if not pipeline:
            return
        
        try:
            # Define pipeline flow
            agent_sequence = [
                AgentType.FILE_UPLOAD,
                AgentType.DATA_PROFILE,
                AgentType.PLANNING,
                # Planning agent will determine next agent (Insight or Viz)
                AgentType.CRITIQUE,
                AgentType.DEBATE,
                AgentType.REPORT
            ]
            
            for agent_type in agent_sequence:
                pipeline["current_agent"] = agent_type
                
                # Execute agent
                result = await self.run_agent(
                    agent_type=agent_type,
                    query=pipeline["query"],
                    file_id=pipeline["file_id"],
                    context_data=pipeline["context"]
                )
                
                if result.status == AgentStatus.SUCCESS:
                    pipeline["completed_agents"].append(agent_type)
                    pipeline["results"][agent_type.value] = result.result
                    
                    # Special handling for planning agent
                    if agent_type == AgentType.PLANNING:
                        # Planning agent should determine next agent
                        next_agent = self._determine_next_agent(result.result)
                        if next_agent:
                            next_result = await self.run_agent(
                                agent_type=next_agent,
                                query=pipeline["query"],
                                file_id=pipeline["file_id"],
                                context_data=pipeline["context"]
                            )
                            pipeline["completed_agents"].append(next_agent)
                            pipeline["results"][next_agent.value] = next_result.result
                else:
                    pipeline["failed_agents"].append(agent_type)
                    logger.error(f"Agent {agent_type} failed in pipeline {pipeline_id}")
                    break
            
            pipeline["status"] = PipelineStatus.COMPLETED
            pipeline["completed_at"] = datetime.now()
            
        except Exception as e:
            logger.error(f"Pipeline {pipeline_id} execution failed: {str(e)}")
            pipeline["status"] = PipelineStatus.FAILED
            pipeline["completed_at"] = datetime.now()
    
    def _determine_next_agent(self, planning_result: Any) -> Optional[AgentType]:
        """Determine next agent based on planning result"""
        # This is a simplified implementation
        # In reality, this would parse the planning result to decide
        if "visualization" in str(planning_result).lower():
            return AgentType.VISUALIZATION
        else:
            return AgentType.INSIGHT
    
    def get_pipeline_status(self, pipeline_id: str) -> Optional[PipelineResponse]:
        """Get current status of a pipeline"""
        pipeline = self.active_pipelines.get(pipeline_id)
        if not pipeline:
            return None
        
        return PipelineResponse(
            pipeline_id=pipeline_id,
            status=pipeline["status"],
            current_agent=pipeline["current_agent"],
            completed_agents=pipeline["completed_agents"],
            failed_agents=pipeline["failed_agents"],
            results=pipeline["results"],
            started_at=pipeline["started_at"],
            completed_at=pipeline["completed_at"],
            total_processing_time=(
                (pipeline["completed_at"] - pipeline["started_at"]).total_seconds()
                if pipeline["completed_at"] else None
            )
        )
    
    def list_active_pipelines(self) -> List[str]:
        """List all active pipeline IDs"""
        return [pid for pid, pipeline in self.active_pipelines.items() 
                if pipeline["status"] == PipelineStatus.RUNNING]

# Global service instance
agent_service = AgentService()

# Convenience functions for API endpoints
async def run_agent(agent_type: AgentType, query: str = None, 
                   file_id: str = None, context_data: Dict[str, Any] = None) -> AgentResponse:
    """Run a single agent"""
    return await agent_service.run_agent(agent_type, query, file_id, context_data)

async def start_pipeline(query: str, file_id: str = None, 
                        context: Dict[str, Any] = None) -> str:
    """Start a new agent pipeline"""
    return await agent_service.start_pipeline(query, file_id, context)

def get_pipeline_status(pipeline_id: str) -> Optional[PipelineResponse]:
    """Get current status of a pipeline"""
    return agent_service.get_pipeline_status(pipeline_id)
