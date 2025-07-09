# Database CRUD operations
# File: crud.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: CRUD operations for database models

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import uuid
from datetime import datetime

from app.db.models import User, File, ChatSession, ChatMessage, AnalysisResult
from app.core.auth import get_password_hash, verify_password
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# User CRUD operations
def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get list of users"""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, username: str, email: str, password: str, full_name: Optional[str] = None) -> User:
    """Create new user"""
    hashed_password = get_password_hash(password)
    db_user = User(
        username=username,
        email=email,
        full_name=full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"Created user: {username}")
    return db_user

# File CRUD operations
def create_file(
    db: Session, 
    filename: str, 
    file_path: str, 
    file_size: int, 
    file_type: str, 
    content_type: str, 
    owner_id: int,
    metadata: Optional[Dict[str, Any]] = None
) -> File:
    """Create file entry in database"""
    file_id = str(uuid.uuid4())
    db_file = File(
        id=file_id,
        filename=filename,
        file_path=file_path,
        file_size=file_size,
        file_type=file_type,
        content_type=content_type,
        owner_id=owner_id,
        metadata=metadata
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    logger.info(f"Created file entry: {filename} (ID: {file_id})")
    return db_file

def get_file(db: Session, file_id: str) -> Optional[File]:
    """Get file by ID"""
    return db.query(File).filter(File.id == file_id).first()

def get_files(db: Session, owner_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[File]:
    """Get list of files, optionally filtered by owner"""
    query = db.query(File)
    if owner_id is not None:
        query = query.filter(File.owner_id == owner_id)
    return query.offset(skip).limit(limit).all()

# Chat session CRUD operations
def create_chat_session(db: Session, user_id: int, title: Optional[str] = None) -> ChatSession:
    """Create new chat session"""
    session_id = str(uuid.uuid4())
    db_session = ChatSession(
        id=session_id,
        user_id=user_id,
        title=title or f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    logger.info(f"Created chat session: {session_id} for user {user_id}")
    return db_session

def get_chat_session(db: Session, session_id: str) -> Optional[ChatSession]:
    """Get chat session by ID"""
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()

def get_user_chat_sessions(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[ChatSession]:
    """Get chat sessions for a user"""
    return db.query(ChatSession).filter(ChatSession.user_id == user_id).offset(skip).limit(limit).all()

# Chat message CRUD operations
def create_chat_message(
    db: Session, 
    session_id: str, 
    role: str, 
    content: str, 
    metadata: Optional[Dict[str, Any]] = None
) -> ChatMessage:
    """Create new chat message"""
    message_id = str(uuid.uuid4())
    db_message = ChatMessage(
        id=message_id,
        session_id=session_id,
        role=role,
        content=content,
        metadata=metadata
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_chat_messages(db: Session, session_id: str, skip: int = 0, limit: int = 100) -> List[ChatMessage]:
    """Get messages for a chat session"""
    return db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).offset(skip).limit(limit).all()

# Analysis result CRUD operations
def create_analysis_result(
    db: Session,
    file_id: str,
    agent_type: str,
    result_data: Dict[str, Any]
) -> AnalysisResult:
    """Create new analysis result"""
    result_id = str(uuid.uuid4())
    db_result = AnalysisResult(
        id=result_id,
        file_id=file_id,
        agent_type=agent_type,
        result_data=result_data
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    logger.info(f"Created analysis result: {result_id} for file {file_id}")
    return db_result

def get_file_analysis_results(db: Session, file_id: str) -> List[AnalysisResult]:
    """Get all analysis results for a file"""
    return db.query(AnalysisResult).filter(AnalysisResult.file_id == file_id).all()

def get_file_agent_result(db: Session, file_id: str, agent_type: str) -> Optional[AnalysisResult]:
    """Get specific agent result for a file"""
    return db.query(AnalysisResult).filter(
        AnalysisResult.file_id == file_id,
        AnalysisResult.agent_type == agent_type
    ).first()
