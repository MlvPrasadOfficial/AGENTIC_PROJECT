# File Schemas
# File: file.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Pydantic schemas for file operations

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class FileResponse(BaseModel):
    """
    Response for file upload operations with comprehensive Pinecone validation testing.
    
    This schema includes the results of the 6 Pinecone validation tests that verify:
    1. Pinecone connection and authentication
    2. Index details and configuration
    3. Vector count before embedding operations
    4. CSV test data file validation
    5. Index embedding operations with required wait time
    6. Vector count after embedding operations
    
    Fields:
        file_id: Unique identifier for the uploaded file
        filename: Original filename of the uploaded file
        status: Current processing status (uploaded, processing, complete, error)
        message: Human-readable status message
        pinecone_tests: Optional dict containing the 6 test results with pass/fail status
    """
    file_id: str
    filename: str
    status: str
    message: str
    pinecone_tests: Optional[Dict[str, Dict[str, Any]]] = Field(
        None, 
        description="Results of the 6 Pinecone validation tests (test_2_0 through test_2_5)"
    )

class FileMetadata(BaseModel):
    """File metadata including processing status and profile info"""
    file_id: str
    filename: str
    upload_time: datetime
    size_bytes: int
    file_type: str
    status: str = Field(..., description="processing, complete, error")
    processing_time: Optional[float] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    profile: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
class ColumnProfile(BaseModel):
    """Profile information for a single column"""
    name: str
    dtype: str
    count: int
    missing: int
    missing_percentage: float
    unique: int
    unique_percentage: float
    min: Optional[Any] = None
    max: Optional[Any] = None
    mean: Optional[float] = None
    std: Optional[float] = None
    median: Optional[float] = None
    histogram: Optional[List[int]] = None
    histogram_bins: Optional[List[Any]] = None
    
class DataProfile(BaseModel):
    """Complete data profile"""
    row_count: int
    column_count: int
    memory_usage: int
    duplicated_rows: int
    duplicated_percentage: float
    columns: Dict[str, ColumnProfile]
    correlation_matrix: Optional[Dict[str, Dict[str, float]]] = None
    sample_data: List[Dict[str, Any]]
