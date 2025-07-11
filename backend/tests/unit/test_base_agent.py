# Unit Tests for Agent Base Class
# File: test_base_agent.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Unit tests for the enhanced base agent class

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime

from app.agents.base import BaseAgent, BaseAgentRequest, BaseAgentResponse, AgentCallbackHandler
from app.core.config import settings

# Create a concrete implementation for testing
class TestAgent(BaseAgent):
    """Test implementation of BaseAgent"""
    
    def __init__(self):
        super().__init__("Test Agent", "test")
    
    def _get_tools(self):
        """Return empty tools list for testing"""
        return []
    
    def _get_agent_prompt(self):
        """Return simple prompt for testing"""
        from langchain_core.prompts import PromptTemplate
        return PromptTemplate(
            template="Test prompt: {input}",
            input_variables=["input"]
        )

class TestBaseAgent:
    """Unit tests for BaseAgent class"""
    
    @pytest.fixture
    def test_agent(self):
        """Create a test agent instance"""
        with patch('app.agents.base.Ollama'), \
             patch('app.agents.base.create_react_agent'), \
             patch('app.agents.base.AgentExecutor'):
            return TestAgent()
    
    @pytest.fixture
    def sample_request(self):
        """Create a sample agent request"""
        return BaseAgentRequest(
            query="What is the data distribution?",
            context_data={"file_id": "test123"},
            file_id="test123"
        )
    
    def test_agent_initialization(self, test_agent):
        """Test agent initialization"""
        assert test_agent.name == "Test Agent"
        assert test_agent.agent_type == "test"
        assert test_agent.model_name == settings.OLLAMA_MODEL
        assert test_agent.logger is not None
        assert test_agent.callback_handler is not None
    
    def test_callback_handler_initialization(self):
        """Test callback handler initialization"""
        handler = AgentCallbackHandler("test_agent")
        
        assert handler.agent_name == "test_agent"
        assert handler.logger is not None
    
    def test_callback_handler_on_agent_action(self):
        """Test callback handler action logging"""
        handler = AgentCallbackHandler("test_agent")
        
        # Mock action
        mock_action = Mock()
        mock_action.tool = "test_tool"
        
        # This should not raise an exception
        handler.on_agent_action(mock_action)
    
    def test_callback_handler_on_agent_finish(self):
        """Test callback handler finish logging"""
        handler = AgentCallbackHandler("test_agent")
        
        # Mock finish
        mock_finish = Mock()
        
        # This should not raise an exception
        handler.on_agent_finish(mock_finish)
    
    def test_create_response(self, test_agent):
        """Test response creation"""
        response = test_agent._create_response(
            status="success",
            message="Test completed",
            result={"data": "test"},
            processing_time=1.5
        )
        
        assert isinstance(response, BaseAgentResponse)
        assert response.agent_name == "Test Agent"
        assert response.agent_type == "test"
        assert response.status == "success"
        assert response.message == "Test completed"
        assert response.result == {"data": "test"}
        assert response.processing_time == 1.5
        assert isinstance(response.timestamp, datetime)
    
    @patch('app.agents.base.llm_client')
    async def test_call_llm_success(self, mock_llm_client, test_agent):
        """Test successful LLM call"""
        # Mock LLM response
        mock_response = Mock()
        mock_response.text = "LLM response text"
        mock_response.usage = {"total_tokens": 100}
        
        mock_llm_client.generate = AsyncMock(return_value=mock_response)
        
        result = await test_agent._call_llm("test prompt")
        
        assert result == "LLM response text"
        mock_llm_client.generate.assert_called_once()
    
    @patch('app.agents.base.llm_client')
    async def test_call_llm_failure(self, mock_llm_client, test_agent):
        """Test LLM call failure"""
        # Mock LLM exception
        mock_llm_client.generate = AsyncMock(side_effect=Exception("LLM error"))
        
        result = await test_agent._call_llm("test prompt")
        
        assert "error" in result.lower()
    
    @patch('app.agents.base.llm_client')
    async def test_call_llm_with_parameters(self, mock_llm_client, test_agent):
        """Test LLM call with parameters"""
        mock_response = Mock()
        mock_response.text = "Response with params"
        mock_response.usage = {"total_tokens": 50}
        
        mock_llm_client.generate = AsyncMock(return_value=mock_response)
        
        result = await test_agent._call_llm(
            prompt="test prompt",
            system_message="system message",
            temperature=0.5,
            max_tokens=200
        )
        
        assert result == "Response with params"
        
        # Check that the request was created with correct parameters
        call_args = mock_llm_client.generate.call_args[0][0]
        assert call_args.prompt == "test prompt"
        assert call_args.system_message == "system message"
        assert call_args.temperature == 0.5
        assert call_args.max_tokens == 200
    
    @patch('app.agents.base.AgentExecutor')
    @patch('app.agents.base.create_react_agent')
    async def test_run_success(self, mock_create_agent, mock_executor_class, test_agent, sample_request):
        """Test successful agent run"""
        # Mock agent executor
        mock_executor = Mock()
        mock_executor.ainvoke = AsyncMock(return_value={"output": "Agent completed successfully"})
        mock_executor_class.return_value = mock_executor
        
        # Override the agent executor
        test_agent.agent_executor = mock_executor
        
        response = await test_agent.run(sample_request)
        
        assert isinstance(response, BaseAgentResponse)
        assert response.status == "success"
        assert response.result == "Agent completed successfully"
        assert response.processing_time > 0
    
    @patch('app.agents.base.AgentExecutor')
    async def test_run_failure(self, mock_executor_class, test_agent, sample_request):
        """Test agent run failure"""
        # Mock agent executor to raise exception
        mock_executor = Mock()
        mock_executor.ainvoke = AsyncMock(side_effect=Exception("Agent execution failed"))
        mock_executor_class.return_value = mock_executor
        
        # Override the agent executor
        test_agent.agent_executor = mock_executor
        
        response = await test_agent.run(sample_request)
        
        assert isinstance(response, BaseAgentResponse)
        assert response.status == "error"
        assert "Agent execution failed" in response.message
        assert response.result is None
    
    async def test_validate_dependencies_default(self, test_agent):
        """Test default dependency validation"""
        result = await test_agent.validate_dependencies({})
        
        # Default implementation should return True
        assert result is True
    
    def test_agent_prompt_creation(self, test_agent):
        """Test agent prompt template creation"""
        prompt = test_agent._get_agent_prompt()
        
        assert prompt is not None
        assert "input" in prompt.input_variables
    
    def test_tools_creation(self, test_agent):
        """Test agent tools creation"""
        tools = test_agent._get_tools()
        
        assert isinstance(tools, list)
        # TestAgent returns empty list
        assert len(tools) == 0
    
    @patch('app.agents.base.Ollama')
    def test_llm_initialization(self, mock_ollama, test_agent):
        """Test LLM initialization"""
        # Check that Ollama was initialized with correct parameters
        mock_ollama.assert_called_with(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=0.7
        )
    
    def test_agent_request_model(self):
        """Test BaseAgentRequest model"""
        request = BaseAgentRequest(
            query="test query",
            context_data={"key": "value"},
            file_id="file123"
        )
        
        assert request.query == "test query"
        assert request.context_data == {"key": "value"}
        assert request.file_id == "file123"
    
    def test_agent_request_model_defaults(self):
        """Test BaseAgentRequest model with defaults"""
        request = BaseAgentRequest(query="test query")
        
        assert request.query == "test query"
        assert request.context_data is None
        assert request.file_id is None
    
    def test_agent_response_model(self):
        """Test BaseAgentResponse model"""
        timestamp = datetime.now()
        
        response = BaseAgentResponse(
            agent_name="Test Agent",
            agent_type="test",
            status="success",
            message="Test message",
            result={"data": "test"},
            processing_time=1.5,
            timestamp=timestamp
        )
        
        assert response.agent_name == "Test Agent"
        assert response.agent_type == "test"
        assert response.status == "success"
        assert response.message == "Test message"
        assert response.result == {"data": "test"}
        assert response.processing_time == 1.5
        assert response.timestamp == timestamp

# Test configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
