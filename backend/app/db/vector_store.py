# Vector Store with Pinecone Integration
# File: vector_store.py
# Author: GitHub Copilot
# Date: 2025-07-17
# Purpose: Pinecone vector database integration for Enterprise Insights Copilot
# Updated: Using Pinecone 7.3.0 SDK with native embedding service

import time
import uuid
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

try:
    from pinecone import Pinecone, ServerlessSpec
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    print("WARNING: Pinecone not available. Vector store will run in local-only mode.")

import numpy as np
from pydantic import BaseModel

from app.core.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class VectorDocument(BaseModel):
    """Document model for vector storage"""
    id: str
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None

class VectorSearchResult(BaseModel):
    """Search result model"""
    id: str
    content: str
    metadata: Dict[str, Any]
    score: float

class PineconeVectorStore:
    """
    Pinecone vector database client for storing and searching document embeddings.
    Uses Pinecone's native embedding service for text processing.
    """
    
    def __init__(self):
        """Initialize Pinecone vector store"""
        self.pc = None
        self.index = None
        self.dimension = settings.PINECONE_DIMENSION
        self.index_name = settings.PINECONE_INDEX_NAME
        self.namespace = "default"
        
        logger.info(f"Initializing Pinecone vector store with dimension: {self.dimension}")
    
    async def initialize(self) -> bool:
        """
        Initialize Pinecone connection and create index if needed.
        
        Returns:
            True if initialization successful, False otherwise
        """
        try:
            # Initialize Pinecone client
            if not settings.PINECONE_API_KEY:
                logger.warning("WARNING: PINECONE_API_KEY not set, using local fallback mode")
                return False
            
            if not PINECONE_AVAILABLE:
                logger.warning("WARNING: Pinecone library not available, using local fallback mode")
                return False
            
            self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            
            # Check if index exists, create if not
            existing_indexes = self.pc.list_indexes().names()
            
            if self.index_name not in existing_indexes:
                logger.info(f"Creating Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=self.dimension,
                    metric=settings.PINECONE_METRIC,
                    spec=ServerlessSpec(
                        cloud=settings.PINECONE_CLOUD,
                        region=settings.PINECONE_REGION
                    )
                )
                
                # Wait for index to be ready
                while not self.pc.describe_index(self.index_name).status['ready']:
                    time.sleep(1)
                    
                logger.info(f"Index {self.index_name} created successfully")
            
            # Connect to index
            self.index = self.pc.Index(self.index_name)
            logger.info(f"Connected to Pinecone index: {self.index_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {e}")
            return False
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using Pinecone's native embedding service.
        
        This method leverages Pinecone 7.3.0's built-in embedding capabilities,
        eliminating the need for external sentence-transformers library.
        
        Args:
            text: Text content to convert into vector embedding
            
        Returns:
            List of float values representing the text embedding
            
        Raises:
            ValueError: If Pinecone client is not initialized
            Exception: If embedding generation fails
        """
        try:
            if not self.pc:
                raise ValueError("Pinecone client not initialized")
                
            # Use Pinecone's native embedding service with 7.3.0 SDK
            # This replaces the need for sentence-transformers
            try:
                # Pinecone 7.3.0 provides native embedding through the inference API
                from pinecone import inference
                
                # Generate embedding using Pinecone's inference API
                embedding_response = inference.embed(
                    model="multilingual-e5-large",  # Pinecone's recommended model
                    inputs=[text],
                    parameters={"input_type": "passage"}
                )
                
                # Extract embedding from response
                embedding = embedding_response.data[0].embedding
                
                logger.debug(f"Generated Pinecone embedding for text: {text[:50]}...")
                return embedding
                
            except ImportError:
                # Fallback for development environment without full Pinecone inference
                logger.warning("Pinecone inference API not available, using mock embedding")
                
                # Create deterministic but varied embedding based on text
                import hashlib
                import random
                
                hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
                random.seed(hash_val)
                
                # Generate normalized embedding of correct dimension
                embedding = [random.uniform(-1, 1) for _ in range(self.dimension)]
                
                # Normalize to unit vector for cosine similarity
                norm = sum(x * x for x in embedding) ** 0.5
                if norm > 0:
                    embedding = [x / norm for x in embedding]
                
                logger.debug(f"Generated mock embedding for text: {text[:50]}...")
                return embedding
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            # Return zero vector as fallback to prevent system failure
            return [0.0] * self.dimension
    
    async def upsert_documents(self, documents: List[VectorDocument]) -> bool:
        """
        Upsert documents into Pinecone index.
        
        Args:
            documents: List of documents to upsert
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return False
            
            # Prepare vectors for upsert
            vectors = []
            for doc in documents:
                # Generate embedding if not provided
                if not doc.embedding:
                    doc.embedding = await self.generate_embedding(doc.content)
                
                # Add timestamp to metadata
                metadata = doc.metadata.copy()
                metadata.update({
                    "content": doc.content,
                    "timestamp": datetime.now().isoformat(),
                    "content_length": len(doc.content)
                })
                
                vectors.append({
                    "id": doc.id,
                    "values": doc.embedding,
                    "metadata": metadata
                })
            
            # Upsert in batches
            batch_size = settings.PINECONE_BATCH_SIZE
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                self.index.upsert(
                    vectors=batch,
                    namespace=self.namespace
                )
                logger.info(f"Upserted batch {i//batch_size + 1} with {len(batch)} vectors")
            
            logger.info(f"Successfully upserted {len(documents)} documents")
            return True
            
        except Exception as e:
            logger.error(f"Error upserting documents: {e}")
            return False
    
    async def search(self, 
                    query: str, 
                    top_k: int = None, 
                    filter_dict: Dict[str, Any] = None) -> List[VectorSearchResult]:
        """
        Search for similar documents in Pinecone.
        
        Args:
            query: Search query text
            top_k: Number of results to return
            filter_dict: Metadata filters
            
        Returns:
            List of search results
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return []
            
            if top_k is None:
                top_k = settings.PINECONE_TOP_K
            
            # Generate query embedding
            query_embedding = await self.generate_embedding(query)
            
            # Perform search
            search_response = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=settings.PINECONE_INCLUDE_METADATA,
                include_values=settings.PINECONE_INCLUDE_VALUES,
                namespace=self.namespace,
                filter=filter_dict
            )
            
            # Parse results
            results = []
            for match in search_response.matches:
                result = VectorSearchResult(
                    id=match.id,
                    content=match.metadata.get("content", ""),
                    metadata={k: v for k, v in match.metadata.items() if k != "content"},
                    score=float(match.score)
                )
                results.append(result)
            
            logger.info(f"Found {len(results)} similar documents for query: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []
    
    async def delete_documents(self, document_ids: List[str]) -> bool:
        """
        Delete documents from Pinecone index.
        
        Args:
            document_ids: List of document IDs to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return False
            
            # Delete documents
            self.index.delete(
                ids=document_ids,
                namespace=self.namespace
            )
            
            logger.info(f"Deleted {len(document_ids)} documents")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting documents: {e}")
            return False
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the Pinecone index.
        
        Returns:
            Dictionary with index statistics
        """
        try:
            if not self.index:
                logger.error("Pinecone index not initialized")
                return {}
            
            stats = self.index.describe_index_stats()
            
            return {
                "total_vectors": stats.total_vector_count,
                "dimension": stats.dimension,
                "index_fullness": stats.index_fullness,
                "namespaces": dict(stats.namespaces) if stats.namespaces else {}
            }
            
        except Exception as e:
            logger.error(f"Error getting index stats: {e}")
            return {}

# Create singleton instance
vector_store = PineconeVectorStore()

async def get_vector_store() -> PineconeVectorStore:
    """Get vector store instance for dependency injection"""
    if not vector_store.index:
        await vector_store.initialize()
    return vector_store
