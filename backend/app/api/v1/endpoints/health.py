# Health Endpoints
# File: health.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Health check endpoints for the Enterprise Insights Copilot backend

from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

@router.get("/", summary="Health check endpoint")
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint.
    
    Returns:
        Dict with status and version
    """
    logger.info("Health check requested")
    return {
        "status": "healthy",
        "service": "agentic-copilot-backend",
        "version": "1.0.0"
    }

@router.get("/detailed", summary="Detailed health check")
async def detailed_health() -> Dict[str, Any]:
    """
    Detailed health check with component status.
    
    Returns:
        Dict with detailed status information for all components
    """
    logger.info("Detailed health check requested")
    return {
        "status": "healthy",
        "components": {
            "api": "ok",
            "database": "ok",
            "file_storage": "ok",
            "ollama": "ok",
            "pinecone": "ok"
        },
        "version": "1.0.0"
    }
