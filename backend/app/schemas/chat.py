# Chat Schemas
# File: chat.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: Pydantic schemas for chat functionality

from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    """Schema for a chat message"""
    message_id: str
    session_id: str
    role: str
    content: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class ChatSession(BaseModel):
    """Schema for a chat session"""
    session_id: str
    created_at: datetime
    message_count: int
    metadata: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    """Schema for a chat response"""
    message: ChatMessage
    processing_time: float
    metadata: Optional[Dict[str, Any]] = None

class StreamChunk(BaseModel):
    """Schema for a streaming chat response chunk"""
    message_id: str
    session_id: str
    chunk: str
    is_final: bool = False
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    """Schema for a chat request"""
    message: str = Field(..., description="User message")
    file_id: Optional[str] = Field(None, description="File ID for RAG context")
    use_rag: bool = Field(True, description="Whether to use RAG for enhanced responses")
    stream: bool = Field(False, description="Whether to stream the response")
