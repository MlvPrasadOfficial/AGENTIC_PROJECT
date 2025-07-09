# Authentication Endpoints
# File: auth.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: Authentication endpoints for JWT tokens

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth import (
    Token,
    User,
    authenticate_user,
    create_access_token,
    get_current_active_user,
    fake_users_db,
)
from app.core.config import settings
from app.utils.logger import setup_logger

# Setup logger
logger = setup_logger(__name__)
router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests.
    
    Args:
        form_data: OAuth2 form containing username and password
        
    Returns:
        JWT token response
        
    Raises:
        HTTPException if authentication fails
    """
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    logger.info(f"Created access token for user: {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user (from token)
        
    Returns:
        User data
    """
    return current_user
