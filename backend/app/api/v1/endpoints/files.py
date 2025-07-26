# Files Endpoints
# File: files.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: File upload and management endpoints for the Enterprise Insights Copilot backend

import os
import shutil
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Form

from app.utils.logger import setup_logger
from app.core.config import settings
from app.services.file_service import get_file_metadata, list_files
from app.schemas.file import FileResponse, FileMetadata
from app.agents.base import BaseAgentRequest

# Initialize module-level logger for endpoint operations
logger = setup_logger(__name__)

# Create FastAPI router for file-related endpoints
router = APIRouter()

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    metadata: str = Form(None),  # Optional metadata as JSON string
) -> FileResponse:
    """
    Upload a file for analysis with comprehensive Pinecone validation testing.
    
    This endpoint handles file uploads and runs the 6 Pinecone validation tests
    to ensure system connectivity and functionality. The tests validate:
    
    1. Test 2.0: Pinecone Connection Test - API connection and authentication
    2. Test 2.1: Fetch Index Details - Index configuration and connectivity  
    3. Test 2.2: Vector Count Before Embedding - Baseline vector count
    4. Test 2.3: CSV Filename Validation - CSV test data file validation
    5. Test 2.4: Index Embedding Operation - Embedding with 3-second wait
    6. Test 2.5: Vector Count After Embedding - Post-embedding validation
    
    Args:
        file: The file to upload
        background_tasks: FastAPI background tasks
        
    Returns:
        FileResponse with file ID, metadata, and 6 Pinecone test results
        
    Raises:
        HTTPException if file format is not supported or other error occurs
    """
    logger.info(f"🚀 [UPLOAD START] File upload request received: {file.filename}")
    logger.info(f"🔍 [UPLOAD DEBUG] Content type: {file.content_type}")
    logger.info(f"🔍 [UPLOAD DEBUG] File size: {file.size if hasattr(file, 'size') else 'unknown'}")
    logger.info(f"🔍 [UPLOAD DEBUG] Metadata received: {metadata}")
    
    # Parse metadata if provided
    parsed_metadata = {}
    if metadata:
        try:
            import json
            parsed_metadata = json.loads(metadata)
            logger.info(f"🔍 [UPLOAD DEBUG] Parsed metadata: {parsed_metadata}")
        except json.JSONDecodeError:
            logger.warning(f"⚠️ [UPLOAD WARNING] Invalid metadata JSON: {metadata}")
    
    logger.info(f"🔍 [UPLOAD DEBUG] Final metadata: {parsed_metadata}")
    
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
    """
    Retrieve a comprehensive list of all uploaded files with their metadata.
    
    This endpoint provides a complete inventory of all files that have been
    uploaded to the system, including their current processing status,
    metadata, and availability for further operations.
    
    Endpoint Features:
        - Returns all files regardless of processing status
        - Includes comprehensive metadata for each file
        - Provides processing status and completion information
        - Supports pagination and filtering (future enhancement)
        - Maintains consistent response format
        
    Response Information:
        Each file entry includes:
        - file_id: Unique system identifier
        - filename: Original uploaded filename
        - upload_time: Timestamp of upload
        - size_bytes: File size in bytes
        - file_type: Detected file type
        - status: Current processing status
        - processing_time: Time taken for processing
        - profile: Data profiling results (if available)
        - error: Error message (if processing failed)
        
    Returns:
        List[FileMetadata]: Complete list of file metadata objects
        
    HTTP Status Codes:
        - 200: Success - Files retrieved successfully
        - 500: Internal Server Error - System error occurred
        
    Usage:
        GET /api/v1/files/list
        
    Future Enhancements:
        - Query parameters for filtering by status
        - Pagination support for large file lists
        - Sorting by upload time or file size
        - Search functionality by filename
    """
    # Log the incoming request for monitoring
    logger.info("List files request received")
    
    # Delegate to file service for actual file retrieval
    return list_files()

@router.get("/{file_id}", response_model=FileMetadata)
async def get_file(file_id: str) -> FileMetadata:
    """
    Retrieve detailed metadata and processing status for a specific file.
    
    This endpoint provides comprehensive information about a single uploaded
    file, including its current processing status, metadata, profile data,
    and any error information if processing failed.
    
    Endpoint Features:
        - Returns complete file metadata for specified file ID
        - Includes processing status and completion details
        - Provides error information for failed processing
        - Supports real-time status checking
        - Maintains consistent response format
        
    Path Parameters:
        file_id (str): Unique identifier for the target file
        
    Response Information:
        - file_id: Unique system identifier
        - filename: Original uploaded filename
        - upload_time: Timestamp of upload
        - size_bytes: File size in bytes
        - file_type: Detected file type
        - status: Current processing status (uploaded, processing, complete, error)
        - processing_time: Time taken for processing (if completed)
        - row_count: Number of rows (for structured data)
        - column_count: Number of columns (for structured data)
        - profile: Detailed data profiling results (if available)
        - error: Error message (if processing failed)
        
    Returns:
        FileMetadata: Complete metadata object for the requested file
        
    HTTP Status Codes:
        - 200: Success - File metadata retrieved successfully
        - 404: Not Found - File with specified ID does not exist
        - 500: Internal Server Error - System error occurred
        
    Raises:
        HTTPException: 
            - 404 if file not found
            - 500 if metadata retrieval fails
            
    Usage:
        GET /api/v1/files/{file_id}
        
    Examples:
        GET /api/v1/files/1673456789_data.csv
        GET /api/v1/files/1673456790_report.xlsx
    """
    # Log the incoming request with file ID for monitoring
    logger.info(f"Get file request received: {file_id}")
    
    try:
        # Delegate to file service for metadata retrieval
        return get_file_metadata(file_id)
    except FileNotFoundError:
        # Handle case where file doesn't exist
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
    except Exception as e:
        # Handle any other errors during metadata retrieval
        logger.error(f"Get file metadata failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get file metadata: {str(e)}")

@router.delete("/{file_id}")
async def delete_file(file_id: str) -> Dict[str, Any]:
    """
    Delete an uploaded file from the system and file storage.
    
    This endpoint permanently removes a file from both the file system
    and any associated metadata from the database. This action is
    irreversible and should be used with caution.
    
    Endpoint Features:
        - Permanently deletes file from file system
        - Removes associated metadata from database
        - Validates file existence before deletion
        - Provides confirmation of successful deletion
        - Handles errors gracefully with appropriate status codes
        
    Path Parameters:
        file_id (str): Unique identifier for the file to delete
        
    Security Considerations:
        - File deletion is permanent and cannot be undone
        - No recovery mechanism is available after deletion
        - Proper authorization should be implemented (future enhancement)
        - Audit logging should be considered for compliance
        
    Returns:
        Dict[str, Any]: Success confirmation with structure:
            {
                "status": "success",
                "message": "File {file_id} deleted successfully"
            }
            
    HTTP Status Codes:
        - 200: Success - File deleted successfully
        - 404: Not Found - File with specified ID does not exist
        - 500: Internal Server Error - Deletion failed due to system error
        
    Raises:
        HTTPException:
            - 404 if file not found
            - 500 if deletion fails
            
    Usage:
        DELETE /api/v1/files/{file_id}
        
    Examples:
        DELETE /api/v1/files/1673456789_data.csv
        DELETE /api/v1/files/1673456790_report.xlsx
        
    Future Enhancements:
        - Soft delete with recovery mechanism
        - Batch deletion for multiple files
        - Authorization and permission checks
        - Audit trail for deleted files
    """
    # Log the incoming deletion request for monitoring
    logger.info(f"Delete file request received: {file_id}")
    
    # Construct the file path for existence check
    file_path = os.path.join(settings.UPLOAD_DIR, file_id)
    
    # Validate file existence before attempting deletion
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File {file_id} not found")
    
    try:
        # Attempt to delete the file from the file system
        os.remove(file_path)
        
        # Return success confirmation
        return {"status": "success", "message": f"File {file_id} deleted successfully"}
    except Exception as e:
        # Handle any errors during file deletion
        logger.error(f"File deletion failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"File deletion failed: {str(e)}")
