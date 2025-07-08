# Document Processing for RAG
# File: document_processor.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Process documents into chunks for RAG system

from typing import List, Dict, Any, Optional, Union
import os
import re
from pathlib import Path
import csv
import json
import pandas as pd
from io import StringIO

from app.utils.logger import setup_logger
from app.rag.document_store import DocumentChunk
from app.rag.embeddings import EmbeddingService
from app.core.config import settings

# Setup logger
logger = setup_logger(__name__)

class DocumentProcessor:
    """
    Process documents for RAG system, including chunking and embedding.
    """
    
    def __init__(self, embedding_service: Optional[EmbeddingService] = None):
        """
        Initialize the document processor.
        
        Args:
            embedding_service: Optional embedding service to use
        """
        self.embedding_service = embedding_service or EmbeddingService()
        self.chunk_size = settings.RAG_CHUNK_SIZE
        self.chunk_overlap = settings.RAG_CHUNK_OVERLAP
    
    async def process_file(
        self,
        file_path: Union[str, Path],
        file_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[DocumentChunk]:
        """
        Process a file into document chunks.
        
        Args:
            file_path: Path to the file
            file_id: File ID for reference
            metadata: Additional metadata
            
        Returns:
            List of document chunks
        """
        file_path = Path(file_path) if isinstance(file_path, str) else file_path
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
            
        # Get file extension
        file_ext = file_path.suffix.lower()
        
        # Base metadata
        base_metadata = {
            "file_id": file_id,
            "filename": file_path.name,
            "file_type": file_ext,
            "source": "file"
        }
        
        # Add additional metadata if provided
        if metadata:
            base_metadata.update(metadata)
        
        # Process based on file type
        try:
            if file_ext in [".csv", ".tsv"]:
                return await self._process_csv(file_path, base_metadata)
            elif file_ext in [".json"]:
                return await self._process_json(file_path, base_metadata)
            elif file_ext in [".txt", ".md"]:
                return await self._process_text(file_path, base_metadata)
            elif file_ext in [".xlsx", ".xls"]:
                return await self._process_excel(file_path, base_metadata)
            else:
                logger.warning(f"Unsupported file type: {file_ext}, processing as text")
                return await self._process_text(file_path, base_metadata)
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
            raise
    
    async def process_text(
        self,
        text: str,
        metadata: Dict[str, Any]
    ) -> List[DocumentChunk]:
        """
        Process raw text into document chunks.
        
        Args:
            text: Text to process
            metadata: Metadata for the chunks
            
        Returns:
            List of document chunks
        """
        # Split text into chunks
        chunks = self._split_text(text)
        
        # Create document chunks
        doc_chunks = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = metadata.copy()
            chunk_metadata["chunk_index"] = i
            
            # Get embedding
            embedding = await self.embedding_service.get_embedding(chunk)
            
            # Create document chunk
            doc_chunk = DocumentChunk(
                text=chunk,
                metadata=chunk_metadata,
                embedding=embedding
            )
            
            doc_chunks.append(doc_chunk)
        
        return doc_chunks
    
    async def _process_csv(self, file_path: Path, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """Process CSV file into chunks"""
        try:
            # Read CSV
            df = pd.read_csv(file_path)
            
            # Process each row as a separate chunk
            chunks = []
            for i, row in df.iterrows():
                # Limit to first 100 rows for large files
                if i >= 100:
                    logger.warning(f"CSV file has more than 100 rows, only processing first 100")
                    break
                    
                # Create string representation of row
                row_text = ", ".join([f"{col}: {val}" for col, val in row.items()])
                
                # Create metadata for this row
                row_metadata = metadata.copy()
                row_metadata["row_index"] = i
                
                # Get embedding
                embedding = await self.embedding_service.get_embedding(row_text)
                
                # Create document chunk
                chunk = DocumentChunk(
                    text=row_text,
                    metadata=row_metadata,
                    embedding=embedding
                )
                chunks.append(chunk)
                
            # Also add a summary chunk for the entire CSV
            summary_text = f"CSV file with {len(df)} rows and {len(df.columns)} columns. "
            summary_text += f"Columns: {', '.join(df.columns.tolist())}"
            
            summary_metadata = metadata.copy()
            summary_metadata["is_summary"] = True
            
            # Get embedding for summary
            summary_embedding = await self.embedding_service.get_embedding(summary_text)
            
            # Create summary chunk
            summary_chunk = DocumentChunk(
                text=summary_text,
                metadata=summary_metadata,
                embedding=summary_embedding
            )
            chunks.append(summary_chunk)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error processing CSV file {file_path}: {e}")
            # Fall back to text processing
            return await self._process_text(file_path, metadata)
    
    async def _process_json(self, file_path: Path, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """Process JSON file into chunks"""
        try:
            # Read JSON
            with open(file_path, "r") as f:
                data = json.load(f)
            
            # Convert to string for simple processing
            json_str = json.dumps(data, indent=2)
            
            # Create metadata
            json_metadata = metadata.copy()
            json_metadata["is_json"] = True
            
            # Process as text
            return await self.process_text(json_str, json_metadata)
            
        except Exception as e:
            logger.error(f"Error processing JSON file {file_path}: {e}")
            # Fall back to text processing
            return await self._process_text(file_path, metadata)
    
    async def _process_text(self, file_path: Path, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """Process text file into chunks"""
        try:
            # Read text file
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            
            # Process text
            return await self.process_text(text, metadata)
            
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                with open(file_path, "r", encoding="latin-1") as f:
                    text = f.read()
                return await self.process_text(text, metadata)
            except Exception as e:
                logger.error(f"Error reading text file with latin-1 encoding: {e}")
                raise
        except Exception as e:
            logger.error(f"Error processing text file {file_path}: {e}")
            raise
    
    async def _process_excel(self, file_path: Path, metadata: Dict[str, Any]) -> List[DocumentChunk]:
        """Process Excel file into chunks"""
        try:
            # Read Excel
            df = pd.read_excel(file_path)
            
            # Convert to CSV and process as CSV
            csv_metadata = metadata.copy()
            csv_metadata["original_file_type"] = "excel"
            
            # Create in-memory CSV
            csv_buffer = StringIO()
            df.to_csv(csv_buffer, index=False)
            csv_text = csv_buffer.getvalue()
            
            # Process CSV text
            chunks = []
            
            # Process rows
            for i, row in df.iterrows():
                # Limit to first 100 rows for large files
                if i >= 100:
                    logger.warning(f"Excel file has more than 100 rows, only processing first 100")
                    break
                    
                # Create string representation of row
                row_text = ", ".join([f"{col}: {val}" for col, val in row.items() if pd.notna(val)])
                
                # Create metadata for this row
                row_metadata = metadata.copy()
                row_metadata["row_index"] = i
                row_metadata["original_file_type"] = "excel"
                
                # Get embedding
                embedding = await self.embedding_service.get_embedding(row_text)
                
                # Create document chunk
                chunk = DocumentChunk(
                    text=row_text,
                    metadata=row_metadata,
                    embedding=embedding
                )
                chunks.append(chunk)
            
            # Add summary chunk
            summary_text = f"Excel file with {len(df)} rows and {len(df.columns)} columns. "
            summary_text += f"Columns: {', '.join(df.columns.tolist())}"
            
            summary_metadata = metadata.copy()
            summary_metadata["is_summary"] = True
            summary_metadata["original_file_type"] = "excel"
            
            summary_embedding = await self.embedding_service.get_embedding(summary_text)
            
            summary_chunk = DocumentChunk(
                text=summary_text,
                metadata=summary_metadata,
                embedding=summary_embedding
            )
            chunks.append(summary_chunk)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error processing Excel file {file_path}: {e}")
            # Fall back to text processing
            return await self._process_text(file_path, metadata)
    
    def _split_text(self, text: str) -> List[str]:
        """
        Split text into chunks of approximately chunk_size with overlap.
        
        Args:
            text: Text to split
            
        Returns:
            List of text chunks
        """
        # Simple splitting by paragraphs first
        paragraphs = re.split(r'\n\s*\n', text)
        
        chunks = []
        current_chunk = ""
        
        for paragraph in paragraphs:
            # If adding this paragraph would exceed chunk size
            if len(current_chunk) + len(paragraph) > self.chunk_size:
                # If current chunk is not empty, add it to chunks
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # Start new chunk with current paragraph
                current_chunk = paragraph
            else:
                # Add paragraph to current chunk
                if current_chunk:
                    current_chunk += "\n\n" + paragraph
                else:
                    current_chunk = paragraph
        
        # Add the last chunk if not empty
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # If we have no chunks (empty text), return empty list
        if not chunks:
            return []
            
        # Create overlapping chunks if needed
        if self.chunk_overlap > 0 and len(chunks) > 1:
            overlapped_chunks = []
            
            for i, chunk in enumerate(chunks):
                if i == 0:
                    overlapped_chunks.append(chunk)
                else:
                    # Get overlap from previous chunk
                    prev_chunk = chunks[i-1]
                    words = prev_chunk.split()
                    
                    # Calculate overlap words
                    overlap_words_count = min(
                        len(words), 
                        int(self.chunk_overlap / 4)  # Approx 4 chars per word
                    )
                    
                    if overlap_words_count > 0:
                        overlap_text = " ".join(words[-overlap_words_count:])
                        overlapped_chunk = overlap_text + " " + chunk
                        overlapped_chunks.append(overlapped_chunk)
                    else:
                        overlapped_chunks.append(chunk)
            
            return overlapped_chunks
        
        return chunks
