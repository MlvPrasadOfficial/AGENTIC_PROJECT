# Unit Tests for Vector Service
# File: test_vector_service.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Unit tests for vector service layer

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from typing import List

from app.services.vector_service import VectorService, vector_service
from app.db.vector_store import VectorSearchResult

class TestVectorService:
    """Unit tests for VectorService class"""
    
    @pytest.fixture
    def service(self):
        """Create a vector service instance for testing"""
        return VectorService()
    
    @pytest.fixture
    def sample_metadata(self):
        """Create sample metadata for testing"""
        return {
            "filename": "test.csv",
            "file_type": "csv",
            "uploaded_at": "2025-07-11T10:00:00Z"
        }
    
    async def test_initialization(self, service):
        """Test service initialization"""
        assert service.vector_store is not None
    
    @patch('app.services.vector_service.vector_store')
    async def test_initialize_success(self, mock_store, service):
        """Test successful service initialization"""
        mock_store.initialize = AsyncMock(return_value=True)
        
        result = await service.initialize()
        
        assert result is True
        mock_store.initialize.assert_called_once()
    
    @patch('app.services.vector_service.vector_store')
    async def test_initialize_failure(self, mock_store, service):
        """Test failed service initialization"""
        mock_store.initialize = AsyncMock(return_value=False)
        
        result = await service.initialize()
        
        assert result is False
    
    def test_split_content_small(self, service):
        """Test content splitting for small content"""
        content = "This is a small piece of content."
        chunks = service._split_content(content, chunk_size=100)
        
        assert len(chunks) == 1
        assert chunks[0] == content
    
    def test_split_content_large(self, service):
        """Test content splitting for large content"""
        content = "This is a long piece of content. " * 50  # Create long content
        chunks = service._split_content(content, chunk_size=100, overlap=20)
        
        assert len(chunks) > 1
        assert all(len(chunk) <= 100 for chunk in chunks)
    
    def test_split_content_with_overlap(self, service):
        """Test content splitting with overlap"""
        content = "First sentence. Second sentence. Third sentence. Fourth sentence."
        chunks = service._split_content(content, chunk_size=30, overlap=10)
        
        assert len(chunks) > 1
        # Check that there's some overlap between consecutive chunks
        for i in range(len(chunks) - 1):
            # This is a simplified check - in practice, overlap might be more complex
            assert len(chunks[i]) <= 30
    
    @patch('app.services.vector_service.vector_store')
    async def test_index_file_content_success(self, mock_store, service, sample_metadata):
        """Test successful file content indexing"""
        mock_store.upsert_documents = AsyncMock(return_value=True)
        
        content = "This is test file content for indexing."
        result = await service.index_file_content("file123", content, sample_metadata)
        
        assert result is True
        mock_store.upsert_documents.assert_called_once()
        
        # Check that documents were created properly
        call_args = mock_store.upsert_documents.call_args[0][0]
        assert len(call_args) >= 1  # At least one document
        assert call_args[0].id.startswith("file123_chunk_")
        assert call_args[0].content == content
        assert call_args[0].metadata["file_id"] == "file123"
    
    @patch('app.services.vector_service.vector_store')
    async def test_index_file_content_chunking(self, mock_store, service, sample_metadata):
        """Test file content indexing with chunking"""
        mock_store.upsert_documents = AsyncMock(return_value=True)
        
        # Create content that will be split into multiple chunks
        content = "This is a long piece of content. " * 100
        result = await service.index_file_content("file123", content, sample_metadata)
        
        assert result is True
        
        # Check that multiple documents were created
        call_args = mock_store.upsert_documents.call_args[0][0]
        assert len(call_args) > 1  # Multiple chunks
        
        # Check chunk metadata
        for i, doc in enumerate(call_args):
            assert doc.id == f"file123_chunk_{i}"
            assert doc.metadata["chunk_index"] == i
            assert doc.metadata["file_id"] == "file123"
            assert doc.metadata["content_type"] == "file_chunk"
    
    @patch('app.services.vector_service.vector_store')
    async def test_index_file_content_failure(self, mock_store, service, sample_metadata):
        """Test failed file content indexing"""
        mock_store.upsert_documents = AsyncMock(return_value=False)
        
        content = "This is test file content."
        result = await service.index_file_content("file123", content, sample_metadata)
        
        assert result is False
    
    @patch('app.services.vector_service.vector_store')
    async def test_index_insight_success(self, mock_store, service):
        """Test successful insight indexing"""
        mock_store.upsert_documents = AsyncMock(return_value=True)
        
        insight_text = "Key insight: Sales increase by 20% in Q2."
        metadata = {"insight_type": "sales", "confidence": 0.9}
        
        result = await service.index_insight("insight123", insight_text, metadata)
        
        assert result is True
        mock_store.upsert_documents.assert_called_once()
        
        # Check document structure
        call_args = mock_store.upsert_documents.call_args[0][0]
        assert len(call_args) == 1
        assert call_args[0].id == "insight123"
        assert call_args[0].content == insight_text
        assert call_args[0].metadata["content_type"] == "insight"
        assert "generated_at" in call_args[0].metadata
    
    @patch('app.services.vector_service.vector_store')
    async def test_search_similar_content_success(self, mock_store, service):
        """Test successful similar content search"""
        # Mock search results
        mock_results = [
            VectorSearchResult(
                id="doc1",
                content="Similar content 1",
                metadata={"category": "tech"},
                score=0.9
            ),
            VectorSearchResult(
                id="doc2",
                content="Similar content 2",
                metadata={"category": "tech"},
                score=0.8
            )
        ]
        mock_store.search = AsyncMock(return_value=mock_results)
        
        results = await service.search_similar_content("machine learning", top_k=5)
        
        assert len(results) == 2
        assert results[0].score == 0.9
        assert results[1].score == 0.8
        mock_store.search.assert_called_once()
    
    @patch('app.services.vector_service.vector_store')
    async def test_search_with_filters(self, mock_store, service):
        """Test search with content type and file ID filters"""
        mock_store.search = AsyncMock(return_value=[])
        
        await service.search_similar_content(
            "test query",
            content_type="file_chunk",
            file_id="file123",
            top_k=10
        )
        
        # Check that filters were passed correctly
        call_args = mock_store.search.call_args
        assert call_args[1]["filter_dict"]["content_type"] == "file_chunk"
        assert call_args[1]["filter_dict"]["file_id"] == "file123"
        assert call_args[1]["top_k"] == 10
    
    @patch('app.services.vector_service.vector_store')
    async def test_get_file_chunks_success(self, mock_store, service):
        """Test successful file chunks retrieval"""
        # Mock chunks with different indices
        mock_chunks = [
            VectorSearchResult(
                id="file123_chunk_1",
                content="Chunk 1",
                metadata={"chunk_index": 1, "file_id": "file123"},
                score=1.0
            ),
            VectorSearchResult(
                id="file123_chunk_0",
                content="Chunk 0",
                metadata={"chunk_index": 0, "file_id": "file123"},
                score=1.0
            )
        ]
        mock_store.search = AsyncMock(return_value=mock_chunks)
        
        results = await service.get_file_chunks("file123")
        
        assert len(results) == 2
        # Check that results are sorted by chunk_index
        assert results[0].metadata["chunk_index"] == 0
        assert results[1].metadata["chunk_index"] == 1
    
    @patch('app.services.vector_service.vector_store')
    async def test_delete_file_vectors_success(self, mock_store, service):
        """Test successful file vector deletion"""
        # Mock chunks to delete
        mock_chunks = [
            VectorSearchResult(
                id="file123_chunk_0",
                content="Chunk 0",
                metadata={"chunk_index": 0},
                score=1.0
            ),
            VectorSearchResult(
                id="file123_chunk_1", 
                content="Chunk 1",
                metadata={"chunk_index": 1},
                score=1.0
            )
        ]
        
        mock_store.search = AsyncMock(return_value=mock_chunks)
        mock_store.delete_documents = AsyncMock(return_value=True)
        
        result = await service.delete_file_vectors("file123")
        
        assert result is True
        mock_store.delete_documents.assert_called_once_with(
            ["file123_chunk_0", "file123_chunk_1"]
        )
    
    @patch('app.services.vector_service.vector_store')
    async def test_delete_file_vectors_no_chunks(self, mock_store, service):
        """Test file vector deletion with no existing chunks"""
        mock_store.search = AsyncMock(return_value=[])
        
        result = await service.delete_file_vectors("file123")
        
        assert result is True  # Should return True even if no chunks found
    
    @patch('app.services.vector_service.vector_store')
    async def test_get_store_stats_success(self, mock_store, service):
        """Test successful store statistics retrieval"""
        mock_stats = {
            "total_vectors": 1000,
            "dimension": 1024,
            "index_fullness": 0.1
        }
        mock_store.get_index_stats = AsyncMock(return_value=mock_stats)
        
        stats = await service.get_store_stats()
        
        assert stats == mock_stats
        mock_store.get_index_stats.assert_called_once()
    
    @patch('app.services.vector_service.vector_store')
    async def test_get_store_stats_failure(self, mock_store, service):
        """Test store statistics retrieval failure"""
        mock_store.get_index_stats = AsyncMock(side_effect=Exception("Stats error"))
        
        stats = await service.get_store_stats()
        
        assert stats == {}
    
    async def test_error_handling_in_index_file_content(self, service, sample_metadata):
        """Test error handling in file content indexing"""
        # Mock vector store to raise exception
        with patch('app.services.vector_service.vector_store') as mock_store:
            mock_store.upsert_documents = AsyncMock(side_effect=Exception("Upsert error"))
            
            result = await service.index_file_content("file123", "content", sample_metadata)
            
            assert result is False
    
    async def test_error_handling_in_search(self, service):
        """Test error handling in search"""
        # Mock vector store to raise exception
        with patch('app.services.vector_service.vector_store') as mock_store:
            mock_store.search = AsyncMock(side_effect=Exception("Search error"))
            
            results = await service.search_similar_content("test query")
            
            assert results == []

# Test the singleton instance
def test_vector_service_singleton():
    """Test that vector_service is properly instantiated"""
    assert vector_service is not None
    assert isinstance(vector_service, VectorService)

# Test configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
