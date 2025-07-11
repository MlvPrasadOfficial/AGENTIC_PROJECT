# Unit Tests for LLM Client
# File: test_llm_client.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Unit tests for enhanced Ollama LLM client

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
import httpx

from app.llm.llm_client import LLMClient, LLMRequest, LLMResponse
from app.core.config import settings

class TestLLMClient:
    """Unit tests for LLMClient class"""
    
    @pytest.fixture
    def llm_client(self):
        """Create an LLM client instance for testing"""
        return LLMClient()
    
    @pytest.fixture
    def sample_request(self):
        """Create a sample LLM request"""
        return LLMRequest(
            prompt="What is machine learning?",
            system_message="You are a helpful AI assistant.",
            temperature=0.7,
            max_tokens=100
        )
    
    def test_initialization(self, llm_client):
        """Test LLM client initialization"""
        assert llm_client.model == settings.OLLAMA_MODEL
        assert llm_client.use_local == settings.USE_LOCAL_LLM
        assert llm_client.local_url == settings.OLLAMA_BASE_URL
        assert isinstance(llm_client.cache, dict)
    
    @patch('httpx.AsyncClient')
    async def test_check_ollama_connection_success(self, mock_client, llm_client):
        """Test successful Ollama connection check"""
        # Mock successful response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "models": [
                {"name": "llama3.1:8b"},
                {"name": "llama3:8b"}
            ]
        }
        
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        result = await llm_client.check_ollama_connection()
        
        assert result is True
    
    @patch('httpx.AsyncClient')
    async def test_check_ollama_connection_failure(self, mock_client, llm_client):
        """Test failed Ollama connection check"""
        # Mock failed response
        mock_response = Mock()
        mock_response.status_code = 500
        
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        
        result = await llm_client.check_ollama_connection()
        
        assert result is False
    
    @patch('httpx.AsyncClient')
    async def test_check_ollama_connection_exception(self, mock_client, llm_client):
        """Test Ollama connection check with exception"""
        # Mock exception
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            side_effect=httpx.ConnectError("Connection failed")
        )
        
        result = await llm_client.check_ollama_connection()
        
        assert result is False
    
    @patch('httpx.AsyncClient')
    async def test_pull_model_if_needed_success(self, mock_client, llm_client):
        """Test successful model pulling"""
        # Mock successful pull response
        mock_response = Mock()
        mock_response.status_code = 200
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        # Mock connection check to return False initially
        with patch.object(llm_client, 'check_ollama_connection', return_value=False):
            result = await llm_client.pull_model_if_needed()
        
        assert result is True
    
    @patch('httpx.AsyncClient')
    async def test_pull_model_if_needed_failure(self, mock_client, llm_client):
        """Test failed model pulling"""
        # Mock failed pull response
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = "Model not found"
        
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=mock_response)
        
        # Mock connection check to return False
        with patch.object(llm_client, 'check_ollama_connection', return_value=False):
            result = await llm_client.pull_model_if_needed()
        
        assert result is False
    
    async def test_generate_with_cache_hit(self, llm_client, sample_request):
        """Test generate with cache hit"""
        # Mock cached response
        cached_response = LLMResponse(
            text="Cached response",
            finish_reason="stop",
            model="test-model",
            usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
            processing_time=0.1
        )
        
        # Add to cache
        cache_key = llm_client._get_cache_key(sample_request)
        llm_client._add_to_cache(cache_key, cached_response)
        
        # Enable caching
        with patch.object(settings, 'LLM_USE_CACHE', True):
            result = await llm_client.generate(sample_request)
        
        assert result.text == "Cached response"
    
    @patch('app.llm.llm_client.LLMClient.check_ollama_connection')
    @patch('app.llm.llm_client.LLMClient._generate_local_enhanced')
    async def test_generate_local_success(self, mock_generate, mock_check, llm_client, sample_request):
        """Test successful local generation"""
        # Mock connection check
        mock_check.return_value = True
        
        # Mock generation response
        mock_response = LLMResponse(
            text="Generated response",
            finish_reason="stop",
            model=llm_client.model,
            usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
            processing_time=1.0
        )
        mock_generate.return_value = mock_response
        
        # Set to use local
        llm_client.use_local = True
        
        result = await llm_client.generate(sample_request)
        
        assert result.text == "Generated response"
        assert result.status != "error"
    
    @patch('app.llm.llm_client.LLMClient.check_ollama_connection')
    @patch('app.llm.llm_client.LLMClient.pull_model_if_needed')
    async def test_generate_with_model_pull(self, mock_pull, mock_check, llm_client, sample_request):
        """Test generation with model pulling"""
        # Mock connection check to fail first, then succeed after pull
        mock_check.return_value = False
        mock_pull.return_value = True
        
        # Mock enhanced generation
        with patch.object(llm_client, '_generate_local_enhanced') as mock_generate:
            mock_generate.return_value = LLMResponse(
                text="Response after pull",
                finish_reason="stop",
                model=llm_client.model,
                usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
                processing_time=1.0
            )
            
            llm_client.use_local = True
            result = await llm_client.generate(sample_request)
        
        mock_pull.assert_called_once()
        assert result.text == "Response after pull"
    
    async def test_generate_error_handling(self, llm_client, sample_request):
        """Test error handling in generation"""
        # Mock to raise exception
        with patch.object(llm_client, 'check_ollama_connection', side_effect=Exception("Test error")):
            llm_client.use_local = True
            result = await llm_client.generate(sample_request)
        
        assert "error" in result.text.lower()
        assert result.finish_reason == "error"
        assert result.usage["total_tokens"] == 0
    
    @patch('app.llm.llm_client.OllamaLLM')
    async def test_generate_local_enhanced_with_langchain(self, mock_ollama, llm_client, sample_request):
        """Test enhanced local generation with LangChain"""
        # Mock LangChain Ollama
        mock_llm = Mock()
        mock_llm.ainvoke = AsyncMock(return_value="LangChain response")
        llm_client.ollama_llm = mock_llm
        
        result = await llm_client._generate_local_enhanced(sample_request)
        
        assert result.text == "LangChain response"
        assert result.finish_reason == "stop"
        mock_llm.ainvoke.assert_called_once()
    
    async def test_generate_local_enhanced_fallback(self, llm_client, sample_request):
        """Test enhanced local generation fallback"""
        # Set ollama_llm to None to trigger fallback
        llm_client.ollama_llm = None
        
        with patch.object(llm_client, '_generate_local') as mock_fallback:
            mock_fallback.return_value = LLMResponse(
                text="Fallback response",
                finish_reason="stop",
                model=llm_client.model,
                usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
                processing_time=1.0
            )
            
            result = await llm_client._generate_local_enhanced(sample_request)
        
        assert result.text == "Fallback response"
        mock_fallback.assert_called_once()
    
    def test_get_cache_key(self, llm_client, sample_request):
        """Test cache key generation"""
        cache_key = llm_client._get_cache_key(sample_request)
        
        assert isinstance(cache_key, str)
        assert "What is machine learning?" in cache_key
        assert "helpful AI assistant" in cache_key
    
    def test_cache_operations(self, llm_client, sample_request):
        """Test cache add and retrieve operations"""
        # Create test response
        test_response = LLMResponse(
            text="Test response",
            finish_reason="stop",
            model="test-model",
            usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
            processing_time=1.0
        )
        
        # Test adding to cache
        cache_key = llm_client._get_cache_key(sample_request)
        llm_client._add_to_cache(cache_key, test_response)
        
        # Test retrieving from cache
        cached_response = llm_client._get_from_cache(cache_key)
        
        assert cached_response is not None
        assert cached_response.text == "Test response"
    
    def test_cache_expiration(self, llm_client, sample_request):
        """Test cache expiration behavior"""
        # Create test response
        test_response = LLMResponse(
            text="Test response",
            finish_reason="stop",
            model="test-model",
            usage={"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
            processing_time=1.0
        )
        
        # Mock time to simulate expiration
        with patch('time.time', return_value=1000):
            cache_key = llm_client._get_cache_key(sample_request)
            llm_client._add_to_cache(cache_key, test_response)
        
        # Check cache with future time (expired)
        with patch('time.time', return_value=1000 + llm_client.cache_ttl + 1):
            cached_response = llm_client._get_from_cache(cache_key)
        
        assert cached_response is None
        assert cache_key not in llm_client.cache

# Test configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
