# Chat Endpoints
# File: chat.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: Chat endpoints for the Enterprise Insights Copilot backend

import asyncio
import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import StreamingResponse

from app.utils.logger import setup_logger
from app.services.chat_service import (
    create_chat_session,
    get_chat_history,
    process_chat_message,
    stream_chat_response,
    chat_sessions
)
from app.schemas.chat import ChatMessage, ChatSession, ChatResponse, StreamChunk, ChatRequest

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
    except HTTPException as e:
        logger.error(f"Error getting chat history: {e.detail}")
        raise

@router.post("/sessions/{session_id}/messages", response_model=ChatResponse)
async def create_message(session_id: str, chat_request: ChatRequest) -> ChatResponse:
    """
    Process a new chat message and get response.
    
    Args:
        session_id: The chat session ID
        chat_request: The chat request containing the message
        
    Returns:
        Chat response with generated text
        
    Raises:
        HTTPException if session not found or processing fails
    """
    logger.info(f"Processing message for session {session_id}")
    
    if chat_request.stream:
        # Handle streaming separately
        raise HTTPException(
            status_code=400, 
            detail="Use the /sessions/{session_id}/stream endpoint for streaming"
        )
    
    try:
        return await process_chat_message(
            session_id=session_id,
            message=chat_request.message,
            file_id=chat_request.file_id,
            use_rag=chat_request.use_rag
        )
    except HTTPException as e:
        logger.error(f"Error processing chat message: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/sessions/{session_id}/stream")
async def stream_message(session_id: str, chat_request: ChatRequest) -> StreamingResponse:
    """
    Stream a chat response.
    
    Args:
        session_id: The chat session ID
        chat_request: The chat request containing the message
        
    Returns:
        Streaming response with generated text chunks
        
    Raises:
        HTTPException if session not found or processing fails
    """
    logger.info(f"Streaming response for session {session_id}")
    
    if not chat_request.stream:
        # If not streaming, redirect to regular endpoint
        raise HTTPException(
            status_code=400, 
            detail="Use the /sessions/{session_id}/messages endpoint for non-streaming"
        )
    
    try:
        # Use generator to stream response
        async def generate_stream():
            async for chunk in stream_chat_response(
                session_id=session_id,
                message=chat_request.message,
                file_id=chat_request.file_id,
                use_rag=chat_request.use_rag
            ):
                # Convert to JSON and yield
                yield json.dumps(chunk.model_dump()) + "\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="application/x-ndjson"
        )
    except HTTPException as e:
        logger.error(f"Error streaming chat response: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error streaming chat response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time chat.
    
    Args:
        websocket: WebSocket connection
        session_id: The chat session ID
    """
    await websocket.accept()
    logger.info(f"WebSocket connection established for session {session_id}")
    
    try:
        # Check if session exists or create new one
        if session_id not in chat_sessions:
            create_chat_session()
            
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            message = data.get("message", "")
            file_id = data.get("file_id")
            use_rag = data.get("use_rag", True)
            
            logger.info(f"WebSocket message received: {message[:50]}...")
            
            # Process message with streaming
            async for chunk in stream_chat_response(
                session_id=session_id,
                message=message,
                file_id=file_id,
                use_rag=use_rag
            ):
                # Send chunk to client
                await websocket.send_json(chunk.model_dump())
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {str(e)}")
        await websocket.close(code=1001)
