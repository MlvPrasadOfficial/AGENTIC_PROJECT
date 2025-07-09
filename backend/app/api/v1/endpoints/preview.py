# File Preview Endpoints
# File: preview.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: Endpoints for file preview in the Enterprise Insights Copilot backend

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel, Field

from app.utils.logger import setup_logger
from app.services.file_service import get_file_preview, FileService

logger = setup_logger(__name__)
router = APIRouter()
file_service = FileService()

class SampleDataResponse(BaseModel):
    """Response model for sample data from a file"""
    columns: List[Dict[str, Any]] = Field(..., description="Column metadata")
    rows: List[Dict[str, Any]] = Field(..., description="Sample rows from the file")

@router.get("/{file_id}", response_model=SampleDataResponse)
async def get_sample_data(
    file_id: str = Path(..., description="The ID of the file to preview"),
    rows: int = Query(10, description="Number of rows to return"),
    columns: Optional[str] = Query(None, description="Comma-separated list of columns to include")
) -> SampleDataResponse:
    """
    Get sample data from a file for preview.
    
    Args:
        file_id: The ID of the file
        rows: Number of rows to return (default: 10)
        columns: Comma-separated list of columns to include (optional)
        
    Returns:
        SampleDataResponse with columns metadata and sample rows
        
    Raises:
        HTTPException if file not found or cannot be read
    """
    logger.info(f"Getting sample data for file: {file_id}, rows: {rows}")
    
    try:
        # Parse columns if provided
        column_list = None
        if columns:
            column_list = [col.strip() for col in columns.split(",")]
        
        # Get preview data
        preview_data = file_service.get_file_preview(file_id, rows, column_list)
        
        # Format response
        return SampleDataResponse(
            columns=preview_data["columns"],
            rows=preview_data["rows"]
        )
    except FileNotFoundError as e:
        logger.error(f"File not found: {file_id}")
        raise HTTPException(status_code=404, detail=f"File not found: {file_id}")
    except Exception as e:
        logger.error(f"Error getting preview for file {file_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting file preview: {str(e)}")
