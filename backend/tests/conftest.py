# Test Configuration
# File: conftest.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Pytest configuration and fixtures for Enterprise Insights Copilot tests

import pytest
import asyncio
import os
import tempfile
from unittest.mock import Mock, patch
from typing import Generator

# Set test environment variables
os.environ["ENVIRONMENT"] = "test"
os.environ["DEBUG"] = "True"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

# Import after setting environment
from app.core.config import settings

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def mock_settings():
    """Mock settings for testing"""
    with patch('app.core.config.settings') as mock_settings:
        mock_settings.PINECONE_API_KEY = "test_api_key"
        mock_settings.PINECONE_INDEX_NAME = "test_index"
        mock_settings.PINECONE_DIMENSION = 1024
        mock_settings.PINECONE_METRIC = "cosine"
        mock_settings.PINECONE_CLOUD = "aws"
        mock_settings.PINECONE_REGION = "us-east-1"
        mock_settings.PINECONE_BATCH_SIZE = 100
        mock_settings.PINECONE_TOP_K = 10
        mock_settings.PINECONE_INCLUDE_METADATA = True
        mock_settings.PINECONE_INCLUDE_VALUES = False
        
        mock_settings.OLLAMA_BASE_URL = "http://localhost:11434"
        mock_settings.OLLAMA_MODEL = "llama3.1:8b"
        mock_settings.OLLAMA_TIMEOUT = 120
        mock_settings.OLLAMA_TEMPERATURE = 0.7
        
        mock_settings.LLM_USE_CACHE = True
        mock_settings.LLM_CACHE_TTL = 3600
        mock_settings.LLM_CACHE_MAX_ENTRIES = 1000
        
        yield mock_settings

@pytest.fixture
def temp_upload_dir():
    """Create a temporary upload directory for testing"""
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch.object(settings, 'UPLOAD_DIR', temp_dir):
            yield temp_dir

@pytest.fixture
def mock_pinecone():
    """Mock Pinecone client for testing"""
    with patch('app.db.vector_store.Pinecone') as mock_pc_class:
        mock_pc = Mock()
        mock_pc_class.return_value = mock_pc
        
        # Mock index operations
        mock_index = Mock()
        mock_pc.Index.return_value = mock_index
        mock_pc.list_indexes.return_value.names = ["test_index"]
        mock_pc.describe_index.return_value.status = {'ready': True}
        
        # Mock search results
        mock_match = Mock()
        mock_match.id = "test_doc"
        mock_match.score = 0.9
        mock_match.metadata = {"content": "test content", "category": "test"}
        mock_index.query.return_value.matches = [mock_match]
        
        # Mock stats
        mock_stats = Mock()
        mock_stats.total_vector_count = 100
        mock_stats.dimension = 1024
        mock_stats.index_fullness = 0.1
        mock_stats.namespaces = {}
        mock_index.describe_index_stats.return_value = mock_stats
        
        yield mock_pc

@pytest.fixture
def mock_ollama():
    """Mock Ollama client for testing"""
    with patch('app.llm.llm_client.OllamaLLM') as mock_ollama_class:
        mock_ollama = Mock()
        mock_ollama_class.return_value = mock_ollama
        
        mock_ollama.ainvoke = asyncio.coroutine(lambda x: "Mocked LLM response")
        
        yield mock_ollama

@pytest.fixture
def mock_sentence_transformer():
    """Mock SentenceTransformer for testing"""
    with patch('app.db.vector_store.SentenceTransformer') as mock_st_class:
        mock_st = Mock()
        mock_st_class.return_value = mock_st
        
        # Mock embedding generation
        mock_st.encode.return_value = [0.1] * 1024  # Mock 1024-dimensional embedding
        mock_st.get_sentence_embedding_dimension.return_value = 1024
        
        yield mock_st

@pytest.fixture
def mock_httpx_client():
    """Mock httpx client for testing"""
    with patch('httpx.AsyncClient') as mock_client_class:
        mock_client = Mock()
        mock_client_class.return_value.__aenter__.return_value = mock_client
        
        # Mock successful Ollama responses
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "models": [{"name": "llama3.1:8b"}],
            "response": "Mocked response",
            "prompt_eval_count": 10,
            "eval_count": 20
        }
        
        mock_client.get = asyncio.coroutine(lambda *args, **kwargs: mock_response)
        mock_client.post = asyncio.coroutine(lambda *args, **kwargs: mock_response)
        
        yield mock_client

@pytest.fixture(autouse=True)
def reset_singletons():
    """Reset singleton instances between tests"""
    # Reset vector store
    with patch('app.db.vector_store.vector_store') as mock_vs:
        mock_vs.index = None
        mock_vs.pc = None
        yield
    
    # Reset LLM client cache
    with patch('app.llm.llm_client.llm_client') as mock_llm:
        mock_llm.cache = {}
        yield

@pytest.fixture
def sample_csv_content():
    """Sample CSV content for testing"""
    return """id,name,age,department,salary
1,John Doe,30,Engineering,75000
2,Jane Smith,25,Marketing,60000
3,Bob Johnson,35,Sales,65000
4,Alice Brown,28,Engineering,70000
5,Charlie Wilson,32,Marketing,58000"""

@pytest.fixture
def sample_file_metadata():
    """Sample file metadata for testing"""
    return {
        "filename": "test_data.csv",
        "file_type": "csv",
        "file_size": 1024,
        "uploaded_at": "2025-07-11T10:00:00Z",
        "columns": ["id", "name", "age", "department", "salary"],
        "row_count": 5
    }

# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )

def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers"""
    for item in items:
        # Mark all tests in unit directory as unit tests
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        # Mark all tests in integration directory as integration tests
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
