# Vector Service
# File: vector_service.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: Service layer for vector operations in Enterprise Insights Copilot

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.db.vector_store import vector_store, VectorDocument, VectorSearchResult
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class VectorService:
    """
    Service layer for vector database operations.
    Handles document indexing and semantic search capabilities.
    """
    
    def __init__(self):
        """Initialize vector service"""
        self.vector_store = vector_store
    
    async def initialize(self) -> bool:
        """
        Initialize the vector service and underlying store.
        
        Returns:
            True if initialization successful
        """
        try:
            success = await self.vector_store.initialize()
            if success:
                logger.info("Vector service initialized successfully")
            else:
                logger.warning("Vector service initialized in fallback mode (no Pinecone)")
            return success
        except Exception as e:
            logger.error(f"Failed to initialize vector service: {e}")
            return False
    
    async def index_file_content(self, 
                               file_id: str, 
                               content: str, 
                               metadata: Dict[str, Any]) -> bool:
        """
        Index file content for semantic search.
        
        Args:
            file_id: Unique file identifier
            content: File content to index
            metadata: Additional metadata about the file
            
        Returns:
            True if indexing successful
        """
        try:
            # Split content into chunks if it's too large
            chunks = self._split_content(content)
            documents = []
            
            for i, chunk in enumerate(chunks):
                doc_id = f"{file_id}_chunk_{i}"
                doc_metadata = metadata.copy()
                doc_metadata.update({
                    "file_id": file_id,
                    "chunk_index": i,
                    "chunk_count": len(chunks),
                    "content_type": "file_chunk"
                })
                
                document = VectorDocument(
                    id=doc_id,
                    content=chunk,
                    metadata=doc_metadata
                )
                documents.append(document)
            
            # Upsert documents to vector store
            success = await self.vector_store.upsert_documents(documents)
            
            if success:
                logger.info(f"Successfully indexed file {file_id} in {len(chunks)} chunks")
            else:
                logger.error(f"Failed to index file {file_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error indexing file content: {e}")
            return False
    
    async def index_insight(self, 
                          insight_id: str, 
                          insight_text: str, 
                          metadata: Dict[str, Any]) -> bool:
        """
        Index generated insights for future retrieval.
        
        Args:
            insight_id: Unique insight identifier
            insight_text: The insight content
            metadata: Additional metadata
            
        Returns:
            True if indexing successful
        """
        try:
            doc_metadata = metadata.copy()
            doc_metadata.update({
                "content_type": "insight",
                "generated_at": datetime.now().isoformat()
            })
            
            document = VectorDocument(
                id=insight_id,
                content=insight_text,
                metadata=doc_metadata
            )
            
            success = await self.vector_store.upsert_documents([document])
            
            if success:
                logger.info(f"Successfully indexed insight {insight_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error indexing insight: {e}")
            return False
    
    async def search_similar_content(self, 
                                   query: str, 
                                   content_type: Optional[str] = None,
                                   file_id: Optional[str] = None,
                                   top_k: int = 5) -> List[VectorSearchResult]:
        """
        Search for similar content using semantic search.
        
        Args:
            query: Search query
            content_type: Filter by content type (e.g., "file_chunk", "insight")
            file_id: Filter by specific file ID
            top_k: Number of results to return
            
        Returns:
            List of similar documents
        """
        try:
            # Build filters
            filters = {}
            if content_type:
                filters["content_type"] = content_type
            if file_id:
                filters["file_id"] = file_id
            
            # Perform search
            results = await self.vector_store.search(
                query=query,
                top_k=top_k,
                filter_dict=filters if filters else None
            )
            
            logger.info(f"Found {len(results)} similar documents for query: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Error searching similar content: {e}")
            return []
    
    async def get_file_chunks(self, file_id: str) -> List[VectorSearchResult]:
        """
        Get all chunks for a specific file.
        
        Args:
            file_id: File identifier
            
        Returns:
            List of file chunks
        """
        try:
            # Search with file_id filter and empty query to get all chunks
            results = await self.vector_store.search(
                query="",  # Empty query to match all
                top_k=100,  # High limit to get all chunks
                filter_dict={"file_id": file_id, "content_type": "file_chunk"}
            )
            
            # Sort by chunk index
            results.sort(key=lambda x: x.metadata.get("chunk_index", 0))
            
            logger.info(f"Retrieved {len(results)} chunks for file {file_id}")
            return results
            
        except Exception as e:
            logger.error(f"Error getting file chunks: {e}")
            return []
    
    async def delete_file_vectors(self, file_id: str) -> bool:
        """
        Delete all vectors associated with a file.
        
        Args:
            file_id: File identifier
            
        Returns:
            True if deletion successful
        """
        try:
            # Get all chunks for the file
            chunks = await self.get_file_chunks(file_id)
            
            if not chunks:
                logger.info(f"No vectors found for file {file_id}")
                return True
            
            # Extract document IDs
            doc_ids = [chunk.id for chunk in chunks]
            
            # Delete documents
            success = await self.vector_store.delete_documents(doc_ids)
            
            if success:
                logger.info(f"Successfully deleted {len(doc_ids)} vectors for file {file_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error deleting file vectors: {e}")
            return False
    
    async def get_store_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the vector store.
        
        Returns:
            Dictionary with store statistics
        """
        try:
            stats = await self.vector_store.get_index_stats()
            return stats
        except Exception as e:
            logger.error(f"Error getting store stats: {e}")
            return {}
    
    def _split_content(self, content: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
        """
        Split content into overlapping chunks for better embedding.
        
        Args:
            content: Content to split
            chunk_size: Maximum characters per chunk
            overlap: Character overlap between chunks
            
        Returns:
            List of content chunks
        """
        if len(content) <= chunk_size:
            return [content]
        
        chunks = []
        start = 0
        
        while start < len(content):
            end = start + chunk_size
            
            # Try to split at word boundary
            if end < len(content):
                # Find last space before the limit
                last_space = content.rfind(' ', start, end)
                if last_space > start:
                    end = last_space
            
            chunk = content[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - overlap
            
            # Avoid infinite loop
            if start >= end:
                start = end
        
        return chunks

# Create singleton instance
vector_service = VectorService()

async def get_vector_service() -> VectorService:
    """Get vector service instance for dependency injection"""
    return vector_service
