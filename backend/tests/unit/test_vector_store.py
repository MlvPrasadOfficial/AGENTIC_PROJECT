# Unit Tests for Vector Store
# File: test_vector_store.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Unit tests for Pinecone vector store integration

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from typing import List

from app.db.vector_store import PineconeVectorStore, VectorDocument, VectorSearchResult
from app.core.config import settings

class TestPineconeVectorStore:
    """Unit tests for PineconeVectorStore class"""
    
    @pytest.fixture
    def vector_store(self):
        """Create a vector store instance for testing"""
        return PineconeVectorStore()
    
    @pytest.fixture
    def sample_documents(self):
        """Create sample documents for testing"""
        return [
            VectorDocument(
                id="doc1",
                content="This is a test document about machine learning.",
                metadata={"category": "tech", "source": "test"}
            ),
            VectorDocument(
                id="doc2",
                content="Another document discussing artificial intelligence trends.",
                metadata={"category": "tech", "source": "test"}
            )
        ]
    
    def test_initialization(self, vector_store):
        """Test vector store initialization"""
        assert vector_store.dimension > 0
        assert vector_store.index_name == settings.PINECONE_INDEX_NAME
        assert vector_store.embedding_model is not None
    
    def test_generate_embedding(self, vector_store):
        """Test embedding generation"""
        text = "This is a test sentence."
        embedding = vector_store.generate_embedding(text)
        
        assert isinstance(embedding, list)
        assert len(embedding) == vector_store.dimension
        assert all(isinstance(x, float) for x in embedding)
    
    def test_generate_embedding_empty_text(self, vector_store):
        """Test embedding generation with empty text"""
        embedding = vector_store.generate_embedding("")
        
        assert isinstance(embedding, list)
        assert len(embedding) == vector_store.dimension
    
    @patch('app.db.vector_store.Pinecone')
    async def test_initialize_success(self, mock_pinecone, vector_store):
        """Test successful Pinecone initialization"""
        # Mock Pinecone client
        mock_pc = Mock()
        mock_pinecone.return_value = mock_pc
        
        # Mock list_indexes
        mock_pc.list_indexes.return_value.names = ["existing_index"]
        
        # Mock index connection
        mock_index = Mock()
        mock_pc.Index.return_value = mock_index
        
        # Set API key for test
        with patch.object(settings, 'PINECONE_API_KEY', 'test_key'):
            result = await vector_store.initialize()
        
        assert result is True
        assert vector_store.pc == mock_pc
        assert vector_store.index == mock_index
    
    async def test_initialize_no_api_key(self, vector_store):
        """Test initialization without API key"""
        with patch.object(settings, 'PINECONE_API_KEY', None):
            result = await vector_store.initialize()
        
        assert result is False
    
    @patch('app.db.vector_store.Pinecone')
    async def test_initialize_create_index(self, mock_pinecone, vector_store):
        """Test index creation during initialization"""
        # Mock Pinecone client
        mock_pc = Mock()
        mock_pinecone.return_value = mock_pc
        
        # Mock empty index list
        mock_pc.list_indexes.return_value.names = []
        
        # Mock index creation and status
        mock_pc.describe_index.return_value.status = {'ready': True}
        mock_index = Mock()
        mock_pc.Index.return_value = mock_index
        
        with patch.object(settings, 'PINECONE_API_KEY', 'test_key'):
            result = await vector_store.initialize()
        
        assert result is True
        mock_pc.create_index.assert_called_once()
    
    async def test_upsert_documents_no_index(self, vector_store, sample_documents):
        """Test upserting documents without initialized index"""
        vector_store.index = None
        
        result = await vector_store.upsert_documents(sample_documents)
        
        assert result is False
    
    async def test_upsert_documents_success(self, vector_store, sample_documents):
        """Test successful document upserting"""
        # Mock index
        mock_index = Mock()
        vector_store.index = mock_index
        
        result = await vector_store.upsert_documents(sample_documents)
        
        assert result is True
        mock_index.upsert.assert_called()
    
    async def test_search_no_index(self, vector_store):
        """Test search without initialized index"""
        vector_store.index = None
        
        results = await vector_store.search("test query")
        
        assert results == []
    
    async def test_search_success(self, vector_store):
        """Test successful search"""
        # Mock index and search response
        mock_index = Mock()
        vector_store.index = mock_index
        
        # Mock search response
        mock_match = Mock()
        mock_match.id = "doc1"
        mock_match.score = 0.85
        mock_match.metadata = {"content": "test content", "category": "tech"}
        
        mock_index.query.return_value.matches = [mock_match]
        
        results = await vector_store.search("test query")
        
        assert len(results) == 1
        assert isinstance(results[0], VectorSearchResult)
        assert results[0].id == "doc1"
        assert results[0].score == 0.85
    
    async def test_delete_documents_no_index(self, vector_store):
        """Test deleting documents without initialized index"""
        vector_store.index = None
        
        result = await vector_store.delete_documents(["doc1", "doc2"])
        
        assert result is False
    
    async def test_delete_documents_success(self, vector_store):
        """Test successful document deletion"""
        # Mock index
        mock_index = Mock()
        vector_store.index = mock_index
        
        result = await vector_store.delete_documents(["doc1", "doc2"])
        
        assert result is True
        mock_index.delete.assert_called_once()
    
    async def test_get_index_stats_no_index(self, vector_store):
        """Test getting stats without initialized index"""
        vector_store.index = None
        
        stats = await vector_store.get_index_stats()
        
        assert stats == {}
    
    async def test_get_index_stats_success(self, vector_store):
        """Test successful stats retrieval"""
        # Mock index and stats
        mock_index = Mock()
        vector_store.index = mock_index
        
        mock_stats = Mock()
        mock_stats.total_vector_count = 100
        mock_stats.dimension = 384
        mock_stats.index_fullness = 0.1
        mock_stats.namespaces = {}
        
        mock_index.describe_index_stats.return_value = mock_stats
        
        stats = await vector_store.get_index_stats()
        
        assert stats["total_vectors"] == 100
        assert stats["dimension"] == 384
        assert stats["index_fullness"] == 0.1

# Test configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
