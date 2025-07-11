# Vector Store API Endpoints
# File: vector.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: API endpoints for vector store operations

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.services.vector_service import get_vector_service, VectorService
from app.db.vector_store import VectorSearchResult
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

class IndexFileRequest(BaseModel):
    """Request model for indexing file content"""
    file_id: str
    content: str
    metadata: Dict[str, Any]

class IndexInsightRequest(BaseModel):
    """Request model for indexing insights"""
    insight_id: str
    insight_text: str
    metadata: Dict[str, Any]

class SearchRequest(BaseModel):
    """Request model for vector search"""
    query: str
    content_type: Optional[str] = None
    file_id: Optional[str] = None
    top_k: int = 5

class SearchResponse(BaseModel):
    """Response model for vector search"""
    query: str
    results: List[Dict[str, Any]]
    total_results: int

@router.post("/index/file", response_model=Dict[str, Any])
async def index_file_content(
    request: IndexFileRequest,
    vector_service: VectorService = Depends(get_vector_service)
):
    """
    Index file content for semantic search.
    
    Args:
        request: File indexing request
        vector_service: Vector service dependency
        
    Returns:
        Indexing result
    """
    try:
        success = await vector_service.index_file_content(
            file_id=request.file_id,
            content=request.content,
            metadata=request.metadata
        )
        
        if success:
            return {
                "status": "success",
                "message": f"File {request.file_id} indexed successfully",
                "file_id": request.file_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to index file content"
            )
            
    except Exception as e:
        logger.error(f"Error indexing file content: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error indexing file: {str(e)}"
        )

@router.post("/index/insight", response_model=Dict[str, Any])
async def index_insight(
    request: IndexInsightRequest,
    vector_service: VectorService = Depends(get_vector_service)
):
    """
    Index generated insights for future retrieval.
    
    Args:
        request: Insight indexing request
        vector_service: Vector service dependency
        
    Returns:
        Indexing result
    """
    try:
        success = await vector_service.index_insight(
            insight_id=request.insight_id,
            insight_text=request.insight_text,
            metadata=request.metadata
        )
        
        if success:
            return {
                "status": "success",
                "message": f"Insight {request.insight_id} indexed successfully",
                "insight_id": request.insight_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to index insight"
            )
            
    except Exception as e:
        logger.error(f"Error indexing insight: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error indexing insight: {str(e)}"
        )

@router.post("/search", response_model=SearchResponse)
async def search_similar_content(
    request: SearchRequest,
    vector_service: VectorService = Depends(get_vector_service)
):
    """
    Search for similar content using semantic search.
    
    Args:
        request: Search request
        vector_service: Vector service dependency
        
    Returns:
        Search results
    """
    try:
        results = await vector_service.search_similar_content(
            query=request.query,
            content_type=request.content_type,
            file_id=request.file_id,
            top_k=request.top_k
        )
        
        # Convert results to dict format
        result_dicts = []
        for result in results:
            result_dicts.append({
                "id": result.id,
                "content": result.content,
                "metadata": result.metadata,
                "score": result.score
            })
        
        return SearchResponse(
            query=request.query,
            results=result_dicts,
            total_results=len(result_dicts)
        )
        
    except Exception as e:
        logger.error(f"Error searching content: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching content: {str(e)}"
        )

@router.get("/files/{file_id}/chunks", response_model=List[Dict[str, Any]])
async def get_file_chunks(
    file_id: str,
    vector_service: VectorService = Depends(get_vector_service)
):
    """
    Get all chunks for a specific file.
    
    Args:
        file_id: File identifier
        vector_service: Vector service dependency
        
    Returns:
        List of file chunks
    """
    try:
        chunks = await vector_service.get_file_chunks(file_id)
        
        # Convert to dict format
        chunk_dicts = []
        for chunk in chunks:
            chunk_dicts.append({
                "id": chunk.id,
                "content": chunk.content,
                "metadata": chunk.metadata,
                "score": chunk.score
            })
        
        return chunk_dicts
        
    except Exception as e:
        logger.error(f"Error getting file chunks: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting file chunks: {str(e)}"
        )

@router.delete("/files/{file_id}/vectors", response_model=Dict[str, Any])
async def delete_file_vectors(
    file_id: str,
    vector_service: VectorService = Depends(get_vector_service)
):
    """
    Delete all vectors associated with a file.
    
    Args:
        file_id: File identifier
        vector_service: Vector service dependency
        
    Returns:
        Deletion result
    """
    try:
        success = await vector_service.delete_file_vectors(file_id)
        
        if success:
            return {
                "status": "success",
                "message": f"Vectors for file {file_id} deleted successfully",
                "file_id": file_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete file vectors"
            )
            
    except Exception as e:
        logger.error(f"Error deleting file vectors: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting file vectors: {str(e)}"
        )

@router.get("/stats", response_model=Dict[str, Any])
async def get_vector_store_stats(
    vector_service: VectorService = Depends(get_vector_service)
):
    """
    Get statistics about the vector store.
    
    Args:
        vector_service: Vector service dependency
        
    Returns:
        Vector store statistics
    """
    try:
        stats = await vector_service.get_store_stats()
        
        return {
            "status": "success",
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Error getting vector store stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting stats: {str(e)}"
        )

@router.get("/health", response_model=Dict[str, Any])
async def vector_store_health(
    vector_service: VectorService = Depends(get_vector_service)
):
    """
    Check vector store health and connectivity.
    
    Args:
        vector_service: Vector service dependency
        
    Returns:
        Health status
    """
    try:
        # Try to initialize the vector service
        initialized = await vector_service.initialize()
        
        if initialized:
            stats = await vector_service.get_store_stats()
            return {
                "status": "healthy",
                "pinecone_connected": True,
                "embedding_model": "available",
                "index_stats": stats
            }
        else:
            return {
                "status": "degraded",
                "pinecone_connected": False,
                "embedding_model": "available",
                "message": "Running in local-only mode without Pinecone"
            }
            
    except Exception as e:
        logger.error(f"Error checking vector store health: {e}")
        return {
            "status": "unhealthy",
            "pinecone_connected": False,
            "embedding_model": "unknown",
            "error": str(e)
        }
