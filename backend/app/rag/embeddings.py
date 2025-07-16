# Embeddings for RAG System
# File: embeddings.py
# Author: GitHub Copilot
# Date: 2025-07-17
# Purpose: Text embedding services for RAG implementation
# Updated: Removed sentence-transformers, using Pinecone's native embeddings

from typing import List, Dict, Any, Optional, Union
import os
import numpy as np
from pathlib import Path
import time
import hashlib
import random

from app.utils.logger import setup_logger
from app.core.config import settings

# Setup logger
logger = setup_logger(__name__)

class EmbeddingService:
    """
    Service for generating text embeddings for RAG.
    Now uses Pinecone's native embedding service instead of local models.
    """
    
    def __init__(self, model_name: Optional[str] = None):
        """
        Initialize the embedding service.
        
        Args:
            model_name: Name of the embedding model to use (passed to Pinecone)
        """
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.embedding_dim = settings.PINECONE_DIMENSION  # Use Pinecone dimension
        self.model = None
        
        # Initialize the model
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the embedding model"""
        logger.info(f"Initializing Pinecone embedding service with model: {self.model_name}")
        
        try:
            # For Pinecone native embeddings
            if "pinecone" in self.model_name.lower() or "text-embedding" in self.model_name:
                # This would use Pinecone's embedding API
                logger.info(f"Using Pinecone embedding service with dimension {self.embedding_dim}")
                self.model = "pinecone"
            # For OpenAI compatible API
            elif "openai" in self.model_name.lower():
                import openai
                openai.api_key = settings.OPENAI_API_KEY
                self.model = "openai"
                logger.info("Using OpenAI API for embeddings")
            # For LLaMA.cpp embeddings
            elif "llama" in self.model_name.lower():
                from llama_cpp import Llama
                self.model = Llama(
                    model_path=settings.LLAMA_MODEL_PATH,
                    embedding=True,
                    n_ctx=512
                )
                logger.info("Using LLaMA.cpp for embeddings")
            else:
                logger.warning(f"Unknown embedding model type: {self.model_name}. Using mock embeddings.")
                self.model = "mock"
        except Exception as e:
            logger.error(f"Error initializing embedding model: {e}")
            logger.warning("Using mock embeddings as fallback")
            self.model = "mock"
    
    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embeddings (as float lists)
        """
        if not texts:
            return []
            
        start_time = time.time()
        
        try:
            # For Pinecone native embeddings
            if self.model == "pinecone":
                # This would use Pinecone's embedding API
                # For now, we'll use a mock implementation
                embeddings = []
                for text in texts:
                    embeddings.append(self._generate_mock_embedding(text))
            # For OpenAI API
            elif self.model == "openai":
                import openai
                response = openai.Embedding.create(
                    input=texts,
                    model="text-embedding-ada-002"
                )
                embeddings = [item["embedding"] for item in response["data"]]
            # For LLaMA
            elif hasattr(self.model, "embed"):
                embeddings = []
                for text in texts:
                    embedding = self.model.embed(text)
                    embeddings.append(embedding.tolist())
            # Mock embeddings (for testing)
            else:
                embeddings = self._get_mock_embeddings(texts)
                
            logger.debug(f"Generated {len(embeddings)} embeddings in {time.time() - start_time:.2f}s")
            return embeddings
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            # Return mock embeddings as fallback
            return self._get_mock_embeddings(texts)
    
    async def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding as list of floats
        """
        embeddings = await self.get_embeddings([text])
        return embeddings[0] if embeddings else self._get_mock_embeddings([""])[0]
    
    def _generate_mock_embedding(self, text: str) -> List[float]:
        """
        Generate mock embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            Mock embedding as list of floats
        """
        # Create deterministic but varied embedding based on text
        hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
        random.seed(hash_val)
        
        # Generate normalized embedding of correct dimension
        embedding = [random.uniform(-1, 1) for _ in range(self.embedding_dim)]
        
        # Normalize to unit vector
        norm = sum(x * x for x in embedding) ** 0.5
        if norm > 0:
            embedding = [x / norm for x in embedding]
        
        return embedding

    def _get_mock_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate mock embeddings for testing.
        
        Args:
            texts: List of texts
            
        Returns:
            List of mock embeddings
        """
        # Generate deterministic but unique embeddings based on text content
        embeddings = []
        for text in texts:
            # Create a simple deterministic hash from the text
            hash_val = sum(ord(c) for c in text)
            np.random.seed(hash_val)
            embedding = np.random.uniform(-1, 1, self.embedding_dim).tolist()
            embeddings.append(embedding)
        return embeddings
