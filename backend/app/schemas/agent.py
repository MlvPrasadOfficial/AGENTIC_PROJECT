# Agent Schemas
# File: agent.py
# Author: GitHub Copilot
# Date: 2025-07-10
# Purpose: Pydantic schemas for agent operations

from typing import Dict, Any, List, Optional, Union, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class AgentType(str, Enum):
    """Types of agents available in the system"""
    FILE_UPLOAD = "file_upload"
    DATA_PROFILE = "data_profile"
    PLANNING = "planning"
    INSIGHT = "insight"
    VISUALIZATION = "visualization"
    CRITIQUE = "critique"
    DEBATE = "debate"
    REPORT = "report"

class AgentStatus(str, Enum):
    """Status of agent execution"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class PipelineStatus(str, Enum):
    """Status of the overall agent pipeline"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentRequest(BaseModel):
    """Request model for agent execution"""
    query: Optional[str] = None
    file_id: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    """Response model for agent execution"""
    agent_type: AgentType
    agent_name: str
    status: AgentStatus
    message: str
    result: Optional[Any] = None
    metadata: Optional[Dict[str, Any]] = None
    processing_time: Optional[float] = None
    timestamp: datetime
    error: Optional[str] = None

class PipelineRequest(BaseModel):
    """Request model for pipeline execution"""
    query: str
    file_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class PipelineStatusInfo(BaseModel):
    """Status information for the agent pipeline"""
    pipeline_id: str
    status: PipelineStatus
    message: str
    progress: int = 0
    active_agent: Optional[AgentType] = None
    completed_agents: List[AgentType] = []
    failed_agents: List[AgentType] = []
    results: Dict[str, Any] = {}
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class WebSocketMessage(BaseModel):
    """WebSocket message format"""
    type: Literal["agent_update", "pipeline_status", "error"]
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.now)

class PipelineResponse(BaseModel):
    """Response model for pipeline execution"""
    pipeline_id: str
    status: PipelineStatus
    message: str
    query: str
    file_id: Optional[str] = None
    agents_executed: List[AgentType] = []
    results: Dict[str, Any] = {}
    processing_time: Optional[float] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None

class AgentConfig(BaseModel):
    """Configuration for agent execution"""
    max_retries: int = 3
    timeout: int = 120
    enable_caching: bool = True
    log_level: str = "INFO"
