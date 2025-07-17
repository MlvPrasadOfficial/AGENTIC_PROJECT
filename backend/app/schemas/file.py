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
    """
    Comprehensive metadata schema for uploaded files with processing status.
    
    This schema represents the complete lifecycle of a file within the
    Enterprise Insights Copilot system, from initial upload through
    processing completion, including detailed profiling information.
    
    Lifecycle Stages:
        1. Upload: Basic file information captured
        2. Processing: File analysis and validation in progress
        3. Complete: Full processing and profiling finished
        4. Error: Processing failed with error details
        
    Fields:
        file_id: Unique system identifier for the file
        filename: Original filename as provided by user
        upload_time: Timestamp when file was uploaded
        size_bytes: File size in bytes for storage tracking
        file_type: Detected MIME type or file extension
        status: Current processing status (processing, complete, error)
        processing_time: Time taken for processing in seconds
        row_count: Number of data rows (for structured data)
        column_count: Number of data columns (for structured data)
        profile: Detailed data profiling results (if available)
        error: Error message if processing failed
        
    Status Values:
        - "processing": File is currently being analyzed
        - "complete": Processing finished successfully
        - "error": Processing failed with error details
        
    Usage:
        This schema is used across the API for file status reporting,
        metadata retrieval, and processing progress tracking.
    """
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
    """
    Detailed profiling information for a single data column.
    
    This schema captures comprehensive statistical and structural information
    about individual columns within uploaded data files, enabling detailed
    data quality assessment and analysis planning.
    
    Statistical Metrics:
        - Basic counts (total, missing, unique values)
        - Descriptive statistics (mean, median, standard deviation)
        - Distribution analysis (min, max, histogram)
        - Data quality metrics (missing percentage, uniqueness)
        
    Fields:
        name: Column name as it appears in the source data
        dtype: Data type (string, integer, float, datetime, etc.)
        count: Total number of non-null values
        missing: Number of missing/null values
        missing_percentage: Percentage of missing values (0-100)
        unique: Number of unique values in the column
        unique_percentage: Percentage of unique values (0-100)
        min: Minimum value (for numeric/date columns)
        max: Maximum value (for numeric/date columns)
        mean: Arithmetic mean (for numeric columns)
        std: Standard deviation (for numeric columns)
        median: Median value (for numeric columns)
        histogram: Frequency distribution bins
        histogram_bins: Bin boundaries for histogram
        
    Usage:
        This schema is used within DataProfile to provide detailed
        column-level analysis for data profiling and quality assessment.
    """
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
    """
    Comprehensive data profile schema for complete dataset analysis.
    
    This schema provides a complete statistical and structural overview
    of uploaded datasets, enabling data scientists and analysts to
    understand data quality, distribution, and characteristics.
    
    Dataset Overview:
        - Dimensional information (rows, columns)
        - Memory usage and storage requirements
        - Data quality metrics (duplicates, completeness)
        - Sample data for preview and validation
        
    Advanced Analytics:
        - Column-level profiling with detailed statistics
        - Correlation analysis between numeric columns
        - Data distribution patterns and outliers
        - Relationship mapping and dependencies
        
    Fields:
        row_count: Total number of rows in the dataset
        column_count: Total number of columns in the dataset
        memory_usage: Dataset memory footprint in bytes
        duplicated_rows: Number of duplicate rows found
        duplicated_percentage: Percentage of duplicate rows (0-100)
        columns: Dictionary of column profiles keyed by column name
        correlation_matrix: Correlation coefficients between numeric columns
        sample_data: Representative sample of actual data rows
        
    Usage:
        This schema is used for comprehensive data profiling results,
        data quality assessment, and analysis planning within the
        Enterprise Insights Copilot system.
        
    Performance Considerations:
        - Sample data is limited to prevent large response payloads
        - Correlation matrix is computed only for numeric columns
        - Memory usage helps with resource planning
    """
    row_count: int
    column_count: int
    memory_usage: int
    duplicated_rows: int
    duplicated_percentage: float
    columns: Dict[str, ColumnProfile]
    correlation_matrix: Optional[Dict[str, Dict[str, float]]] = None
    sample_data: List[Dict[str, Any]]
