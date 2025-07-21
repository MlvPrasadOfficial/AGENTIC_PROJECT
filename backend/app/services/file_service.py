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
    
    def get_file_preview(self, file_id: str, rows: int = 10, columns: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Get preview data from a file for display in the frontend.
        
        This method handles two types of file storage scenarios:
        1. Files saved through FileService.save_uploaded_file() with UUID-based IDs
        2. Files saved directly by upload endpoints with timestamp-based IDs
        
        ENHANCED FUNCTIONALITY (Task-01 Fix):
        - Supports timestamp-based file IDs created by the upload endpoint
        - Handles files that exist on disk but aren't in the metadata store
        - Automatically detects file types from extensions
        - Provides fallback file type detection for complex naming patterns
        
        Args:
            file_id (str): The unique identifier for the file. Can be either:
                         - UUID format (e.g., "123e4567-e89b-12d3-a456-426614174000")  
                         - Timestamp format (e.g., "1753105630_filename.csv")
            rows (int): Maximum number of sample rows to return. Default: 10
                       Extra rows are read for more accurate column profiling
            columns (Optional[List[str]]): Specific column names to include in preview.
                                         If None, all columns are included
            
        Returns:
            Dict[str, Any]: Dictionary containing preview data with structure:
                {
                    "columns": [
                        {
                            "name": str,        # Column name
                            "type": str,        # pandas dtype as string
                            "nullCount": int,   # Number of null/NaN values
                            "uniqueCount": int, # Number of unique values
                            "min": Optional[Union[int, float]], # Min value (numeric columns only)
                            "max": Optional[Union[int, float]]  # Max value (numeric columns only)
                        }
                    ],
                    "rows": [
                        {
                            "column_name": "value", # Sample data rows
                            ...
                        }
                    ]
                }
                
        Raises:
            FileNotFoundError: If the specified file_id does not exist in either:
                             - The metadata store (for UUID-based files)
                             - The upload directory on disk (for timestamp-based files)
            ValueError: If the file type is not supported for preview
            Exception: For pandas reading errors, file corruption, or other processing issues
            
        Note:
            This method was enhanced in Task-01 to resolve file preview issues by:
            - Adding support for timestamp-based file IDs from the upload endpoint
            - Implementing fallback file type detection
            - Fixing pandas NaN handling for JSON serialization
            - Ensuring compatibility with existing file upload workflows
        """
        # Check if file exists in metadata store (UUID-based files from FileService)
        if file_id in self.metadata_store:
            # File was saved using FileService.save_uploaded_file() method
            # Retrieve metadata and construct file path using UUID
            metadata = self.metadata_store[file_id]
            file_path = self.upload_dir / file_id
            file_type = metadata["file_type"]
        else:
            # Handle files uploaded by the timestamp-based upload endpoint
            # These files exist on disk but aren't in the metadata store
            # This is a compatibility fix for the existing upload system
            file_path = self.upload_dir / file_id
            
            # Verify the file actually exists on the filesystem
            if not file_path.exists():
                raise FileNotFoundError(f"File {file_id} not found")
            
            # Determine file type from file extension
            # Extract extension and normalize it (remove dot, lowercase)
            file_type = Path(file_id).suffix.lower().replace(".", "")
            if not file_type:
                # If no extension found directly, try to extract from the filename
                # Handle timestamp-based names like "1753105630_filename.csv"
                if "_" in file_id:
                    # Split on first underscore to get original filename
                    original_filename = file_id.split("_", 1)[1]
                    file_type = Path(original_filename).suffix.lower().replace(".", "")
        
        # Log the preview operation for debugging and monitoring
        logger.info(f"Getting preview for file: {file_id}, type: {file_type}")
        
        try:
            # Read file based on detected file type using appropriate pandas method
            if file_type in ["csv", "txt"]:
                # Read CSV files with extra rows for better column analysis
                # nrows=rows*2 ensures we have enough data for accurate profiling
                df = pd.read_csv(file_path, nrows=rows*2)
            elif file_type in ["xlsx", "xls"]:
                # Read Excel files (both .xlsx and legacy .xls formats)
                # Extra rows help with column type detection and statistics
                df = pd.read_excel(file_path, nrows=rows*2)
            elif file_type == "json":
                # Read JSON files - note: no row limit as structure varies
                # JSON files are typically smaller and need full read for structure detection
                df = pd.read_json(file_path)
            else:
                # Unsupported file type - raise descriptive error
                raise ValueError(f"Unsupported file type for preview: {file_type}")
                
            # Apply column filtering if specific columns were requested
            if columns:
                # Filter to only include columns that actually exist in the dataframe
                # This prevents KeyError if client requests non-existent columns
                existing_columns = [col for col in columns if col in df.columns]
                if not existing_columns:
                    # If none of the requested columns exist, log warning and use all columns
                    # This ensures preview still works even with invalid column requests
                    logger.warning(f"None of the requested columns exist: {columns}")
                else:
                    # Filter dataframe to only include existing requested columns
                    df = df[existing_columns]
            
            # Generate column metadata for frontend display
            # This provides type information, statistics, and null value counts
            column_info = []
            for col_name, dtype in df.dtypes.items():
                # Get column data for analysis
                col_data = df[col_name]
                # Count null/NaN values for data quality assessment
                null_count = col_data.isna().sum()
                
                # Create base column information dictionary
                col_info = {
                    "name": col_name,                    # Column name as string
                    "type": str(dtype),                  # pandas dtype converted to string
                    "nullCount": int(null_count),        # Number of null values (int for JSON)
                    "uniqueCount": int(col_data.nunique())  # Number of unique values
                }
                
                # Add statistical information for numeric columns only
                # This provides min/max ranges useful for data analysis
                if pd.api.types.is_numeric_dtype(dtype):
                    # Calculate min/max values, handling empty columns gracefully
                    col_info["min"] = col_data.min() if not col_data.empty else None
                    col_info["max"] = col_data.max() if not col_data.empty else None
                
                # Add column info to the list
                column_info.append(col_info)
            
            # Convert sample rows to dictionary format for JSON response
            # Take only the requested number of rows for preview
            sample_df = df.head(rows)
            # Replace NaN values with empty strings for proper JSON serialization
            # pandas NaN values cannot be serialized to JSON, so we convert them
            # Using .where() with empty strings ensures consistent frontend display
            sample_rows = sample_df.where(sample_df.notna(), '').to_dict('records')
            
            # Return structured response with column metadata and sample data
            return {
                "columns": column_info,  # List of column metadata dictionaries
                "rows": sample_rows      # List of sample row dictionaries
            }
            
        except Exception as e:
            # Comprehensive error handling for file processing failures
            # Log the full error with stack trace for debugging purposes
            logger.error(f"Error generating preview for file {file_id}: {str(e)}", exc_info=True)
            # Re-raise the exception to be handled by the API endpoint
            # This allows the endpoint to return appropriate HTTP status codes
            raise
    
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
                except Exception as e:
                    logger.debug(f"Failed to generate histogram for {column}: {str(e)}")
                    pass
            
            # Categorical columns - add top categories
            elif pd.api.types.is_string_dtype(col_data) or pd.api.types.is_categorical_dtype(col_data):
                try:
                    top_categories = col_data.value_counts().head(10).to_dict()
                    col_profile["top_categories"] = top_categories
                except Exception as e:
                    logger.debug(f"Failed to calculate top categories for {column}: {str(e)}")
                    pass
                    
            # Add to columns dict
            result["columns"][column] = col_profile
        
        # Calculate correlation matrix for numeric columns
        numeric_df = df.select_dtypes(include=['number'])
        if not numeric_df.empty and numeric_df.shape[1] > 1:
            try:
                corr_matrix = numeric_df.corr().to_dict()
                result["correlation_matrix"] = corr_matrix
            except Exception as e:
                logger.warning(f"Failed to calculate correlation matrix: {str(e)}")
                pass
        
        return result

async def process_file(file_id: str) -> Dict[str, Any]:
    """
    Process a file and return processing results.
    
    Args:
        file_id: The file ID to process
        
    Returns:
        Dict containing processing results
        
    Raises:
        FileNotFoundError: If file not found
    """
    # Create singleton instance if needed
    file_service = FileService()
    
    return await file_service.process_file(file_id)

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
    # Create singleton instance if needed
    file_service = FileService()
    
    if file_id not in file_service.metadata_store:
        raise FileNotFoundError(f"File {file_id} not found")
    
    return FileMetadata(**file_service.metadata_store[file_id])

def list_files() -> List[FileMetadata]:
    """
    List all files in the metadata store.
    
    Returns:
        List of FileMetadata objects
    """
    # Create singleton instance if needed
    file_service = FileService()
    
    return [FileMetadata(**metadata) for metadata in file_service.metadata_store.values()]
