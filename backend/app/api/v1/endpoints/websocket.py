# WebSocket endpoints for Enterprise Insights Copilot
# File: websocket.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Real-time communication between frontend and agents

from fastapi import WebSocket, WebSocketDisconnect, Depends
from fastapi.routing import APIRouter
from typing import Dict, List, Any
import json
import asyncio
from datetime import datetime

from app.workflow.agent_workflow import AgentWorkflow
from app.utils.logger import setup_logger
from app.core.config import settings

logger = setup_logger(__name__)
router = APIRouter()

class ConnectionManager:
    """Manages WebSocket connections for real-time agent updates"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.client_sessions: Dict[str, Dict] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept WebSocket connection and initialize session"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.client_sessions[session_id] = {
            "websocket": websocket,
            "connected_at": datetime.now(),
            "agent_status": {}
        }
        logger.info(f"WebSocket connected: {session_id}")
        
        # Send welcome message
        await self.send_message(websocket, {
            "type": "connection_established",
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        })
    
    def disconnect(self, websocket: WebSocket, session_id: str):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if session_id in self.client_sessions:
            del self.client_sessions[session_id]
        
        logger.info(f"WebSocket disconnected: {session_id}")
    
    async def send_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Send message to specific WebSocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send WebSocket message: {e}")
    
    async def broadcast_agent_update(self, session_id: str, agent_name: str, status: str, data: Any = None):
        """Broadcast agent status update to specific session"""
        if session_id in self.client_sessions:
            websocket = self.client_sessions[session_id]["websocket"]
            
            message = {
                "type": "agent_update",
                "agent_name": agent_name,
                "status": status,
                "data": data,
                "timestamp": datetime.now().isoformat()
            }
            
            await self.send_message(websocket, message)
            
            # Update session status
            self.client_sessions[session_id]["agent_status"][agent_name] = {
                "status": status,
                "last_update": datetime.now().isoformat(),
                "data": data
            }

# Global connection manager
manager = ConnectionManager()

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time agent communication
    
    Message Types:
    - agent_update: Status updates from agents
    - workflow_started: Workflow initiation
    - workflow_completed: Workflow completion
    - error: Error messages
    """
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Listen for messages from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "ping":
                # Respond to ping with pong
                await manager.send_message(websocket, {
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                })
            
            elif message_type == "start_workflow":
                # Start agent workflow
                query = message.get("query", "")
                await handle_workflow_start(session_id, query)
            
            elif message_type == "get_status":
                # Send current agent status
                if session_id in manager.client_sessions:
                    status = manager.client_sessions[session_id]["agent_status"]
                    await manager.send_message(websocket, {
                        "type": "status_update",
                        "agents": status,
                        "timestamp": datetime.now().isoformat()
                    })
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, session_id)

async def handle_workflow_start(session_id: str, query: str):
    """Handle workflow start request via WebSocket"""
    try:
        # Initialize workflow
        workflow = AgentWorkflow()
        
        # Send workflow started message
        await manager.broadcast_agent_update(
            session_id, 
            "workflow", 
            "started", 
            {"query": query}
        )
        
        # Create async task for workflow execution
        asyncio.create_task(execute_workflow_with_updates(session_id, workflow, query))
        
    except Exception as e:
        logger.error(f"Failed to start workflow: {e}")
        await manager.broadcast_agent_update(
            session_id,
            "workflow",
            "error",
            {"error": str(e)}
        )

async def execute_workflow_with_updates(session_id: str, workflow: AgentWorkflow, query: str):
    """Execute agent workflow with real-time updates"""
    try:
        # Mock workflow execution with status updates
        agents = [
            "planning_agent",
            "insight_agent", 
            "critique_agent",
            "debate_agent",
            "report_agent"
        ]
        
        for agent in agents:
            # Send agent started status
            await manager.broadcast_agent_update(
                session_id,
                agent,
                "processing",
                {"message": f"{agent.replace('_', ' ').title()} is processing..."}
            )
            
            # Simulate processing time
            await asyncio.sleep(2)
            
            # Send agent completed status
            await manager.broadcast_agent_update(
                session_id,
                agent,
                "completed",
                {"message": f"{agent.replace('_', ' ').title()} completed successfully"}
            )
        
        # Send workflow completed message
        await manager.broadcast_agent_update(
            session_id,
            "workflow",
            "completed",
            {"result": "Analysis completed successfully"}
        )
        
    except Exception as e:
        logger.error(f"Workflow execution error: {e}")
        await manager.broadcast_agent_update(
            session_id,
            "workflow", 
            "error",
            {"error": str(e)}
        )

# Export manager for use in other modules
__all__ = ["router", "manager"]
