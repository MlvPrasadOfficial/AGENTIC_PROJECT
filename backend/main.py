# Main FastAPI application
# File: main.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Entry point for the FastAPI application serving the Enterprise Insights Copilot backend

import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.api import api_router
from app.utils.logger import setup_logger

# Setup application logger
logger = setup_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Enterprise Insights Copilot - An AI-powered data analytics platform",
    version=settings.APP_VERSION,
    docs_url="/api/docs" if settings.SHOW_DOCS else None,
    redoc_url="/api/redoc" if settings.SHOW_DOCS else None,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)},
    )

# Include API router
app.include_router(api_router, prefix=settings.API_PREFIX)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}

if __name__ == "__main__":
    """
    Main entry point for the Enterprise Insights Copilot backend server.
    
    This function initializes and starts the FastAPI application server using uvicorn,
    providing a 3-line timestamp design terminal log for professional startup presentation.
    
    Features:
    - Professional startup logging with timestamp
    - Uvicorn server configuration from settings
    - Production-ready server initialization
    """
    import uvicorn
    from datetime import datetime
    
    # 3-line timestamp design terminal log for backend startup
    # Creates a professional visual separator for server startup
    print("=" * 60)
    # Display server startup message with current timestamp
    print(f"🚀 BACKEND SERVER STARTING | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    # Close the visual separator for clean presentation
    print("=" * 60)
    
    # Initialize and start the FastAPI application server
    # Uses configuration from settings for production-ready deployment
    uvicorn.run(
        "main:app",  # Application instance reference
        host=settings.HOST,  # Server host address from configuration
        port=settings.PORT,  # Server port from configuration
        reload=settings.RELOAD,  # Auto-reload for development
        workers=settings.WORKERS,  # Number of worker processes
    )
