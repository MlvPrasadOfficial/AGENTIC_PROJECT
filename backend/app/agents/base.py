# Base Agent Class
# File: base.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Base agent class for all agents in the Enterprise Insights Copilot

import os
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from datetime import datetime
from pydantic import BaseModel

from app.utils.logger import get_agent_logger
from app.core.config import settings

class BaseAgentRequest(BaseModel):
    """Base request model for agent operations"""
    query: str
    context_data: Optional[Dict[str, Any]] = None
    file_id: Optional[str] = None

class BaseAgentResponse(BaseModel):
    """Base response model for agent operations"""
    agent_name: str
    agent_type: str
    status: str
    message: str
    result: Any
    processing_time: float
    timestamp: datetime

class BaseAgent(ABC):
    """Base agent class with common functionality"""
    
    def __init__(self, name: str, agent_type: str):
        """
        Initialize the agent.
        
        Args:
            name: Human-readable name
            agent_type: Machine-readable type
        """
        self.name = name
        self.agent_type = agent_type
        self.logger = get_agent_logger(agent_type)
        self.model_name = os.environ.get("OLLAMA_MODEL") or settings.OLLAMA_MODEL
        self.logger.info(f"Initializing agent: {name} ({agent_type})")
    
    @abstractmethod
    async def run(self, 
                 query: str, 
                 context: Optional[Dict[str, Any]] = None,
                 file_id: Optional[str] = None) -> BaseAgentResponse:
        """
        Run the agent with given query and context.
        
        Args:
            query: The query or prompt for the agent
            context: Optional context data
            file_id: Optional file ID to process
            
        Returns:
            Agent response
        """
        pass
    
    def _create_response(self, 
                        status: str, 
                        message: str, 
                        result: Any, 
                        processing_time: float) -> BaseAgentResponse:
        """
        Create a standardized agent response.
        
        Args:
            status: Status of the operation (success, error, etc.)
            message: Human-readable message
            result: Result data
            processing_time: Processing time in seconds
            
        Returns:
            Standardized agent response
        """
        return BaseAgentResponse(
            agent_name=self.name,
            agent_type=self.agent_type,
            status=status,
            message=message,
            result=result,
            processing_time=processing_time,
            timestamp=datetime.now()
        )

    async def _call_llm(self, 
                       prompt: str, 
                       system_message: Optional[str] = None,
                       temperature: float = None,
                       max_tokens: int = None) -> str:
        """
        Make a call to the LLM.
        
        Args:
            prompt: The prompt to send to the LLM
            system_message: Optional system message for context
            temperature: Optional temperature parameter
            max_tokens: Optional max tokens parameter
            
        Returns:
            LLM response text
        """
        from app.llm.llm_client import llm_client, LLMRequest
        from app.utils.prompts import DEFAULT_SYSTEM_MESSAGE
        
        self.logger.info(f"Calling LLM with prompt: {prompt[:50]}...")
        
        # Create LLM request
        request = LLMRequest(
            prompt=prompt,
            system_message=system_message,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Call LLM client
        try:
            response = await llm_client.generate(request)
            self.logger.info(f"LLM response received, tokens: {response.usage['total_tokens']}")
            return response.text
        except Exception as e:
            self.logger.error(f"Error calling LLM: {str(e)}")
            return "I encountered an error while processing your request. Please try again."
    async def validate_dependencies(self, context: Dict[str, Any]) -> bool:
        """
        Validate that all dependencies for this agent are met.
        
        Args:
            context: Context data that may contain dependency results
            
        Returns:
            True if all dependencies are met, False otherwise
        """
        # To be overridden by agents with dependencies
        return True
