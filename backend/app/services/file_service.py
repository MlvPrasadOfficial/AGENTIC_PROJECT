# File Service
# File: file_service.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Service for file processing and management

import os
import pandas as pd
import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from app.core.config import settings
from app.utils.logger import setup_logger
from app.schemas.file import FileMetadata

# Setup logger
logger = setup_logger(__name__)

# Metadata storage - in a production app this would be in a database
file_metadata_store: Dict[str, Dict[str, Any]] = {}

async def process_file(file_path: str, file_id: str) -> None:
    """
    Process an uploaded file to extract metadata and profile.
    This function is intended to be run as a background task.
    
    Args:
        file_path: Path to the uploaded file
        file_id: Unique identifier for the file
    """
    logger.info(f"Processing file: {file_id}")
    
    start_time = time.time()
    
    try:
        # Basic file metadata
        file_stats = os.stat(file_path)
        file_size = file_stats.st_size
        file_ext = Path(file_path).suffix.lower().replace(".", "")
        
        # Initial metadata entry
        metadata = {
            "file_id": file_id,
            "filename": Path(file_path).name,
            "upload_time": datetime.fromtimestamp(file_stats.st_ctime),
            "size_bytes": file_size,
            "file_type": file_ext,
            "status": "processing"
        }
        
        file_metadata_store[file_id] = metadata
        
        # Process file based on type
        if file_ext in ["csv", "txt"]:
            df = pd.read_csv(file_path)
            profile = profile_dataframe(df)
        elif file_ext in ["xlsx", "xls"]:
            df = pd.read_excel(file_path)
            profile = profile_dataframe(df)
        elif file_ext == "json":
            with open(file_path, "r") as f:
                data = json.load(f)
            if isinstance(data, list):
                df = pd.DataFrame(data)
                profile = profile_dataframe(df)
            else:
                df = pd.DataFrame([data])
                profile = profile_dataframe(df)
        else:
            # For unsupported types, just provide basic metadata
            profile = {"error": "File type profiling not supported"}
        
        # Update metadata with profile results
        processing_time = time.time() - start_time
        
        metadata.update({
            "status": "complete",
            "processing_time": processing_time,
            "row_count": profile.get("row_count"),
            "column_count": profile.get("column_count"),
            "profile": profile
        })
        
        file_metadata_store[file_id] = metadata
        logger.info(f"File processed successfully: {file_id} in {processing_time:.2f}s")
    
    except Exception as e:
        logger.error(f"Error processing file {file_id}: {str(e)}", exc_info=True)
        
        # Update metadata with error
        if file_id in file_metadata_store:
            file_metadata_store[file_id].update({
                "status": "error",
                "error": str(e),
                "processing_time": time.time() - start_time
            })

def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate profile information from a pandas DataFrame.
    
    Args:
        df: Pandas DataFrame to profile
        
    Returns:
        Dict with profile information
    """
    logger.info(f"Profiling DataFrame with {df.shape[0]} rows and {df.shape[1]} columns")
    
    result = {
        "row_count": df.shape[0],
        "column_count": df.shape[1],
        "memory_usage": df.memory_usage(deep=True).sum(),
        "duplicated_rows": df.duplicated().sum(),
        "duplicated_percentage": (df.duplicated().sum() / df.shape[0]) * 100 if df.shape[0] > 0 else 0,
        "columns": {},
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
