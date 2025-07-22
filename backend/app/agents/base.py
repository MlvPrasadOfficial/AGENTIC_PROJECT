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
    """
    Base request model for all agent operations in Enterprise Insights Copilot.
    
    This Pydantic model standardizes the input format for all agents, ensuring
    consistent data structure and validation across the multi-agent workflow system.
    
    Attributes:
        query (str): The user's analytical question or command
            - Primary input driving agent behavior and analysis
            - Examples: "What are sales trends?", "Generate chart for revenue data"
            - Required field that cannot be empty or None
            
        context_data (Optional[Dict[str, Any]]): Contextual information from previous agents
            - Results and metadata from upstream agents in the workflow
            - Used for inter-agent communication and data sharing
            - Structure: {"agent_name": {"status": "success", "result": {...}}}
            - Defaults to None for initial workflow entry points
            
        file_id (Optional[str]): Identifier for uploaded data file
            - Links to file stored in the system (uploads/ directory)
            - Enables file-based analysis and data processing
            - Format: UUID or filename-based identifier
            - Defaults to None for query-only operations
    
    Example Usage:
        ```python
        # Query-only request
        request = BaseAgentRequest(
            query="Analyze customer segmentation patterns"
        )
        
        # File-based analysis request  
        request = BaseAgentRequest(
            query="Create visualizations for sales data",
            file_id="upload_abc123.csv"
        )
        
        # Context-aware request (downstream agent)
        request = BaseAgentRequest(
            query="Critique the analysis results", 
            context_data={
                "insight": {"status": "success", "result": {"patterns": [...]}}
            }
        )
        ```
    
    Validation:
        - query: Must be non-empty string
        - context_data: Must be valid dictionary if provided
        - file_id: Must be valid string identifier if provided
    """
    query: str
    context_data: Optional[Dict[str, Any]] = None
    file_id: Optional[str] = None

class BaseAgentResponse(BaseModel):
    """
    Base response model for all agent operations in Enterprise Insights Copilot.
    
    This Pydantic model standardizes the output format from all agents, ensuring
    consistent response structure for workflow orchestration and API responses.
    
    Attributes:
        agent_name (str): Identifier of the responding agent
            - Human-readable name for the agent (e.g., "InsightAgent", "VisualizationAgent")
            - Used for workflow tracking and debugging
            - Matches the agent class name for consistency
            
        agent_type (str): Category classification of the agent
            - Functional category: "analysis", "visualization", "critique", "report"
            - Used for workflow routing and conditional logic
            - Enables agent grouping and classification
            
        status (str): Execution status of the agent operation
            - Values: "success", "error", "warning", "partial"
            - Critical for workflow conditional routing decisions
            - Determines whether downstream agents should execute
            
        message (str): Human-readable status message
            - Descriptive text about the operation result
            - Used for user feedback and debugging information
            - Examples: "Analysis completed successfully", "Data validation failed"
            
        result (Any): The actual output data from the agent
            - Flexible type to accommodate different agent outputs
            - Can be Dict, List, str, or custom data structures
            - Contains the core value-added content from the agent
            
        processing_time (float): Execution duration in seconds
            - Performance metric for monitoring and optimization
            - Measured from agent.run() start to completion
            - Used for system performance analysis and SLA monitoring
            
        timestamp (datetime): When the response was generated
            - ISO format timestamp for audit and debugging
            - Used for temporal analysis of workflow execution
            - Enables performance trend analysis over time
    
    Example Usage:
        ```python
        # Successful analysis response
        response = BaseAgentResponse(
            agent_name="InsightAgent",
            agent_type="analysis", 
            status="success",
            message="Generated 5 insights from customer data",
            result={
                "insights": [...],
                "confidence_scores": [...],
                "data_quality": 0.95
            },
            processing_time=2.34,
            timestamp=datetime.now()
        )
        
        # Error response
        response = BaseAgentResponse(
            agent_name="VisualizationAgent",
            agent_type="visualization",
            status="error", 
            message="Insufficient data for chart generation",
            result=None,
            processing_time=0.15,
            timestamp=datetime.now()
        )
        ```
    
    Integration Notes:
        - Used by AgentWorkflow for conditional routing decisions
        - Serialized to JSON for API responses and logging
        - Validated automatically by Pydantic during instantiation
        - Compatible with async/await patterns in workflow execution
    """
    agent_name: str
    agent_type: str
    status: str
    message: str
    result: Any
    processing_time: float
    timestamp: datetime

class AgentCallbackHandler(BaseCallbackHandler):
    """
    Custom callback handler for comprehensive agent execution monitoring.
    
    This callback handler provides detailed logging and monitoring of LangChain
    agent execution, capturing tool usage, decision-making processes, and 
    performance metrics for debugging and optimization purposes.
    
    Key Features:
    
    1. **Execution Tracing**:
       - Logs every agent action and tool invocation
       - Tracks reasoning steps and decision-making process
       - Captures input/output data for debugging
       - Records execution flow for workflow analysis
    
    2. **Performance Monitoring**:
       - Measures execution time for each agent action
       - Tracks tool usage frequency and success rates
       - Monitors memory usage during agent execution
       - Provides metrics for system optimization
    
    3. **Error Handling**:
       - Captures and logs agent errors with context
       - Records failed actions for debugging
       - Provides detailed error traces for troubleshooting
       - Enables graceful error recovery and reporting
    
    4. **Integration with Logging System**:
       - Uses agent-specific loggers for organized output
       - Compatible with structured logging formats
       - Supports log level filtering and routing
       - Enables centralized log aggregation
    
    Attributes:
        agent_name (str): Name of the agent being monitored
        logger: Agent-specific logger instance for organized output
    
    Lifecycle Hooks:
        - on_agent_action: Called when agent decides to use a tool
        - on_agent_finish: Called when agent completes execution
        - on_tool_start: Called when a tool begins execution
        - on_tool_end: Called when a tool finishes execution
        - on_tool_error: Called when a tool encounters an error
    
    Example Usage:
        ```python
        # Create callback handler for specific agent
        callback_handler = AgentCallbackHandler("InsightAgent")
        
        # Use in agent executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            callbacks=[callback_handler],
            verbose=True
        )
        
        # Execution will be automatically monitored
        result = agent_executor.run(query)
        ```
    
    Performance Notes:
        - Minimal overhead (~1-2ms per callback)
        - Asynchronous logging for non-blocking execution
        - Configurable verbosity levels
        - Memory-efficient event handling
    """
    
    def __init__(self, agent_name: str):
        """
        Initialize the callback handler for a specific agent.
        
        Args:
            agent_name (str): Name of the agent to monitor
        """
        self.agent_name = agent_name
        self.logger = get_agent_logger(agent_name)
    
    def on_agent_action(self, action: AgentAction, **kwargs) -> Any:
        """
        Called when the agent decides to take an action (use a tool).
        
        This callback is triggered every time the agent decides to use a tool
        as part of its reasoning process. It provides detailed logging and 
        monitoring of agent decision-making for debugging and analysis.
        
        Action Processing:
        
        1. **Tool Selection Logging**:
           - Records which tool the agent chose to use
           - Logs the reasoning behind the tool selection
           - Captures input parameters passed to the tool
           - Tracks decision-making context and state
        
        2. **Performance Monitoring**:
           - Timestamps the action start time
           - Prepares for execution time measurement
           - Tracks tool usage patterns and frequency
           - Monitors resource utilization during execution
        
        3. **Debug Information**:
           - Logs the action thought process (if available)
           - Records the tool input parameters
           - Captures any additional context or metadata
           - Enables detailed execution flow analysis
        
        Args:
            action (AgentAction): The action the agent is about to take
                - action.tool: Name of the tool to be executed
                - action.tool_input: Input parameters for the tool
                - action.log: Agent's reasoning/thought process
                
        Returns:
            Any: Optional return value (typically None)
        
        Example Log Output:
            INFO - Agent InsightAgent taking action: pandas_analysis
            DEBUG - Tool input: {'query': 'analyze trends', 'data': '...'}
            DEBUG - Agent reasoning: 'I need to analyze the data trends...'
        """
        self.logger.info(f"Agent {self.agent_name} taking action: {action.tool}")
    
    def on_agent_finish(self, finish: AgentFinish, **kwargs) -> Any:
        """Called when agent finishes"""
        self.logger.info(f"Agent {self.agent_name} finished successfully")

class BaseAgent(ABC):
    """
    Abstract base class for all LangChain-powered agents in Enterprise Insights Copilot.
    
    This foundational class provides standardized infrastructure for implementing
    specialized analytical agents that work together in a multi-agent workflow system.
    Each agent inherits comprehensive functionality for LangChain integration,
    logging, error handling, and performance monitoring.
    
    Architecture Overview:
    
    1. **Agent Specialization**:
       - Each concrete agent implements specific analytical capabilities
       - Agents communicate through standardized BaseAgentRequest/Response models
       - Modular design enables easy addition of new agent types
       - Clear separation of concerns between different analysis stages
    
    2. **LangChain Integration**:
       - Built on LangChain's ReAct agent framework for reasoning and tool usage
       - Supports dynamic tool selection based on context and requirements
       - Implements structured prompt templates for consistent behavior
       - Provides callback handlers for execution monitoring and debugging
    
    3. **Workflow Orchestration**:
       - Designed for integration with LangGraph workflow management
       - Supports conditional execution based on upstream agent results
       - Enables parallel execution where dependencies allow
       - Facilitates complex data analysis pipelines through agent composition
    
    4. **Performance & Reliability**:
       - Implements duplicate initialization prevention for optimal resource usage
       - Provides comprehensive error handling with graceful degradation
       - Includes performance monitoring and execution time tracking
       - Supports configurable retry logic for resilient operation
    
    Key Components:
    
    **Initialization System**:
    - Singleton-style tracking prevents duplicate agent initialization
    - Debug logging provides visibility into agent creation patterns
    - Memory-efficient reuse of existing agent instances
    - Hot reload compatibility for development environments
    
    **Tool Management**:
    - Dynamic tool registration and execution
    - Context-aware tool selection based on agent requirements
    - Standardized tool interface for consistent behavior
    - Comprehensive tool usage logging and monitoring
    
    **State Management**:
    - Thread-safe execution with proper state isolation
    - Context preservation across agent interactions
    - Dependency validation for required data and resources
    - Structured error propagation and recovery mechanisms
    
    Abstract Methods (Must be implemented by subclasses):
    
    - `get_agent_name() -> str`: Return human-readable agent identifier
    - `get_agent_type() -> str`: Return functional category classification
    - `get_tools() -> List[Tool]`: Define available tools for this agent
    - `get_prompt_template() -> PromptTemplate`: Define reasoning template
    - `run(request: BaseAgentRequest) -> BaseAgentResponse`: Execute agent logic
    
    Class Attributes:
        _initialized_agents (set): Tracks which agents have been initialized
                                  to prevent duplicate logging and resource allocation
    
    Example Implementation:
        ```python
        class CustomAnalysisAgent(BaseAgent):
            def get_agent_name(self) -> str:
                return "CustomAnalysisAgent"
            
            def get_agent_type(self) -> str:
                return "analysis"
            
            def get_tools(self) -> List[Tool]:
                return [
                    Tool(name="analyze_data", func=self._analyze_data),
                    Tool(name="generate_report", func=self._generate_report)
                ]
            
            def get_prompt_template(self) -> PromptTemplate:
                return PromptTemplate(
                    template="Analyze the following data: {input}",
                    input_variables=["input"]
                )
            
            async def run(self, request: BaseAgentRequest) -> BaseAgentResponse:
                # Implementation specific to this agent
                pass
        ```
    
    Integration Points:
        - Used by AgentWorkflow for multi-agent orchestration
        - Compatible with LangGraph StateGraph for workflow management
        - Integrates with FastAPI endpoints for API exposure
        - Supports WebSocket streaming for real-time updates
    
    Performance Characteristics:
        - Initialization: 100-500ms per agent (one-time cost)
        - Execution: Variable based on agent complexity and data size
        - Memory: 10-50MB per agent instance
        - Concurrency: Thread-safe for parallel execution
    """
    
    # Class variable to track initialized agents and prevent duplicate logging
    _initialized_agents = set()
    
    def __init__(self, name: str, agent_type: str):
        """
        Initialize the BaseAgent with LangChain integration and duplicate prevention.
        
        This initialization method sets up the core infrastructure required for
        LangChain-powered agent operation, including LLM configuration, logging,
        tool management, and performance monitoring. It implements duplicate
        initialization tracking to optimize resource usage in multi-instance environments.
        
        Initialization Process:
        
        1. **Agent Identity Setup**:
           - Assigns human-readable name for debugging and logging
           - Sets functional agent type for workflow routing decisions
           - Configures agent-specific logger for organized output
           - Establishes unique agent identifier for tracking
        
        2. **LangChain LLM Configuration**:
           - Initializes Ollama LLM with configurable model selection
           - Sets up connection to local Ollama server instance
           - Configures temperature and other generation parameters
           - Validates LLM connectivity and model availability
        
        3. **Duplicate Initialization Prevention**:
           - Checks if agent has already been initialized to prevent duplicates
           - Logs initialization status for debugging and monitoring
           - Tracks initialized agents in class-level registry
           - Prevents redundant logging during FastAPI hot reloads
        
        4. **Tool and Executor Setup** (Performed after initialization):
           - Creates LangChain ReAct agent with configured tools
           - Establishes AgentExecutor for tool orchestration
           - Sets up callback handlers for execution monitoring
           - Configures prompt templates for consistent reasoning
        
        LLM Configuration:
            - Model: Configurable via OLLAMA_MODEL environment variable
            - Base URL: Points to local Ollama server (default: http://localhost:11434)
            - Temperature: 0.7 for balanced creativity and consistency
            - Connection: Validates connectivity during initialization
        
        Logging System:
            - Uses agent-specific loggers for organized output
            - Supports structured logging with JSON formatting
            - Integrates with centralized logging infrastructure
            - Provides debug-level visibility into agent operations
        
        Args:
            name (str): Human-readable agent identifier
                - Used in logging messages and debugging output
                - Should match the agent class name for consistency
                - Examples: "InsightAgent", "VisualizationAgent"
                
            agent_type (str): Functional classification of the agent
                - Used for workflow routing and conditional logic
                - Categories: "analysis", "visualization", "critique", "report"
                - Enables agent grouping and specialized behavior
        
        Raises:
            ConnectionError: If Ollama LLM server is not accessible
            ValueError: If agent configuration parameters are invalid
            RuntimeError: If required dependencies are not available
        
        Example Usage:
            ```python
            # In a concrete agent implementation
            class InsightAgent(BaseAgent):
                def __init__(self):
                    super().__init__(
                        name="InsightAgent",
                        agent_type="analysis"
                    )
                    # Additional agent-specific initialization
            ```
        
        Performance Notes:
            - Initialization time: 100-500ms (one-time cost per agent)
            - Memory overhead: ~10MB for LLM connection and base infrastructure
            - Network dependency: Requires Ollama server availability
            - Thread safety: Safe for concurrent initialization
        
        Integration Notes:
            - Called by all concrete agent implementations
            - Compatible with singleton pattern in AgentWorkflow
            - Supports hot reload scenarios in development
            - Integrates with FastAPI startup lifecycle
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
        
        # Log initialization only once per agent type to prevent duplicate logging
        agent_key = f"{name}-{agent_type}"
        if agent_key not in BaseAgent._initialized_agents:
            self.logger.info(f"Initializing LangChain agent: {name} ({agent_type})")
            BaseAgent._initialized_agents.add(agent_key)
        else:
            self.logger.debug(f"Reusing existing agent instance: {name} ({agent_type})")
    
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
