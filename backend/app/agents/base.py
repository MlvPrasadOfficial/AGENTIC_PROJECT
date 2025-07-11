# Base Agent Class
# File: base.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Base agent class for all agents in the Enterprise Insights Copilot

import os
from typing import Dict, Any, List, Optional, Union
from abc import ABC, abstractmethod
from datetime import datetime
from pydantic import BaseModel

from langchain.agents import AgentExecutor, create_react_agent
from langchain.agents.format_scratchpad import format_log_to_str
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from langchain_core.agents import AgentAction, AgentFinish
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import Tool
from langchain_ollama import OllamaLLM
from langchain_core.callbacks import BaseCallbackHandler

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

class AgentCallbackHandler(BaseCallbackHandler):
    """Custom callback handler for agent monitoring"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.logger = get_agent_logger(agent_name)
    
    def on_agent_action(self, action: AgentAction, **kwargs) -> Any:
        """Called when agent takes an action"""
        self.logger.info(f"Agent {self.agent_name} taking action: {action.tool}")
    
    def on_agent_finish(self, finish: AgentFinish, **kwargs) -> Any:
        """Called when agent finishes"""
        self.logger.info(f"Agent {self.agent_name} finished successfully")

class BaseAgent(ABC):
    """LangChain-powered base agent class with common functionality"""
    
    def __init__(self, name: str, agent_type: str):
        """
        Initialize the LangChain agent.
        
        Args:
            name: Human-readable name
            agent_type: Machine-readable type
        """
        self.name = name
        self.agent_type = agent_type
        self.logger = get_agent_logger(agent_type)
        self.model_name = os.environ.get("OLLAMA_MODEL") or settings.OLLAMA_MODEL
        
        # Initialize LangChain LLM
        self.llm = OllamaLLM(
            model=self.model_name,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0.7
        )
        
        # Initialize callback handler
        self.callback_handler = AgentCallbackHandler(agent_type)
        
        # Initialize tools and agent executor
        self.tools = self._get_tools()
        self.agent_executor = self._create_agent_executor()
        
        self.logger.info(f"Initializing LangChain agent: {name} ({agent_type})")
    
    @abstractmethod
    def _get_tools(self) -> List[Tool]:
        """Get the tools for this agent"""
        pass
    
    @abstractmethod
    def _get_agent_prompt(self) -> PromptTemplate:
        """Get the prompt template for this agent"""
        pass
    
    def _create_agent_executor(self) -> AgentExecutor:
        """Create the LangChain agent executor"""
        prompt = self._get_agent_prompt()
        
        # Create ReAct agent
        agent = create_react_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
        
        # Create agent executor
        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            callbacks=[self.callback_handler],
            verbose=True,
            max_iterations=5,
            handle_parsing_errors=True
        )
    
    async def run(self, request: BaseAgentRequest) -> BaseAgentResponse:
        """
        Execute the LangChain agent with the given request.
        
        Args:
            request: The agent request
            
        Returns:
            The agent response
        """
        start_time = datetime.now()
        
        try:
            self.logger.info(f"Running {self.agent_type} with query: {request.query}")
            
            # Prepare input for agent
            agent_input = {
                "input": request.query,
                "context": request.context_data or {},
                "file_id": request.file_id
            }
            
            # Execute agent via LangChain
            result = await self.agent_executor.ainvoke(agent_input)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            response = BaseAgentResponse(
                agent_name=self.name,
                agent_type=self.agent_type,
                status="success",
                message=f"Agent {self.name} completed successfully",
                result=result.get("output", result),
                processing_time=processing_time,
                timestamp=datetime.now()
            )
            
            self.logger.info(f"Agent {self.agent_type} completed in {processing_time:.2f}s")
            return response
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            self.logger.error(f"Agent {self.agent_type} failed: {str(e)}")
            
            return BaseAgentResponse(
                agent_name=self.name,
                agent_type=self.agent_type,
                status="error",
                message=f"Agent {self.name} failed: {str(e)}",
                result=None,
                processing_time=processing_time,
                timestamp=datetime.now()
            )
        """
        Run the agent with given request.
        
        Args:
            request: The agent request containing query, context, and file_id
            
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
            system_message=system_message or DEFAULT_SYSTEM_MESSAGE,
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
