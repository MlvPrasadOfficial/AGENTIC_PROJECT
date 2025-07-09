"""
File Service for the Enterprise Insights Copilot backend.
This service handles file upload, processing, validation, and metadata management.

Author: GitHub Copilot
Date: 2025-07-09
Purpose: Service for file processing and management
"""

import os
import pandas as pd
import numpy as np
import json
import time
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from app.core.config import settings
from app.utils.logger import setup_logger
from app.schemas.file import FileMetadata, FileResponse, DataProfile

# Setup logger
logger = setup_logger(__name__)

class FileService:
    """
    Service for handling file operations in the Enterprise Insights Copilot.
    
    This service manages file upload, processing, validation, and metadata storage.
    It provides a centralized interface for all file-related operations.
    """
    
    def __init__(self):
        """Initialize the file service with required directories and configuration."""
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # In-memory storage for metadata (in production, this would be a database)
        self.metadata_store: Dict[str, Dict[str, Any]] = {}
        
        logger.info(f"FileService initialized with upload directory: {self.upload_dir}")
    
    async def save_uploaded_file(self, file_content: bytes, filename: str) -> str:
        """
        Save an uploaded file to the file system.
        
        Args:
            file_content: The binary content of the file
            filename: Original filename
            
        Returns:
            Unique file ID for the saved file
        """
        file_id = str(uuid.uuid4())
        file_path = self.upload_dir / file_id
        
        # Save file to disk
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        # Create initial metadata
        file_stats = os.stat(file_path)
        metadata = {
            "file_id": file_id,
            "filename": filename,
            "upload_time": datetime.now(),
            "size_bytes": file_stats.st_size,
            "file_type": Path(filename).suffix.lower().replace(".", ""),
            "status": "uploaded"
        }
        
        self.metadata_store[file_id] = metadata
        logger.info(f"File saved with ID: {file_id}, filename: {filename}")
        
        return file_id
    
    async def process_file(self, file_id: str) -> Dict[str, Any]:
        """
        Process a file to extract metadata and create initial profile.
        
        Args:
            file_id: Unique identifier for the file
            
        Returns:
            Processing result dictionary
        """
        if file_id not in self.metadata_store:
            raise FileNotFoundError(f"File {file_id} not found")
        
        metadata = self.metadata_store[file_id]
        file_path = self.upload_dir / file_id
        
        logger.info(f"Processing file: {file_id}")
        start_time = time.time()
        
        try:
            # Update status
            metadata["status"] = "processing"
            
            # Process based on file type
            file_type = metadata["file_type"]
            if file_type in ["csv", "txt"]:
                df = pd.read_csv(file_path)
                profile = self._profile_dataframe(df)
            elif file_type in ["xlsx", "xls"]:
                df = pd.read_excel(file_path)
                profile = self._profile_dataframe(df)
            elif file_type == "json":
                with open(file_path, "r") as f:
                    data = json.load(f)
                if isinstance(data, list):
                    df = pd.DataFrame(data)
                    profile = self._profile_dataframe(df)
                else:
                    df = pd.DataFrame([data])
                    profile = self._profile_dataframe(df)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Update metadata with profile
            processing_time = time.time() - start_time
            metadata.update({
                "status": "processed",
                "processing_time": processing_time,
                "row_count": profile.get("row_count"),
                "column_count": profile.get("column_count"),
                "profile": profile
            })
            
            logger.info(f"File processed successfully: {file_id} in {processing_time:.2f}s")
            return {"status": "success", "processing_time": processing_time}
            
        except Exception as e:
            logger.error(f"Error processing file {file_id}: {str(e)}")
            metadata.update({
                "status": "error",
                "error": str(e),
                "processing_time": time.time() - start_time
            })
            raise
    
    async def get_file_metadata(self, file_id: str) -> Optional[FileMetadata]:
        """
        Get metadata for a specific file.
        
        Args:
            file_id: Unique identifier for the file
            
        Returns:
            FileMetadata object or None if not found
        """
        if file_id not in self.metadata_store:
            return None
        
        return FileMetadata(**self.metadata_store[file_id])
    
    async def update_file_metadata(self, file_id: str, **updates) -> None:
        """
        Update metadata for a specific file.
        
        Args:
            file_id: Unique identifier for the file
            **updates: Fields to update
        """
        if file_id not in self.metadata_store:
            raise FileNotFoundError(f"File {file_id} not found")
        
        self.metadata_store[file_id].update(updates)
        logger.info(f"Updated metadata for file {file_id}: {updates}")
    
    async def get_file_structure(self, file_id: str) -> Dict[str, Any]:
        """
        Get the structure of a file (columns, data types, etc.).
        
        Args:
            file_id: Unique identifier for the file
            
        Returns:
            Structure information about the file
        """
        metadata = await self.get_file_metadata(file_id)
        if not metadata or not metadata.profile:
            raise ValueError(f"No profile available for file {file_id}")
        
        return {
            "columns": list(metadata.profile["columns"].keys()),
            "data_types": {col: info["dtype"] for col, info in metadata.profile["columns"].items()},
            "row_count": metadata.profile["row_count"],
            "column_count": metadata.profile["column_count"]
        }
    
    async def list_files(self) -> List[FileMetadata]:
        """
        List all files in the metadata store.
        
        Returns:
            List of FileMetadata objects
        """
        return [FileMetadata(**metadata) for metadata in self.metadata_store.values()]
    def _profile_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate profile information from a pandas DataFrame.
        
        Args:
            df: Pandas DataFrame to profile
            
        Returns:
            Dict with comprehensive profile information
        """
        logger.info(f"Profiling DataFrame with {df.shape[0]} rows and {df.shape[1]} columns")
        
        result = {
            "row_count": df.shape[0],
            "column_count": df.shape[1],
            "memory_usage": df.memory_usage(deep=True).sum(),
            "duplicated_rows": df.duplicated().sum(),
            "duplicated_percentage": (df.duplicated().sum() / df.shape[0]) * 100 if df.shape[0] > 0 else 0,
            "columns": {},
            "missing_values": {},
            "sample_data": df.head(5).to_dict(orient="records")
        }
        
        # Profile each column
        for column in df.columns:
            col_data = df[column]
            col_profile = {
                "name": column,
                "dtype": str(col_data.dtype),
                "count": col_data.count(),
                "missing": col_data.isna().sum(),
                "missing_percentage": (col_data.isna().sum() / len(col_data)) * 100,
                "unique": col_data.nunique(),
                "unique_percentage": (col_data.nunique() / len(col_data)) * 100 if len(col_data) > 0 else 0,
            }
            
            # Add missing values to summary
            result["missing_values"][column] = col_data.isna().sum()
            
            # Numeric columns
            if pd.api.types.is_numeric_dtype(col_data):
                col_profile.update({
                    "min": col_data.min() if not col_data.empty else None,
                    "max": col_data.max() if not col_data.empty else None,
                    "mean": col_data.mean() if not col_data.empty else None,
                    "std": col_data.std() if not col_data.empty else None,
                    "median": col_data.median() if not col_data.empty else None,
                })
                
                # Create histogram for numeric data
                try:
                    hist_values, bin_edges = np.histogram(col_data.dropna(), bins=10)
                    col_profile["histogram"] = hist_values.tolist()
                    col_profile["histogram_bins"] = bin_edges.tolist()
                except:
                    pass
            
            # Categorical columns - add top categories
            elif pd.api.types.is_string_dtype(col_data) or pd.api.types.is_categorical_dtype(col_data):
                try:
                    top_categories = col_data.value_counts().head(10).to_dict()
                    col_profile["top_categories"] = top_categories
                except:
                    pass
                    
            # Add to columns dict
            result["columns"][column] = col_profile
        
        # Calculate correlation matrix for numeric columns
        numeric_df = df.select_dtypes(include=['number'])
        if not numeric_df.empty and numeric_df.shape[1] > 1:
            try:
                corr_matrix = numeric_df.corr().to_dict()
                result["correlation_matrix"] = corr_matrix
            except:
                pass
        
        return result

def get_file_metadata(file_id: str) -> FileMetadata:
    """
    Get metadata for a specific file.
    
    Args:
        file_id: The file ID
        
    Returns:
        FileMetadata object
        
    Raises:
        FileNotFoundError: If file not found
    """
    if file_id not in file_metadata_store:
        raise FileNotFoundError(f"File {file_id} not found")
    
    return FileMetadata(**file_metadata_store[file_id])

def list_files() -> List[FileMetadata]:
    """
    List all files in the metadata store.
    
    Returns:
        List of FileMetadata objects
    """
    return [FileMetadata(**metadata) for metadata in file_metadata_store.values()]
