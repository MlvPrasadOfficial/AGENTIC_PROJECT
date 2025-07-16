# Configuration settings
# File: config.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Configuration settings for the Enterprise Insights Copilot backend

import os
from typing import List, Dict, Any, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "Enterprise Insights Copilot"
    PROJECT_DESCRIPTION: str = "AI-powered data analysis and insights platform with multi-agent workflow"
    APP_NAME: str = "Agentic Copilot"
    APP_VERSION: str = "1.0.0"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "DEBUG"
    API_PREFIX: str = "/api/v1"
    API_V1_STR: str = "/api/v1"
    API_V1_PREFIX: str = "/api/v1"
    
    # Server settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    RELOAD: bool = True
    WORKERS: int = 1
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "https://localhost:3000"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_HEADERS: List[str] = ["*"]
    
    # File upload settings
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 100000000  # 100MB
    ALLOWED_EXTENSIONS: List[str] = ["csv", "xlsx", "xls", "json", "txt", "pdf"]
    UPLOAD_TIMEOUT: int = 300
    GENERATE_FILE_SUMMARY: bool = True
    
    # Database settings (SQLite for simplicity in this prototype)
    DATABASE_URL: str = "sqlite:///./agentic_copilot.db"
    DATABASE_POOL_SIZE: int = 5
    
    # LLM settings
    LLM_MODEL: str = "llama3:8b"
    USE_LOCAL_LLM: bool = True
    LOCAL_LLM_URL: str = "http://localhost:11434"
    LLM_API_URL: str = "https://api.openai.com/v1/chat/completions"
    LLM_API_KEY: Optional[str] = None
    DEFAULT_SYSTEM_MESSAGE: str = "You are an AI assistant specialized in data analysis."
    LLM_REQUEST_TIMEOUT: int = 60
    
    # Authentication settings
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Change in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # LLM caching settings
    LLM_USE_CACHE: bool = True
    LLM_CACHE_TTL: int = 3600  # 1 hour
    LLM_CACHE_MAX_ENTRIES: int = 1000
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_ECHO: bool = False
    
    # Caching settings
    CACHE_TTL: int = 300
    CACHE_MAX_SIZE: int = 1000
    ENABLE_CACHING: bool = True
    
    # Security settings
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Monitoring & Observability
    ENABLE_METRICS: bool = True
    ENABLE_TRACING: bool = True
    DETAILED_LOGS: bool = True
    METRICS_PORT: int = 9090
    
    # Feature flags
    ENABLE_FILE_UPLOAD: bool = True
    ENABLE_DATA_PREVIEW: bool = True
    ENABLE_AI_AGENTS: bool = True
    ENABLE_RAG: bool = True
    ENABLE_ANALYTICS: bool = True
    
    # Development tools
    AUTO_RELOAD: bool = True
    SHOW_DOCS: bool = True
    INCLUDE_ADMIN_ROUTES: bool = True
    
    # Pinecone settings
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "pineindex"
    PINECONE_HOST: Optional[str] = "https://pineindex-z6a2ifp.svc.aped-4627-b74a.pinecone.io"
    PINECONE_DIMENSION: int = 1024  # Updated to match llama-text-embed-v2
    PINECONE_METRIC: str = "cosine"
    PINECONE_CLOUD: str = "aws"
    PINECONE_REGION: str = "us-east-1"
    PINECONE_TOP_K: int = 10
    PINECONE_INCLUDE_METADATA: bool = True
    PINECONE_INCLUDE_VALUES: bool = False
    PINECONE_BATCH_SIZE: int = 100
    PINECONE_MAX_RETRIES: int = 3
    PINECONE_TIMEOUT: int = 30
    
    # OLLAMA settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"
    OLLAMA_TIMEOUT: int = 120
    OLLAMA_TEMPERATURE: float = 0.7
    OLLAMA_MAX_TOKENS: int = 2048
    
    # RAG settings
    RAG_CHUNK_SIZE: int = 1000
    RAG_CHUNK_OVERLAP: int = 200
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.7
    RAG_EMBEDDING_DIM: int = 384
    RAG_INDEX_DIR: str = "rag_index"
    RAG_ENABLE_RERANKING: bool = True
    
    # LangChain settings
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_PROJECT: str = "agentic-copilot"
    LANGCHAIN_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGCHAIN_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

# Create settings instance - loads from .env file if present
settings = Settings()

# Ensure upload directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), "..", "..", settings.UPLOAD_DIR), exist_ok=True)
