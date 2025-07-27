# Files Endpoints - Enterprise File Upload and Management System
# File: files.py
# Author: GitHub Copilot
# Date: 2025-07-27
# Purpose: Comprehensive file upload and management endpoints with Pinecone integration

# Standard library imports for file operations and typing
import os
import shutil
from typing import List, Dict, Any

# FastAPI framework imports for HTTP handling and dependency injection
from fastapi import APIRouter, HTTPException, Request

# Application-specific imports for logging, configuration, and services
from app.utils.logger import setup_logger
from app.core.config import settings
from app.services.file_service import get_file_metadata, list_files
from app.schemas.file import FileResponse, FileMetadata
from app.agents.base import BaseAgentRequest

# Initialize module-level logger for comprehensive endpoint operation tracking
logger = setup_logger(__name__)

# Create FastAPI router for all file-related HTTP endpoints
router = APIRouter()

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    request: Request,
) -> FileResponse:
    """
    Upload a file for comprehensive analysis with Pinecone validation testing.
    
    This endpoint handles file uploads with robust error handling and runs a complete
    suite of 6 Pinecone validation tests to ensure system connectivity and functionality.
    """
    # IMMEDIATE ENTRY POINT LOGGING (no Unicode characters)
    print("[ENDPOINT ENTRY] === UPLOAD ENDPOINT CALLED ===")
    print("[ENDPOINT ENTRY] Function upload_file() executed successfully!")
    
    logger.info("=" * 80)
    logger.info("[UPLOAD ENDPOINT] === FILE UPLOAD REQUEST STARTED ===")
    logger.info("=" * 80)
    
    # MANUAL FORMDATA PARSING to avoid FastAPI parameter binding issues
    try:
        logger.info("[MANUAL PARSING] Starting manual FormData extraction...")
        form = await request.form()
        logger.info("[MANUAL PARSING] Form keys received: {}".format(list(form.keys())))
        
        # DEBUG: Log all form items for troubleshooting
        logger.info("[MANUAL PARSING] All form items:")
        for key, value in form.items():
            if hasattr(value, 'filename'):
                logger.info("[MANUAL PARSING] Form field '{}': File({}, {})".format(key, value.filename, value.content_type))
            else:
                logger.info("[MANUAL PARSING] Form field '{}': {}".format(key, str(value)[:100]))
        
        # Extract file from form data
        if "file" not in form:
            logger.error("[VALIDATION ERROR] No file field found in form data!")
            logger.error("[VALIDATION ERROR] Available form fields: {}".format(list(form.keys())))
            raise HTTPException(status_code=400, detail="No file field found in request")
        
        file = form["file"]
        if not hasattr(file, 'filename'):
            logger.error("[VALIDATION ERROR] file field is not a file upload!")
            raise HTTPException(status_code=400, detail="file field is not a file upload")
        
        # Extract metadata if present
        metadata = form.get("metadata", None)
        
        logger.info("[FILE INFO] Filename: {}".format(file.filename))
        logger.info("[FILE INFO] Content type: {}".format(file.content_type))
        logger.info("[METADATA INFO] Raw metadata: {}".format(metadata))
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error("[MANUAL PARSING ERROR] Failed to parse FormData: {}".format(str(e)))
        raise HTTPException(status_code=400, detail="Failed to parse form data: {}".format(str(e)))

    # Parse metadata if provided
    parsed_metadata = {}
    if metadata:
        try:
            import json
            parsed_metadata = json.loads(metadata)
            logger.info("[METADATA INFO] Parsed metadata: {}".format(parsed_metadata))
        except json.JSONDecodeError as e:
            logger.warning("[METADATA WARNING] Invalid metadata JSON: {}".format(metadata))
            logger.warning("[METADATA WARNING] JSON error: {}".format(e))
    else:
        logger.info("[METADATA INFO] No metadata provided")
    
    logger.info("[METADATA INFO] Final parsed metadata: {}".format(parsed_metadata))
    logger.info("=" * 80)
    
    # Validate file extension
    logger.info("[VALIDATION] Starting file extension validation...")
    logger.info("[VALIDATION] File filename: {}".format(file.filename))
    
    if not file.filename:
        logger.error("[VALIDATION ERROR] File has no filename!")
        raise HTTPException(status_code=400, detail="File must have a filename")
    
    file_ext = os.path.splitext(file.filename)[1].lower().replace(".", "")
    logger.info("[VALIDATION] Extracted file extension: '{}'".format(file_ext))
    logger.info("[VALIDATION] Allowed extensions: {}".format(settings.ALLOWED_EXTENSIONS))
    
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        logger.error("[VALIDATION ERROR] File extension '{}' not allowed!".format(file_ext))
        raise HTTPException(
            status_code=400, 
            detail="File format not supported. Allowed formats: {}".format(', '.join(settings.ALLOWED_EXTENSIONS))
        )
    
    logger.info("[VALIDATION] File extension '{}' is valid".format(file_ext))
    
    try:
        # Create unique filename with timestamp
        import time
        timestamp = str(int(time.time()))
        file_id = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, file_id)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create FileService instance and initialize metadata
        from app.services.file_service import FileService
        file_service = FileService()
        
        # Create initial metadata entry so FileUploadAgent can find the file
        from datetime import datetime
        from pathlib import Path
        
        file_stats = os.stat(file_path)
        file_service.metadata_store[file_id] = {
            "file_id": file_id,
            "filename": file.filename,
            "upload_time": datetime.now(),
            "size_bytes": file_stats.st_size,
            "file_type": Path(file.filename).suffix.lower().replace(".", ""),
            "status": "uploaded"
        }
        
        # Process the file to extract structure and profile
        await file_service.process_file(file_id)
        
        # Get FileUploadAgent from singleton workflow to prevent duplicate instantiation
        from app.workflow.agent_workflow import get_workflow_instance
        workflow = get_workflow_instance()
        file_upload_agent = workflow.file_upload_agent
        
        # Create agent request with file metadata to avoid lookup issues
        agent_request = BaseAgentRequest(
            query="Process uploaded file with Pinecone validation tests",
            file_id=file_id,
            context_data={
                "filename": file.filename, 
                "file_path": file_path,
                "file_metadata": file_service.metadata_store[file_id]  # Pass metadata directly
            }
        )
        
        # Run the agent to get the 6 test results
        try:
            agent_response = await file_upload_agent.run(agent_request)
            
            # Extract the 6 test results from agent response
            pinecone_tests = None
            if agent_response.status == "success" and agent_response.result:
                pinecone_tests = agent_response.result.get("pinecone_tests", {})
            
            # Return response with 6 test results
            return FileResponse(
                file_id=file_id,
                filename=file.filename,
                status="uploaded",
                message="File uploaded successfully and processing completed",
                pinecone_tests=pinecone_tests,
            )
        
        except Exception as agent_error:
            logger.warning(f"FileUploadAgent failed: {str(agent_error)}")
            # Return response without test results if agent fails
            return FileResponse(
                file_id=file_id,
                filename=file.filename,
                status="uploaded",
                message="File uploaded successfully. Pinecone tests unavailable.",
            )
    
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    finally:
        file.file.close()


@router.get("/list", response_model=List[FileMetadata])
async def list_uploaded_files() -> List[FileMetadata]:
    """Retrieve a comprehensive list of all uploaded files with their metadata."""
    logger.info("List files request received")
    return list_files()


@router.get("/{file_id}", response_model=FileMetadata)
async def get_file(file_id: str) -> FileMetadata:
    """Retrieve detailed metadata and processing status for a specific file."""
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
    """Delete an uploaded file from the system and file storage."""
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
