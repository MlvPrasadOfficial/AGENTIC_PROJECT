# API Router
# File: api.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Central API router for the Enterprise Insights Copilot backend

from fastapi import APIRouter

from app.api.v1.endpoints import health, files, agents, chat, auth

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
