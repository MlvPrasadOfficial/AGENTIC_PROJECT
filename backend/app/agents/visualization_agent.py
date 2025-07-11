# Visualization Agent  
# File: visualization_agent.py
# Author: GitHub Copilot
# Date: 2025-07-11
# Purpose: LangChain-powered Visualization Agent for chart and graph generation

import json
from typing import Dict, Any, List
from datetime import datetime

from langchain_core.tools import Tool
from langchain_core.prompts import PromptTemplate

from app.agents.base import BaseAgent, BaseAgentRequest, BaseAgentResponse
from app.services.file_service import FileService
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class VisualizationToolKit:
    """Custom tools for the Visualization Agent"""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def create_chart_config_tool(self) -> Tool:
        """Tool to create chart configuration"""
        def create_chart_config(requirements: str) -> str:
            """Create D3.js chart configuration based on requirements"""
            # Parse requirements and create chart config
            chart_config = {
                "type": "bar_chart",
                "title": "Data Visualization",
                "data_source": "uploaded_file",
                "x_axis": {"field": "category", "label": "Category"},
                "y_axis": {"field": "value", "label": "Value"},
                "dimensions": {"width": 800, "height": 400},
                "colors": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                "interactive": True,
                "animations": True
            }
            return json.dumps(chart_config, indent=2)
        
        return Tool(
            name="create_chart_config",
            description="Create D3.js chart configuration for data visualization",
            func=create_chart_config
        )
    
    def get_visualization_types_tool(self) -> Tool:
        """Tool to get available visualization types"""
        def get_visualization_types(data_info: str) -> str:
            """Get suitable visualization types based on data"""
            viz_types = {
                "numerical_data": ["bar_chart", "line_chart", "histogram", "scatter_plot"],
                "categorical_data": ["pie_chart", "donut_chart", "stacked_bar"],
                "time_series": ["line_chart", "area_chart", "time_bar"],
                "correlations": ["scatter_plot", "correlation_matrix", "heatmap"],
                "distributions": ["histogram", "box_plot", "violin_plot"]
            }
            return json.dumps(viz_types, indent=2)
        
        return Tool(
            name="get_visualization_types",
            description="Get suitable visualization types based on data characteristics",
            func=get_visualization_types
        )

class VisualizationAgent(BaseAgent):
    """
    LangChain-powered Visualization Agent for creating chart configurations and visualizations.
    Alternative route from Planning Agent alongside Insight Agent.
    """
    
    def __init__(self):
        """Initialize the LangChain Visualization Agent"""
        self.file_service = FileService()
        self.toolkit = VisualizationToolKit(self.file_service)
        
        super().__init__(
            name="Visualization Agent",
            agent_type="visualization"
        )
    
    def _get_tools(self) -> List[Tool]:
        """Get tools for the visualization agent"""
        return [
            self.toolkit.create_chart_config_tool(),
            self.toolkit.get_visualization_types_tool()
        ]
    
    def _get_agent_prompt(self) -> PromptTemplate:
        """Get the prompt template for visualization agent"""
        template = """You are an expert Visualization Agent for creating data visualizations.

Your role is to:
1. Analyze data characteristics to determine the best visualization types
2. Create detailed chart configurations for D3.js rendering
3. Consider user intent and data types when selecting visualizations
4. Ensure accessibility and clarity in visualization design

You have access to these tools:
{tools}

Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Create visualizations that are:
- Appropriate for the data type and user query
- Interactive and engaging
- Accessible and clear
- Optimized for web display

Question: {input}
{agent_scratchpad}"""
        
        return PromptTemplate(
            template=template,
            input_variables=["input", "agent_scratchpad"],
            partial_variables={
                "tools": "\n".join([f"{tool.name}: {tool.description}" for tool in self._get_tools()]),
                "tool_names": ", ".join([tool.name for tool in self._get_tools()])
            }
        )
