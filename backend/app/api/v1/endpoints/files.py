# Files Endpoints
# File: files.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: File upload and management endpoints for the Enterprise Insights Copilot backend

import os
import shutil
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse

from app.utils.logger import setup_logger
from app.core.config import settings
from app.services.file_service import process_file, get_file_metadata, list_files
from app.schemas.file import FileResponse, FileMetadata

logger = setup_logger(__name__)
router = APIRouter()

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> FileResponse:
    """
    Upload a file for analysis.
    
    Args:
        file: The file to upload
        background_tasks: FastAPI background tasks
        
    Returns:
        FileResponse with file ID and metadata
        
    Raises:
        HTTPException if file format is not supported or other error occurs
    """
    logger.info(f"File upload request received: {file.filename}")
    
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower().replace(".", "")
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File format not supported. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Create unique filename with timestamp
        import time
        timestamp = str(int(time.time()))
        file_id = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, file_id)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process file in background
        background_tasks.add_task(process_file, file_path, file_id)
        
        # Return response
        return FileResponse(
            file_id=file_id,
            filename=file.filename,
            status="uploaded",
            message="File uploaded successfully and processing started",
        )
    
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    finally:
        file.file.close()

@router.get("/list", response_model=List[FileMetadata])
async def list_uploaded_files() -> List[FileMetadata]:
    """
    List all uploaded files.
    
    Returns:
        List of file metadata
    """
    logger.info("List files request received")
    return list_files()

@router.get("/{file_id}", response_model=FileMetadata)
async def get_file(file_id: str) -> FileMetadata:
    """
    Get file metadata and processing status.
    
    Args:
        file_id: The file ID
        
    Returns:
        FileMetadata with processing status and profile info
        
    Raises:
        HTTPException if file not found
    """
    logger.info(f"Get file request received: {file_id}")
    
    try:
        return get_file_metadata(file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
    except Exception as e:
        logger.error(f"Get file metadata failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get file metadata: {str(e)}")

@router.delete("/{file_id}")
async def delete_file(file_id: str) -> Dict[str, Any]:
    """
    Delete an uploaded file.
    
    Args:
        file_id: The file ID to delete
        
    Returns:
        Dict with success message
        
    Raises:
        HTTPException if file not found or deletion fails
    """
    logger.info(f"Delete file request received: {file_id}")
    
    file_path = os.path.join(settings.UPLOAD_DIR, file_id)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
    
    try:
        os.remove(file_path)
        return {"status": "success", "message": f"File {file_id} deleted successfully"}
    except Exception as e:
        logger.error(f"File deletion failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"File deletion failed: {str(e)}")
