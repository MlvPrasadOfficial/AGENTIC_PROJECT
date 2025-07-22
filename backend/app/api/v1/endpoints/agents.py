# Agents Endpoints
# File: agents.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Endpoints for agent operations in the Enterprise Insights Copilot backend

import time
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Depends

from app.utils.logger import setup_logger
from app.agents.base import BaseAgentResponse
from app.schemas.agent import (
    AgentRequest, 
    AgentResponse, 
    PipelineStatusInfo,
    AgentType
)
from app.services.agent_service import run_agent, get_pipeline_status, start_pipeline

logger = setup_logger(__name__)
router = APIRouter()

@router.post("/workflow/run", response_model=Dict[str, Any])
async def run_agent_workflow(
    request: AgentRequest
) -> Dict[str, Any]:
    """
    Run the complete agent workflow with the given query and file.
    
    Args:
        request: The request data including query and file_id
        
    Returns:
        Workflow results with all agent outputs
        
    Raises:
        HTTPException if workflow execution fails
    """
    logger.info(f"Running agent workflow with query: {request.query[:50]}...")
    
    if not request.file_id:
        raise HTTPException(status_code=400, detail="file_id is required")
    
    try:
        # Import workflow instance function to prevent early initialization
        from app.workflow.agent_workflow import get_workflow_instance
        
        # Get the singleton workflow instance
        workflow = get_workflow_instance()
        
        # Run the workflow
        result = await workflow.run_workflow(
            query=request.query,
            file_id=request.file_id
        )
        
        return result
    except Exception as e:
        logger.error(f"Error running workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@router.post("/{agent_type}/run", response_model=AgentResponse)
async def run_single_agent(
    agent_type: AgentType,
    request: AgentRequest,
    background_tasks: BackgroundTasks,
) -> AgentResponse:
    """
    Run a single agent with the given input data.
    
    Args:
        agent_type: The type of agent to run
        request: The request data including query and context
        
    Returns:
        Agent response data
        
    Raises:
        HTTPException if agent type is invalid or execution fails
    """
    logger.info(f"Running agent {agent_type} with request: {request.query[:50]}...")
    
    try:
        # Run the agent
        response = await run_agent(agent_type, request.query, request.context_data, request.file_id)
        return response
    except ValueError as e:
        logger.error(f"Invalid agent request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Agent execution failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")

@router.post("/pipeline/start", response_model=PipelineStatusInfo)
async def start_pipeline_endpoint(
    request: AgentRequest,
    background_tasks: BackgroundTasks,
) -> PipelineStatusInfo:
    """
    Start the full agent pipeline with the given input.
    
    Args:
        request: The request data including query and context
        
    Returns:
        Pipeline status
        
    Raises:
        HTTPException if pipeline execution fails
    """
    logger.info(f"Starting agent pipeline with request: {request.query[:50]}...")
    
    try:
        # Start the pipeline in background
        pipeline_id = await start_pipeline(
            query=request.query,
            file_id=request.file_id,
            context=request.context_data
        )
        
        return PipelineStatusInfo(
            pipeline_id=pipeline_id,
            status="started",
            message="Pipeline started successfully",
            progress=0,
            active_agent=AgentType.FILE_UPLOAD,
            completed_agents=[],
        )
    except Exception as e:
        logger.error(f"Pipeline start failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Pipeline start failed: {str(e)}")

@router.get("/pipeline/{pipeline_id}/status", response_model=PipelineStatusInfo)
async def check_pipeline_status(pipeline_id: str) -> PipelineStatusInfo:
    """
    Check the status of a running pipeline.
    
    Args:
        pipeline_id: The unique pipeline ID
        
    Returns:
        Current pipeline status
        
    Raises:
        HTTPException if pipeline not found
    """
    logger.info(f"Checking pipeline status: {pipeline_id}")
    
    try:
        return get_pipeline_status(pipeline_id)
    except ValueError as e:
        logger.error(f"Pipeline not found: {pipeline_id}")
        raise HTTPException(status_code=404, detail=f"Pipeline not found: {str(e)}")

@router.websocket("/pipeline/{pipeline_id}/ws")
async def websocket_pipeline(websocket: WebSocket, pipeline_id: str):
    """
    WebSocket endpoint for real-time pipeline updates.
    
    Args:
        websocket: WebSocket connection
        pipeline_id: Pipeline ID to monitor
    """
    logger.info(f"WebSocket connection requested for pipeline: {pipeline_id}")
    
    await websocket.accept()
    
    try:
        # Subscribe to pipeline updates
        while True:
            # Send status update every second
            status = get_pipeline_status(pipeline_id)
            await websocket.send_json(status.dict())
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for pipeline: {pipeline_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}", exc_info=True)
        await websocket.close(code=1011, reason=str(e))
