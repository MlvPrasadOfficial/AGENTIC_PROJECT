# Database models
# File: models.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: Database models for persistent storage

from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model for authentication and access control"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    files = relationship("File", back_populates="owner")
    chat_sessions = relationship("ChatSession", back_populates="user")

class File(Base):
    """File metadata model for uploaded files"""
    __tablename__ = "files"
    
    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    upload_time = Column(DateTime, default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    metadata = Column(JSON, nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="files")
    analysis_results = relationship("AnalysisResult", back_populates="file")

class ChatSession(Base):
    """Chat session model"""
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    title = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    """Chat message model"""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    metadata = Column(JSON, nullable=True)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")

class AnalysisResult(Base):
    """Analysis result model for storing agent outputs"""
    __tablename__ = "analysis_results"
    
    id = Column(String, primary_key=True, index=True)
    file_id = Column(String, ForeignKey("files.id"))
    agent_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    result_data = Column(JSON, nullable=True)
    
    # Relationships
    file = relationship("File", back_populates="analysis_results")
