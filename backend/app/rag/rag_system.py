# RAG System
# File: rag_system.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Retrieval-Augmented Generation system for enhanced insights

import os
import time
import json
import pickle
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from pathlib import Path
import pandas as pd

from app.core.config import settings
from app.utils.logger import setup_logger
from app.llm.llm_client import llm_client, LLMRequest

# Setup logger
logger = setup_logger(__name__)

class RAGSystem:
    """
    Retrieval-Augmented Generation system for enhancing LLM responses with
    relevant data from the dataset.
    """
    
    def __init__(self):
        """Initialize the RAG system"""
        self.chunk_size = settings.RAG_CHUNK_SIZE
        self.chunk_overlap = settings.RAG_CHUNK_OVERLAP
        self.index_dir = Path(settings.RAG_INDEX_DIR)
        self.embedding_dim = settings.RAG_EMBEDDING_DIM
        
        # Ensure index directory exists
        if not self.index_dir.exists():
            self.index_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created RAG index directory at {self.index_dir}")
    
    async def index_dataset(self, file_id: str, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Create index for a dataset to enable efficient retrieval.
        
        Args:
            file_id: ID of the file
            data: Pandas DataFrame of the dataset
            
        Returns:
            Index metadata
        """
        start_time = time.time()
        logger.info(f"Creating RAG index for file ID: {file_id}")
        
        try:
            # Convert dataset to documents
            documents = self._dataframe_to_documents(data)
            
            # Create chunks
            chunks = self._create_chunks(documents)
            logger.info(f"Created {len(chunks)} chunks from dataset")
            
            # Create embeddings
            embeddings = await self._create_embeddings(chunks)
            
            # Save index
            index_path = self.index_dir / f"{file_id}.pickle"
            index_data = {
                "chunks": chunks,
                "embeddings": embeddings,
                "file_id": file_id,
                "created_at": time.time()
            }
            
            with open(index_path, "wb") as f:
                pickle.dump(index_data, f)
                
            metadata = {
                "file_id": file_id,
                "chunks": len(chunks),
                "embedding_dim": self.embedding_dim,
                "index_path": str(index_path),
                "processing_time": time.time() - start_time
            }
            
            logger.info(f"RAG index created for file ID {file_id}, processing time: {metadata['processing_time']:.2f}s")
            return metadata
            
        except Exception as e:
            logger.error(f"Error creating RAG index: {str(e)}")
            raise
    
    async def retrieve_context(self, file_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context for a query from the indexed dataset.
        
        Args:
            file_id: ID of the file
            query: User query
            top_k: Number of most relevant chunks to retrieve
            
        Returns:
            List of relevant chunks with text and metadata
        """
        try:
            # Load index
            index_path = self.index_dir / f"{file_id}.pickle"
            if not index_path.exists():
                logger.error(f"RAG index not found for file ID: {file_id}")
                return []
                
            with open(index_path, "rb") as f:
                index_data = pickle.load(f)
                
            # Create query embedding
            query_embedding = await self._embed_text(query)
            
            # Calculate similarities
            similarities = self._calculate_similarities(query_embedding, index_data["embeddings"])
            
            # Get top_k chunks
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            results = []
            for idx in top_indices:
                chunk = index_data["chunks"][idx]
                results.append({
                    "text": chunk["text"],
                    "metadata": chunk["metadata"],
                    "similarity": float(similarities[idx])
                })
                
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            return []
    
    async def generate_augmented_response(self, 
                                         file_id: str, 
                                         query: str, 
                                         system_message: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a response augmented with relevant context.
        
        Args:
            file_id: ID of the file
            query: User query
            system_message: Optional system message
            
        Returns:
            Dictionary with response and context information
        """
        try:
            # Retrieve relevant chunks
            relevant_chunks = await self.retrieve_context(file_id, query)
            
            if not relevant_chunks:
                logger.warning(f"No relevant context found for query: {query}")
                # Fall back to regular LLM call
                llm_response = await llm_client.generate(
                    LLMRequest(
                        prompt=query,
                        system_message=system_message or settings.DEFAULT_SYSTEM_MESSAGE
                    )
                )
                return {
                    "response": llm_response.text,
                    "augmented": False,
                    "context_chunks": [],
                    "processing_time": llm_response.processing_time
                }
            
            # Prepare augmented prompt
            context_text = "\n\n".join([f"CONTEXT {i+1}:\n{chunk['text']}" for i, chunk in enumerate(relevant_chunks)])
            augmented_prompt = f"""Answer the following question based on the provided context. If the context doesn't contain relevant information, say so.

CONTEXTS:
{context_text}

QUESTION: {query}

Please provide a comprehensive answer."""
            
            # Generate response
            llm_response = await llm_client.generate(
                LLMRequest(
                    prompt=augmented_prompt,
                    system_message=system_message or settings.DEFAULT_SYSTEM_MESSAGE,
                    temperature=0.3
                )
            )
            
            return {
                "response": llm_response.text,
                "augmented": True,
                "context_chunks": relevant_chunks,
                "processing_time": llm_response.processing_time
            }
            
        except Exception as e:
            logger.error(f"Error generating augmented response: {str(e)}")
            return {
                "response": "I encountered an error while processing your request with relevant context.",
                "augmented": False,
                "context_chunks": [],
                "processing_time": 0
            }
    
    def _dataframe_to_documents(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Convert a pandas DataFrame to a list of documents.
        
        Args:
            data: Pandas DataFrame
            
        Returns:
            List of documents with text and metadata
        """
        documents = []
        
        # Convert each row to a document
        for i, row in data.iterrows():
            # Convert row to string representation
            row_text = "\n".join([f"{col}: {val}" for col, val in row.items()])
            
            documents.append({
                "text": row_text,
                "metadata": {
                    "row_index": i,
                    "columns": list(data.columns)
                }
            })
            
        # Also add column descriptions
        column_descriptions = "\n".join([f"Column '{col}': {data[col].dtype}" for col in data.columns])
        documents.append({
            "text": f"Dataset Schema:\n{column_descriptions}",
            "metadata": {
                "type": "schema",
                "columns": list(data.columns)
            }
        })
        
        # Add statistical summary
        try:
            stats_text = "Dataset Statistics:\n"
            for col in data.select_dtypes(include=np.number).columns:
                stats = data[col].describe()
                stats_text += f"\nColumn '{col}':\n"
                stats_text += "\n".join([f"  {stat}: {val}" for stat, val in stats.items()])
            
            documents.append({
                "text": stats_text,
                "metadata": {
                    "type": "statistics"
                }
            })
        except Exception as e:
            logger.error(f"Error creating statistics document: {str(e)}")
        
        return documents
    
    def _create_chunks(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Split documents into smaller chunks for more efficient retrieval.
        
        Args:
            documents: List of documents with text and metadata
            
        Returns:
            List of chunks with text and metadata
        """
        chunks = []
        
        for doc in documents:
            text = doc["text"]
            metadata = doc["metadata"]
            
            # If text is shorter than chunk size, keep it as is
            if len(text) <= self.chunk_size:
                chunks.append({
                    "text": text,
                    "metadata": metadata
                })
                continue
                
            # Split text into chunks
            start = 0
            while start < len(text):
                end = start + self.chunk_size
                if end < len(text) and end - start < self.chunk_size:
                    # Find a good breaking point
                    breaking_point = text.rfind("\n", start, end)
                    if breaking_point == -1:
                        breaking_point = text.rfind(". ", start, end)
                    if breaking_point == -1:
                        breaking_point = text.rfind(" ", start, end)
                    if breaking_point != -1:
                        end = breaking_point + 1
                
                chunk_text = text[start:end]
                chunk_metadata = metadata.copy()
                chunk_metadata["chunk_start"] = start
                chunk_metadata["chunk_end"] = end
                
                chunks.append({
                    "text": chunk_text,
                    "metadata": chunk_metadata
                })
                
                start = end - self.chunk_overlap
                
        return chunks
    
    async def _create_embeddings(self, chunks: List[Dict[str, Any]]) -> np.ndarray:
        """
        Create embeddings for all chunks.
        
        Args:
            chunks: List of text chunks
            
        Returns:
            NumPy array of embeddings
        """
        texts = [chunk["text"] for chunk in chunks]
        embeddings = []
        
        # Process in batches to avoid overloading the embedding model
        batch_size = 10
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            batch_embeddings = await self._embed_texts(batch_texts)
            embeddings.extend(batch_embeddings)
            
        return np.array(embeddings)
    
    async def _embed_texts(self, texts: List[str]) -> List[np.ndarray]:
        """
        Create embeddings for a list of texts using the embedding model.
        
        Args:
            texts: List of texts
            
        Returns:
            List of embeddings as NumPy arrays
        """
        try:
            from sentence_transformers import SentenceTransformer
            
            # Load model if not already loaded
            if not hasattr(self, "embedding_model"):
                self.embedding_model = SentenceTransformer(settings.RAG_EMBEDDING_MODEL)
                
            # Generate embeddings
            embeddings = self.embedding_model.encode(texts)
            return embeddings
            
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            # Return zero embeddings as fallback
            return [np.zeros(self.embedding_dim) for _ in texts]
    
    async def _embed_text(self, text: str) -> np.ndarray:
        """
        Create embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding as NumPy array
        """
        embeddings = await self._embed_texts([text])
        return embeddings[0]
    
    def _calculate_similarities(self, query_embedding: np.ndarray, chunk_embeddings: np.ndarray) -> np.ndarray:
        """
        Calculate cosine similarities between query and chunks.
        
        Args:
            query_embedding: Query embedding
            chunk_embeddings: Chunk embeddings
            
        Returns:
            Array of similarity scores
        """
        # Normalize embeddings
        query_norm = np.linalg.norm(query_embedding)
        if query_norm > 0:
            query_embedding = query_embedding / query_norm
            
        chunk_norms = np.linalg.norm(chunk_embeddings, axis=1, keepdims=True)
        normalized_chunks = np.divide(chunk_embeddings, chunk_norms, where=chunk_norms>0)
        
        # Calculate cosine similarities
        similarities = np.dot(normalized_chunks, query_embedding)
        
        return similarities

# Create a singleton instance
rag_system = RAGSystem()
