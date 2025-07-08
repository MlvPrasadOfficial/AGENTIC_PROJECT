# RAG System for Enterprise Insights Copilot
# File: document_store.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Implements a vector store for RAG (Retrieval-Augmented Generation)

from typing import List, Dict, Any, Optional
import os
import uuid
import json
from datetime import datetime
import numpy as np
from pathlib import Path

from app.utils.logger import setup_logger
from app.core.config import settings

# Setup logger
logger = setup_logger(__name__)

class DocumentChunk:
    """A chunk of document with metadata for vector storage"""
    
    def __init__(
        self,
        text: str,
        metadata: Dict[str, Any],
        embedding: Optional[List[float]] = None,
        chunk_id: Optional[str] = None,
    ):
        """
        Initialize a document chunk.
        
        Args:
            text: The text content of the chunk
            metadata: Additional metadata about the chunk
            embedding: Optional pre-computed embedding
            chunk_id: Optional ID for the chunk
        """
        self.text = text
        self.metadata = metadata
        self.embedding = embedding
        self.chunk_id = chunk_id or str(uuid.uuid4())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return {
            "chunk_id": self.chunk_id,
            "text": self.text,
            "metadata": self.metadata,
            "embedding": self.embedding,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DocumentChunk":
        """Create from dictionary"""
        return cls(
            text=data["text"],
            metadata=data["metadata"],
            embedding=data["embedding"],
            chunk_id=data["chunk_id"],
        )


class DocumentStore:
    """
    Simple vector store for RAG implementation.
    For production, this would be replaced with a proper vector database like FAISS or Pinecone.
    """
    
    def __init__(self, persist_directory: Optional[str] = None):
        """
        Initialize the document store.
        
        Args:
            persist_directory: Directory to persist vectors (optional)
        """
        self.documents: List[DocumentChunk] = []
        self.persist_directory = persist_directory or settings.VECTOR_STORE_PATH
        self.embedding_dim = 768  # Default for sentence-transformers models
        
        # Create persist directory if it doesn't exist
        if self.persist_directory:
            os.makedirs(self.persist_directory, exist_ok=True)
            
        # Load any existing documents
        self._load_documents()
    
    def add_document(
        self, 
        text: str, 
        metadata: Dict[str, Any], 
        embedding: Optional[List[float]] = None,
        chunk_id: Optional[str] = None,
    ) -> str:
        """
        Add a document to the store.
        
        Args:
            text: Document text
            metadata: Document metadata
            embedding: Pre-computed embedding (optional)
            chunk_id: Optional chunk ID
            
        Returns:
            chunk_id of the added document
        """
        chunk = DocumentChunk(
            text=text,
            metadata=metadata,
            embedding=embedding,
            chunk_id=chunk_id,
        )
        self.documents.append(chunk)
        self._save_documents()
        return chunk.chunk_id
    
    def add_documents(self, chunks: List[DocumentChunk]) -> List[str]:
        """
        Add multiple documents to the store.
        
        Args:
            chunks: List of document chunks
            
        Returns:
            List of chunk IDs
        """
        chunk_ids = []
        for chunk in chunks:
            self.documents.append(chunk)
            chunk_ids.append(chunk.chunk_id)
        
        self._save_documents()
        return chunk_ids
    
    def search(
        self, 
        query_embedding: List[float], 
        top_k: int = 5,
        metadata_filter: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents.
        
        Args:
            query_embedding: Query vector
            top_k: Number of results to return
            metadata_filter: Optional filter for metadata
            
        Returns:
            List of matching documents with scores
        """
        if not self.documents:
            return []
        
        # Convert to numpy for efficient operations
        query_embedding_np = np.array(query_embedding)
        
        results = []
        for chunk in self.documents:
            # Skip documents without embeddings
            if not chunk.embedding:
                continue
                
            # Apply metadata filter if provided
            if metadata_filter:
                skip = False
                for key, value in metadata_filter.items():
                    if key not in chunk.metadata or chunk.metadata[key] != value:
                        skip = True
                        break
                if skip:
                    continue
            
            # Calculate cosine similarity
            chunk_embedding = np.array(chunk.embedding)
            similarity = np.dot(query_embedding_np, chunk_embedding) / (
                np.linalg.norm(query_embedding_np) * np.linalg.norm(chunk_embedding)
            )
            
            results.append({
                "chunk_id": chunk.chunk_id,
                "text": chunk.text,
                "metadata": chunk.metadata,
                "score": float(similarity),
            })
        
        # Sort by score and return top_k
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
    
    def get_document(self, chunk_id: str) -> Optional[DocumentChunk]:
        """
        Get a document by ID.
        
        Args:
            chunk_id: Document ID
            
        Returns:
            Document chunk or None if not found
        """
        for chunk in self.documents:
            if chunk.chunk_id == chunk_id:
                return chunk
        return None
    
    def delete_document(self, chunk_id: str) -> bool:
        """
        Delete a document.
        
        Args:
            chunk_id: Document ID
            
        Returns:
            True if deleted, False if not found
        """
        for i, chunk in enumerate(self.documents):
            if chunk.chunk_id == chunk_id:
                self.documents.pop(i)
                self._save_documents()
                return True
        return False
    
    def clear(self) -> None:
        """Clear all documents"""
        self.documents = []
        self._save_documents()
    
    def _save_documents(self) -> None:
        """Save documents to disk"""
        if not self.persist_directory:
            return
            
        file_path = Path(self.persist_directory) / "documents.json"
        with open(file_path, "w") as f:
            json.dump(
                [chunk.to_dict() for chunk in self.documents],
                f,
                indent=2
            )
    
    def _load_documents(self) -> None:
        """Load documents from disk"""
        if not self.persist_directory:
            return
            
        file_path = Path(self.persist_directory) / "documents.json"
        if not file_path.exists():
            return
            
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                self.documents = [DocumentChunk.from_dict(chunk) for chunk in data]
                logger.info(f"Loaded {len(self.documents)} documents from disk")
        except Exception as e:
            logger.error(f"Error loading documents: {e}")
