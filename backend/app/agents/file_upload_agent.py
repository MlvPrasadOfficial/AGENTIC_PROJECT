# File Upload Agent
# File: file_upload_agent.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: File Upload Agent for handling file ingestion and validation

import time
from typing import Dict, Any, Optional, List
import os
from datetime import datetime
from pathlib import Path
import mimetypes

from app.agents.base import BaseAgent, BaseAgentResponse
from app.services.file_service import FileService
from app.schemas.file import FileMetadata, FileResponse
from app.utils.prompts import FILE_UPLOAD_PROMPT, DEFAULT_SYSTEM_MESSAGE
from app.core.config import settings

class FileUploadAgent(BaseAgent):
    """
    File Upload Agent responsible for validating and processing uploaded files.
    This is the first agent in the Enterprise Insights Copilot pipeline.
    """
    
    def __init__(self):
        """Initialize the File Upload Agent"""
        super().__init__(
            name="File Upload Agent",
            agent_type="file_upload"
        )
        self.file_service = FileService()
        self.supported_formats = ["csv", "xlsx", "json"]
        self.max_file_size = settings.MAX_UPLOAD_SIZE
        self.upload_directory = Path(settings.UPLOAD_DIRECTORY)
        
        # Ensure upload directory exists
        if not self.upload_directory.exists():
            self.upload_directory.mkdir(parents=True, exist_ok=True)
            self.logger.info(f"Created upload directory at {self.upload_directory}")
    
    async def run(self, 
                 query: str, 
                 context: Optional[Dict[str, Any]] = None,
                 file_id: Optional[str] = None) -> BaseAgentResponse:
        """
        Process an uploaded file.
        
        Args:
            query: Description or instructions about the file
            context: Additional context about the file
            file_id: ID of the file to process
            
        Returns:
            Agent response with file processing results
        """
        start_time = time.time()
        
        if not file_id:
            return self._create_response(
                status="error",
                message="No file ID provided",
                result={"error": "File ID is required"},
                processing_time=time.time() - start_time
            )
        
        try:
            # Get file metadata
            self.logger.info(f"Processing file with ID: {file_id}")
            file_metadata = await self.file_service.get_file_metadata(file_id)
            
            if not file_metadata:
                return self._create_response(
                    status="error",
                    message=f"File with ID {file_id} not found",
                    result={"error": "File not found"},
                    processing_time=time.time() - start_time
                )
                
            # Validate file
            validation_result = await self._validate_file(file_metadata)
            
            if not validation_result["is_valid"]:
                return self._create_response(
                    status="error",
                    message=f"Invalid file: {validation_result['reason']}",
                    result=validation_result,
                    processing_time=time.time() - start_time
                )
            
            # Process file
            processed_file = await self.file_service.process_file(file_id)
            
            # Get structure summary
            file_structure = await self._get_file_structure(file_id)
            
            # Generate LLM summary of the file (if configured)
            file_summary = None
            if settings.GENERATE_FILE_SUMMARY:
                file_summary = await self._generate_file_summary(file_metadata, file_structure)
            
            result = {
                "file_id": file_id,
                "filename": file_metadata.filename,
                "file_type": file_metadata.file_type,
                "size_bytes": file_metadata.size_bytes,
                "structure": file_structure,
                "summary": file_summary,
                "is_ready_for_profiling": True
            }
            
            processing_time = time.time() - start_time
            
            # Update file metadata with processing time
            await self.file_service.update_file_metadata(
                file_id,
                status="processed",
                processing_time=processing_time
            )
            
            return self._create_response(
                status="success",
                message=f"Successfully processed file {file_metadata.filename}",
                result=result,
                processing_time=processing_time
            )
            
        except Exception as e:
            self.logger.error(f"Error processing file: {str(e)}")
            return self._create_response(
                status="error",
                message=f"Error processing file: {str(e)}",
                result={"error": str(e)},
                processing_time=time.time() - start_time
            )
    
    async def _validate_file(self, file_metadata: FileMetadata) -> Dict[str, Any]:
        """
        Validate that the file meets requirements for processing.
        
        Args:
            file_metadata: Metadata of the file to validate
            
        Returns:
            Validation result with is_valid flag and reason if invalid
        """
        # Check file size
        if file_metadata.size_bytes > self.max_file_size:
            return {
                "is_valid": False,
                "reason": f"File too large: {file_metadata.size_bytes} bytes. Maximum allowed size is {self.max_file_size} bytes."
            }
        
        # Check file format
        file_extension = file_metadata.filename.split(".")[-1].lower()
        if file_extension not in self.supported_formats:
            return {
                "is_valid": False,
                "reason": f"Unsupported file format: {file_extension}. Supported formats are: {', '.join(self.supported_formats)}."
            }
        
        # Check if file exists
        file_path = self.upload_directory / file_metadata.file_id
        if not file_path.exists():
            return {
                "is_valid": False,
                "reason": f"File does not exist at expected location: {file_path}"
            }
        
        return {"is_valid": True}
    
    async def _get_file_structure(self, file_id: str) -> Dict[str, Any]:
        """
        Get the structure of the file (columns, data types, etc.)
        
        Args:
            file_id: ID of the file to analyze
            
        Returns:
            Structure information about the file
        """
        return await self.file_service.get_file_structure(file_id)
    
    async def _generate_file_summary(self, file_metadata: FileMetadata, file_structure: Dict[str, Any]) -> str:
        """
        Generate a natural language summary of the file using LLM.
        
        Args:
            file_metadata: File metadata
            file_structure: File structure information
            
        Returns:
            Natural language summary of the file
        """
        # Format the prompt with file information
        prompt = FILE_UPLOAD_PROMPT.format(
            filename=file_metadata.filename,
            file_type=file_metadata.file_type,
            size=f"{file_metadata.size_bytes / 1024:.2f} KB",
            structure=file_structure
        )
        
        # Call LLM to generate summary
        try:
            return await self._call_llm(
                prompt=prompt, 
                system_message=DEFAULT_SYSTEM_MESSAGE,
                temperature=0.3
            )
        except Exception as e:
            self.logger.error(f"Error generating file summary: {str(e)}")
            return "Unable to generate file summary due to an error."
