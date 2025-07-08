# Chat Endpoints
# File: chat.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Chat endpoints for the Enterprise Insights Copilot backend

import asyncio
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import StreamingResponse

from app.utils.logger import setup_logger
from app.services.chat_service import (
    create_chat_session,
    get_chat_history,
    process_chat_message,
    stream_chat_response
)
from app.schemas.chat import ChatMessage, ChatSession, ChatResponse, StreamChunk

logger = setup_logger(__name__)
router = APIRouter()

@router.post("/sessions", response_model=ChatSession)
async def create_session() -> ChatSession:
    """
    Create a new chat session.
    
    Returns:
        Chat session data with ID
    """
    logger.info("Creating new chat session")
    return create_chat_session()

@router.get("/sessions/{session_id}", response_model=List[ChatMessage])
async def get_session_history(session_id: str) -> List[ChatMessage]:
    """
    Get the message history for a session.
    
    Args:
        session_id: The chat session ID
        
    Returns:
        List of chat messages
        
    Raises:
        HTTPException if session not found
    """
    logger.info(f"Getting chat history for session {session_id}")
    
    try:
        return get_chat_history(session_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Chat session {session_id} not found")

@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def send_message(session_id: str, message: ChatMessage) -> ChatResponse:
    """
    Send a message in a chat session.
    
    Args:
        session_id: The chat session ID
        message: The chat message to send
        
    Returns:
        Chat response
        
    Raises:
        HTTPException if session not found or processing fails
    """
    logger.info(f"Processing message in session {session_id}")
    
    try:
        return await process_chat_message(session_id, message)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Chat session {session_id} not found")
    except Exception as e:
        logger.error(f"Message processing failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Message processing failed: {str(e)}")

@router.post("/sessions/{session_id}/stream", response_class=StreamingResponse)
async def stream_message(session_id: str, message: ChatMessage):
    """
    Stream a response for a chat message.
    
    Args:
        session_id: The chat session ID
        message: The chat message to process
        
    Returns:
        Streaming response with chunks of the generated response
        
    Raises:
        HTTPException if session not found or processing fails
    """
    logger.info(f"Streaming response in session {session_id}")
    
    try:
        return StreamingResponse(
            stream_chat_response(session_id, message),
            media_type="text/event-stream"
        )
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Chat session {session_id} not found")
    except Exception as e:
        logger.error(f"Message streaming failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Message streaming failed: {str(e)}")

@router.websocket("/sessions/{session_id}/ws")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time chat.
    
    Args:
        websocket: WebSocket connection
        session_id: Chat session ID
    """
    logger.info(f"WebSocket connection requested for chat session: {session_id}")
    
    await websocket.accept()
    
    try:
        # Check if session exists
        try:
            get_chat_history(session_id)
        except ValueError:
            # Create new session if not found
            create_chat_session(session_id)
            
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Process message
            message = ChatMessage(
                role=data.get("role", "user"),
                content=data.get("content", ""),
                metadata=data.get("metadata", {})
            )
            
            # Process in background and stream responses
            async for chunk in stream_chat_response(session_id, message):
                await websocket.send_json(chunk.dict())
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for chat session: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}", exc_info=True)
        await websocket.close(code=1011, reason=str(e))
