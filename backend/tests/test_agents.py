# Unit Tests for Agents
# File: test_agents.py
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: Unit tests for agent functionality

import pytest
import os
import json
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

from app.agents.base import BaseAgent
from app.agents.file_upload_agent import FileUploadAgent
from app.agents.data_profile_agent import DataProfileAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.insight_agent import InsightAgent
from app.agents.viz_agent import VizAgent
from app.agents.critique_agent import CritiqueAgent
from app.agents.debate_agent import DebateAgent
from app.agents.report_agent import ReportAgent

class TestBaseAgent:
    """Tests for the BaseAgent class"""
    
    def test_initialization(self):
        """Test agent initialization"""
        agent = BaseAgent(name="Test Agent", agent_type="test_agent")
        assert agent.name == "Test Agent"
        assert agent.agent_type == "test_agent"
    
    @pytest.mark.asyncio
    async def test_create_response(self):
        """Test response creation"""
        agent = BaseAgent(name="Test Agent", agent_type="test_agent")
        response = agent._create_response(
            status="success",
            message="Test message",
            result={"key": "value"},
            processing_time=1.5
        )
        
        assert response.agent_name == "Test Agent"
        assert response.agent_type == "test_agent"
        assert response.status == "success"
        assert response.message == "Test message"
        assert response.result == {"key": "value"}
        assert response.processing_time == 1.5
        assert isinstance(response.timestamp, datetime)
    
    @pytest.mark.asyncio
    async def test_call_llm(self):
        """Test LLM calling with mocked client"""
        # Mock the llm_client
        with patch("app.llm.llm_client.llm_client") as mock_client:
            # Set up the mock
            mock_response = MagicMock()
            mock_response.text = "Mocked LLM response"
            mock_response.usage = {"total_tokens": 10}
            
            mock_client.generate = AsyncMock(return_value=mock_response)
            
            # Create agent and call LLM
            agent = BaseAgent(name="Test Agent", agent_type="test_agent")
            result = await agent._call_llm(
                prompt="Test prompt",
                system_message="Test system message",
                temperature=0.7
            )
            
            # Assert results
            assert result == "Mocked LLM response"
            mock_client.generate.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_validate_dependencies(self):
        """Test dependency validation"""
        agent = BaseAgent(name="Test Agent", agent_type="test_agent")
        result = await agent.validate_dependencies({})
        assert result is True

class TestFileUploadAgent:
    """Tests for the FileUploadAgent"""
    
    def setup_method(self):
        """Setup before each test"""
        self.file_service_mock = MagicMock()
        self.agent = FileUploadAgent()
        self.agent.file_service = self.file_service_mock
    
    @pytest.mark.asyncio
    async def test_run_success(self):
        """Test successful run with file info"""
        # Mock file service
        file_info = {
            "id": "test_id",
            "filename": "test.csv",
            "size": 1024,
            "content_type": "text/csv"
        }
        self.file_service_mock.get_file_info = AsyncMock(return_value=file_info)
        
        # Run agent
        response = await self.agent.run(
            query="Analyze this file",
            file_id="test_id"
        )
        
        # Assert
        assert response.status == "success"
        assert "test.csv" in response.message
        self.file_service_mock.get_file_info.assert_called_once_with("test_id")
    
    @pytest.mark.asyncio
    async def test_run_no_file_id(self):
        """Test run without file ID"""
        # Run agent
        response = await self.agent.run(
            query="Analyze this file",
            file_id=None
        )
        
        # Assert
        assert response.status == "error"
        assert "No file ID provided" in response.message

# Add more test classes for other agents here
class TestDataProfileAgent:
    """Tests for the DataProfileAgent"""
    pass

class TestPlanningAgent:
    """Tests for the PlanningAgent"""
    pass

class TestInsightAgent:
    """Tests for the InsightAgent"""
    pass

class TestVizAgent:
    """Tests for the VizAgent"""
    pass

class TestCritiqueAgent:
    """Tests for the CritiqueAgent"""
    pass

class TestDebateAgent:
    """Tests for the DebateAgent"""
    pass

class TestReportAgent:
    """Tests for the ReportAgent"""
    
    def setup_method(self):
        """Setup before each test"""
        self.agent = ReportAgent()
    
    @pytest.mark.asyncio
    async def test_run_no_context(self):
        """Test run without context data"""
        # Run agent
        response = await self.agent.run(
            query="Generate report",
            context=None
        )
        
        # Assert
        assert response.status == "error"
        assert "No context data provided" in response.message
    
    @pytest.mark.asyncio
    async def test_validate_dependencies(self):
        """Test dependency validation"""
        # Test with missing dependencies
        result = await self.agent.validate_dependencies({})
        assert result is False
        
        # Test with minimal dependencies
        result = await self.agent.validate_dependencies({
            "data_profile": {},
            "insights": []
        })
        assert result is True
