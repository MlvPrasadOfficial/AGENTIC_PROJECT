# Chat Service
# File: chat_service.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: Chat service with RAG integration for the Enterprise Insights Copilot

import uuid
import time
import asyncio
import json
from typing import Dict, Any, List, Optional, AsyncGenerator
from datetime import datetime
from fastapi import HTTPException

from app.utils.logger import setup_logger
from app.core.config import settings
from app.llm.llm_client import llm_client, LLMRequest
from app.rag.rag_system import RAGSystem
from app.schemas.chat import ChatMessage, ChatSession, ChatResponse, StreamChunk

# Setup logger
logger = setup_logger(__name__)

# In-memory store for chat sessions
# In a production system, this would be stored in a database
chat_sessions: Dict[str, List[ChatMessage]] = {}

# Initialize RAG system
rag_system = RAGSystem()

def create_chat_session() -> ChatSession:
    """
    Create a new chat session.
    
    Returns:
        Chat session data with ID
    """
    session_id = str(uuid.uuid4())
    chat_sessions[session_id] = []
    
    return ChatSession(
        session_id=session_id,
        created_at=datetime.now(),
        message_count=0
    )

def get_chat_history(session_id: str) -> List[ChatMessage]:
    """
    Get the message history for a session.
    
    Args:
        session_id: The chat session ID
        
    Returns:
        List of chat messages
        
    Raises:
        HTTPException if session not found
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail=f"Chat session {session_id} not found")
    
    return chat_sessions[session_id]

async def process_chat_message(
    session_id: str,
    message: str,
    file_id: Optional[str] = None,
    use_rag: bool = True
) -> ChatResponse:
    """
    Process a chat message and generate a response.
    
    Args:
        session_id: The chat session ID
        message: The user message
        file_id: Optional file ID to use for RAG context
        use_rag: Whether to use RAG for enhanced responses
        
    Returns:
        Chat response with generated text
        
    Raises:
        HTTPException if session not found or processing fails
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail=f"Chat session {session_id} not found")
    
    # Add user message to history
    user_message = ChatMessage(
        message_id=str(uuid.uuid4()),
        session_id=session_id,
        role="user",
        content=message,
        timestamp=datetime.now()
    )
    chat_sessions[session_id].append(user_message)
    
    # Get previous messages for context
    history = chat_sessions[session_id][-5:]  # Last 5 messages for context
    context = "\n".join([f"{msg.role}: {msg.content}" for msg in history[:-1]])
    
    start_time = time.time()
    
    try:
        # Use RAG if requested and file_id is provided
        if use_rag and file_id:
            logger.info(f"Using RAG for chat response with file_id: {file_id}")
            
            # Get RAG context
            rag_results = await rag_system.generate_augmented_response(
                file_id=file_id,
                query=message,
                system_message=(
                    "You are an Enterprise Insights Copilot specialized in data analysis. "
                    "Use the retrieved context to provide accurate, helpful responses. "
                    "If the context doesn't contain relevant information, acknowledge this "
                    "and provide general guidance based on your knowledge."
                )
            )
            
            # Add assistant message to history
            assistant_message = ChatMessage(
                message_id=str(uuid.uuid4()),
                session_id=session_id,
                role="assistant",
                content=rag_results["response"],
                timestamp=datetime.now(),
                metadata={
                    "processing_time": time.time() - start_time,
                    "used_rag": True,
                    "file_id": file_id,
                    "context_chunks": len(rag_results.get("context", [])),
                }
            )
            
            response = ChatResponse(
                message=assistant_message,
                processing_time=time.time() - start_time
            )
            
        else:
            # Standard LLM response without RAG
            logger.info("Using standard LLM for chat response")
            
            # Create LLM request
            request = LLMRequest(
                prompt=message,
                system_message=(
                    f"You are an Enterprise Insights Copilot specialized in data analysis. "
                    f"Previous conversation context:\n{context}"
                ),
                temperature=0.7
            )
            
            # Generate response
            llm_response = await llm_client.generate(request)
            
            # Add assistant message to history
            assistant_message = ChatMessage(
                message_id=str(uuid.uuid4()),
                session_id=session_id,
                role="assistant",
                content=llm_response.text,
                timestamp=datetime.now(),
                metadata={
                    "processing_time": time.time() - start_time,
                    "used_rag": False,
                    "model": llm_response.model,
                    "tokens": llm_response.usage
                }
            )
            
            response = ChatResponse(
                message=assistant_message,
                processing_time=time.time() - start_time
            )
            
        # Add assistant message to history
        chat_sessions[session_id].append(assistant_message)
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

async def stream_chat_response(
    session_id: str,
    message: str,
    file_id: Optional[str] = None,
    use_rag: bool = True
) -> AsyncGenerator[StreamChunk, None]:
    """
    Stream a chat response in chunks.
    
    Args:
        session_id: The chat session ID
        message: The user message
        file_id: Optional file ID to use for RAG context
        use_rag: Whether to use RAG for enhanced responses
        
    Yields:
        Stream chunks of the response
        
    Raises:
        HTTPException if session not found or processing fails
    """
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail=f"Chat session {session_id} not found")
    
    # Add user message to history
    user_message = ChatMessage(
        message_id=str(uuid.uuid4()),
        session_id=session_id,
        role="user",
        content=message,
        timestamp=datetime.now()
    )
    chat_sessions[session_id].append(user_message)
    
    # Get previous messages for context
    history = chat_sessions[session_id][-5:]  # Last 5 messages for context
    context = "\n".join([f"{msg.role}: {msg.content}" for msg in history[:-1]])
    
    start_time = time.time()
    message_id = str(uuid.uuid4())
    accumulated_text = ""
    
    try:
        # Use RAG if requested and file_id is provided
        if use_rag and file_id:
            logger.info(f"Using RAG for streaming chat response with file_id: {file_id}")
            
            # Get RAG context first
            relevant_chunks = await rag_system.retrieve_context(
                file_id=file_id,
                query=message,
                top_k=3
            )
            
            # Format context for prompt
            context_str = "\n\n".join([
                f"Context {i+1}:\n{chunk['text']}"
                for i, chunk in enumerate(relevant_chunks)
            ])
            
            # Create streaming request with RAG context
            system_message = (
                "You are an Enterprise Insights Copilot specialized in data analysis. "
                "Use the retrieved context to provide accurate, helpful responses. "
                "If the context doesn't contain relevant information, acknowledge this "
                "and provide general guidance based on your knowledge.\n\n"
                f"Retrieved context:\n{context_str}\n\n"
                f"Previous conversation context:\n{context}"
            )
            
        else:
            # Standard streaming without RAG
            logger.info("Using standard LLM for streaming chat response")
            
            system_message = (
                "You are an Enterprise Insights Copilot specialized in data analysis. "
                f"Previous conversation context:\n{context}"
            )
        
        # Create LLM request
        request = LLMRequest(
            prompt=message,
            system_message=system_message,
            temperature=0.7,
            stream=True
        )
        
        # Stream response
        async for chunk in llm_client.stream(request):
            text_chunk = chunk.text
            accumulated_text += text_chunk
            
            # Yield chunk
            yield StreamChunk(
                message_id=message_id,
                session_id=session_id,
                chunk=text_chunk,
                is_final=False
            )
            
            # Small delay to avoid overwhelming the client
            await asyncio.sleep(0.01)
        
        # Add complete message to history
        assistant_message = ChatMessage(
            message_id=message_id,
            session_id=session_id,
            role="assistant",
            content=accumulated_text,
            timestamp=datetime.now(),
            metadata={
                "processing_time": time.time() - start_time,
                "used_rag": use_rag and file_id is not None,
                "file_id": file_id,
                "streamed": True
            }
        )
        chat_sessions[session_id].append(assistant_message)
        
        # Final chunk
        yield StreamChunk(
            message_id=message_id,
            session_id=session_id,
            chunk="",
            is_final=True,
            metadata={
                "processing_time": time.time() - start_time,
                "used_rag": use_rag and file_id is not None,
                "total_chunks": len(accumulated_text),
            }
        )
        
    except Exception as e:
        logger.error(f"Error streaming chat response: {str(e)}")
        yield StreamChunk(
            message_id=message_id,
            session_id=session_id,
            chunk="I encountered an error while processing your request.",
            is_final=True,
            error=str(e)
        )
