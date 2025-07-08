# File Schemas
# File: file.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Pydantic schemas for file operations

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class FileResponse(BaseModel):
    """Response for file upload operations"""
    file_id: str
    filename: str
    status: str
    message: str

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
