# Logging configuration
# File: logger.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Setup logging for the Enterprise Insights Copilot backend

import logging
import sys
import os
from datetime import datetime
from pathlib import Path

from app.core.config import settings

# Create logs directory if it doesn't exist
logs_dir = Path(__file__).parent.parent.parent.parent / "logs"
logs_dir.mkdir(exist_ok=True)

# Get current date for log filename
current_date = datetime.now().strftime("%Y-%m-%d")

def setup_logger(name: str, log_file: str = None) -> logging.Logger:
    """
    Set up a logger with file and console handlers
    
    Args:
        name: Logger name
        log_file: Optional specific log filename
    
    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Create file handler if requested or based on module
    if log_file is None:
        module_name = name.split(".")[-1]
        log_file = f"{current_date}_{module_name}.log"
    
    file_handler = logging.FileHandler(os.path.join(logs_dir, log_file))
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Don't propagate to root logger
    logger.propagate = False
    
    return logger

# Create specific loggers for major components
def get_agent_logger(agent_name: str) -> logging.Logger:
    """Get a logger specifically for an agent"""
    return setup_logger(f"app.agents.{agent_name}", f"{current_date}_agent_{agent_name}.log")

def get_api_logger() -> logging.Logger:
    """Get a logger for API endpoints"""
    return setup_logger("app.api", f"{current_date}_api.log")

def get_service_logger(service_name: str) -> logging.Logger:
    """Get a logger for a specific service"""
    return setup_logger(f"app.services.{service_name}", f"{current_date}_service_{service_name}.log")
