# Insight Agent
# File: insight_agent.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Insight Agent for generating insights using LLM analysis

import time
import json
from typing import Dict, Any, Optional, List
import pandas as pd
from datetime import datetime

from langchain_core.tools import Tool
from langchain_core.prompts import PromptTemplate

from app.agents.base import BaseAgent, BaseAgentRequest, BaseAgentResponse
from app.services.file_service import FileService
from app.utils.prompts import INSIGHT_ANALYSIS_PROMPT, DEFAULT_SYSTEM_MESSAGE
from app.core.config import settings

class InsightToolKit:
    """Custom tools for the Insight Agent"""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def analyze_data_statistics_tool(self) -> Tool:
        """Tool to analyze data statistics"""
        def analyze_data_statistics(file_id: str) -> str:
            """Analyze statistical properties of the data"""
            try:
                # Get data from file service
                data = self.file_service.get_file_data(file_id)
                df = pd.DataFrame(data)
                
                # Calculate statistics
                stats = {
                    "shape": df.shape,
                    "numeric_columns": df.select_dtypes(include=['number']).columns.tolist(),
                    "categorical_columns": df.select_dtypes(include=['object']).columns.tolist(),
                    "missing_values": df.isnull().sum().to_dict(),
                    "basic_stats": df.describe().to_dict()
                }
                
                return json.dumps(stats, indent=2, default=str)
            except Exception as e:
                return f"Error analyzing statistics: {str(e)}"
        
        return Tool(
            name="analyze_data_statistics",
            description="Analyze statistical properties and characteristics of the data",
            func=analyze_data_statistics
        )
    
    def generate_insights_tool(self) -> Tool:
        """Tool to generate data insights"""
        def generate_insights(analysis_context: str) -> str:
            """Generate insights based on analysis context"""
            # This would typically use more sophisticated analysis
            insights = {
                "key_findings": ["Pattern identified in data distribution"],
                "trends": ["Upward trend in recent periods"],
                "anomalies": ["Outliers detected in specific ranges"],
                "recommendations": ["Consider further investigation of outliers"]
            }
            return json.dumps(insights, indent=2)
        
        return Tool(
            name="generate_insights",
            description="Generate actionable insights based on data analysis",
            func=generate_insights
        )

class InsightAgent(BaseAgent):
    """
    LangChain-powered Insight Agent for generating statistical insights and business intelligence.
    Alternative route from Planning Agent alongside Visualization Agent.
    """
    
    def __init__(self):
        """Initialize the LangChain Insight Agent"""
        self.file_service = FileService()
        self.toolkit = InsightToolKit(self.file_service)
        
        super().__init__(
            name="Insight Agent",
            agent_type="insight"
        )
    
    def _get_tools(self) -> List[Tool]:
        """Get tools for the insight agent"""
        return [
            self.toolkit.analyze_data_statistics_tool(),
            self.toolkit.generate_insights_tool()
        ]
    
    def _get_agent_prompt(self) -> PromptTemplate:
        """Get the prompt template for insight agent"""
        template = """You are an expert Insight Agent for data analysis and business intelligence.

Your role is to:
1. Analyze data to identify patterns, trends, and anomalies
2. Generate actionable business insights
3. Provide statistical summaries and interpretations
4. Answer specific analytical questions about the data

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

Focus on providing:
- Clear and actionable insights
- Statistical evidence for your conclusions
- Business-relevant interpretations
- Specific recommendations based on data

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
    
    async def run(self, 
                 query: str, 
                 context: Optional[Dict[str, Any]] = None,
                 file_id: Optional[str] = None) -> BaseAgentResponse:
        """
        Generate insights based on data profile and analysis plan.
        
        Args:
            query: User's question or insight request
            context: Context from previous agents (profile, plan)
            file_id: ID of the file to analyze
            
        Returns:
            Agent response with insights
        """
        start_time = time.time()
        
        if not file_id:
            return self._create_response(
                status="error",
                message="No file ID provided",
                result={"error": "File ID is required for insight generation"},
                processing_time=time.time() - start_time
            )
        
        try:
            # Get file metadata and validate dependencies
            self.logger.info(f"Generating insights for file with ID: {file_id}")
            file_metadata = await self.file_service.get_file_metadata(file_id)
            
            if not file_metadata:
                return self._create_response(
                    status="error",
                    message=f"File with ID {file_id} not found",
                    result={"error": "File not found"},
                    processing_time=time.time() - start_time
                )
            
            # Validate that we have profile and plan from previous agents
            if not context:
                return self._create_response(
                    status="error",
                    message="No context provided from previous agents",
                    result={"error": "Context with data profile and plan is required"},
                    processing_time=time.time() - start_time
                )
            
            data_profile = context.get("data_profile")
            analysis_plan = context.get("analysis_plan")
            
            if not data_profile or not analysis_plan:
                return self._create_response(
                    status="error",
                    message="Missing data profile or analysis plan",
                    result={"error": "Both data profile and analysis plan are required"},
                    processing_time=time.time() - start_time
                )
            
            # Load actual data for analysis
            data = await self.file_service.load_file_data(file_id)
            if data is None:
                return self._create_response(
                    status="error",
                    message=f"Unable to load data from file {file_id}",
                    result={"error": "Data loading failed"},
                    processing_time=time.time() - start_time
                )
            
            # Generate insights
            insights = await self._generate_insights(query, data_profile, analysis_plan, data)
            
            result = {
                "file_id": file_id,
                "filename": file_metadata.filename,
                "insights": insights,
                "query": query,
                "is_ready_for_visualization": True
            }
            
            processing_time = time.time() - start_time
            
            # Update file metadata with insights
            await self.file_service.update_file_metadata(
                file_id,
                status="insights_generated",
                processing_time=processing_time,
                insights=insights
            )
            
            return self._create_response(
                status="success",
                message=f"Successfully generated insights for {file_metadata.filename}",
                result=result,
                processing_time=processing_time
            )
            
        except Exception as e:
            self.logger.error(f"Error generating insights: {str(e)}")
            return self._create_response(
                status="error",
                message=f"Error generating insights: {str(e)}",
                result={"error": str(e)},
                processing_time=time.time() - start_time
            )
    
    async def _generate_insights(self, 
                               query: str, 
                               data_profile: Dict[str, Any], 
                               analysis_plan: Dict[str, Any],
                               data: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Generate insights based on data profile, analysis plan, and actual data.
        
        Args:
            query: User's question or insight request
            data_profile: Data profile from previous agent
            analysis_plan: Analysis plan from planning agent
            data: Actual data as DataFrame
            
        Returns:
            List of insights with supporting analysis
        """
        insights = []
        
        # Execute each analysis step from the plan
        for step in analysis_plan.get("steps", []):
            step_insights = await self._execute_analysis_step(step, data_profile, data, query)
            insights.extend(step_insights)
        
        # Generate overall insights and patterns
        overall_insights = await self._generate_overall_insights(data_profile, data, query)
        insights.extend(overall_insights)
        
        return insights
    
    async def _execute_analysis_step(self, 
                                   step: Dict[str, Any], 
                                   data_profile: Dict[str, Any],
                                   data: pd.DataFrame,
                                   query: str) -> List[Dict[str, Any]]:
        """
        Execute a single analysis step from the plan.
        
        Args:
            step: Analysis step definition
            data_profile: Data profile information
            data: Actual data
            query: User's question
            
        Returns:
            List of insights from this step
        """
        step_type = step.get("type", "general")
        columns = step.get("columns", [])
        
        insights = []
        
        if step_type == "descriptive":
            insights = await self._generate_descriptive_insights(columns, data, data_profile)
        elif step_type == "correlation":
            insights = await self._generate_correlation_insights(columns, data, data_profile)
        elif step_type == "distribution":
            insights = await self._generate_distribution_insights(columns, data, data_profile)
        elif step_type == "outlier":
            insights = await self._generate_outlier_insights(columns, data, data_profile)
        elif step_type == "trend":
            insights = await self._generate_trend_insights(columns, data, data_profile)
        else:
            # General analysis using LLM
            insights = await self._generate_general_insights(step, data, data_profile, query)
        
        return insights
    
    async def _generate_descriptive_insights(self, 
                                           columns: List[str], 
                                           data: pd.DataFrame,
                                           data_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate descriptive statistics insights."""
        insights = []
        
        for column in columns:
            if column in data.columns:
                col_profile = data_profile["columns"][column]
                
                # Create insight based on column type
                if pd.api.types.is_numeric_dtype(data[column]):
                    insight = {
                        "type": "descriptive",
                        "column": column,
                        "title": f"Statistical Summary for {column}",
                        "description": f"The column {column} has mean {col_profile.get('mean', 'N/A')}, "
                                     f"with values ranging from {col_profile.get('min', 'N/A')} to {col_profile.get('max', 'N/A')}",
                        "metrics": {
                            "mean": col_profile.get("mean"),
                            "median": col_profile.get("median"),
                            "std": col_profile.get("std"),
                            "min": col_profile.get("min"),
                            "max": col_profile.get("max")
                        },
                        "significance": "medium"
                    }
                    insights.append(insight)
        
        return insights
    
    async def _generate_correlation_insights(self, 
                                           columns: List[str], 
                                           data: pd.DataFrame,
                                           data_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate correlation insights between numeric columns."""
        insights = []
        
        # Get numeric columns
        numeric_columns = [col for col in columns if pd.api.types.is_numeric_dtype(data[col])]
        
        if len(numeric_columns) >= 2:
            # Calculate correlations
            corr_matrix = data[numeric_columns].corr()
            
            # Find strong correlations
            for i, col1 in enumerate(numeric_columns):
                for j, col2 in enumerate(numeric_columns):
                    if i < j:  # Avoid duplicates
                        corr_value = corr_matrix.loc[col1, col2]
                        
                        if abs(corr_value) > 0.7:  # Strong correlation
                            insight = {
                                "type": "correlation",
                                "columns": [col1, col2],
                                "title": f"Strong Correlation between {col1} and {col2}",
                                "description": f"There is a {'positive' if corr_value > 0 else 'negative'} "
                                             f"correlation of {corr_value:.3f} between {col1} and {col2}",
                                "metrics": {
                                    "correlation": corr_value,
                                    "strength": "strong" if abs(corr_value) > 0.8 else "moderate"
                                },
                                "significance": "high" if abs(corr_value) > 0.8 else "medium"
                            }
                            insights.append(insight)
        
        return insights
    
    async def _generate_distribution_insights(self, 
                                            columns: List[str], 
                                            data: pd.DataFrame,
                                            data_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate distribution insights."""
        insights = []
        
        for column in columns:
            if column in data.columns:
                col_data = data[column]
                col_profile = data_profile["columns"][column]
                
                if pd.api.types.is_numeric_dtype(col_data):
                    # Check for skewness
                    skewness = col_data.skew()
                    
                    if abs(skewness) > 1:
                        insight = {
                            "type": "distribution",
                            "column": column,
                            "title": f"Distribution Pattern in {column}",
                            "description": f"The column {column} shows {'right' if skewness > 0 else 'left'} "
                                         f"skewed distribution with skewness of {skewness:.3f}",
                            "metrics": {
                                "skewness": skewness,
                                "type": "right_skewed" if skewness > 0 else "left_skewed"
                            },
                            "significance": "medium"
                        }
                        insights.append(insight)
        
        return insights
    
    async def _generate_outlier_insights(self, 
                                       columns: List[str], 
                                       data: pd.DataFrame,
                                       data_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate outlier insights."""
        insights = []
        
        for column in columns:
            if column in data.columns:
                col_profile = data_profile["columns"][column]
                
                outlier_count = col_profile.get("outlier_count", 0)
                outlier_percentage = col_profile.get("outlier_percentage", 0)
                
                if outlier_count > 0 and outlier_percentage > 5:  # Significant outliers
                    insight = {
                        "type": "outlier",
                        "column": column,
                        "title": f"Outliers Detected in {column}",
                        "description": f"Found {outlier_count} outliers in {column} "
                                     f"({outlier_percentage:.1f}% of data)",
                        "metrics": {
                            "outlier_count": outlier_count,
                            "outlier_percentage": outlier_percentage
                        },
                        "significance": "high" if outlier_percentage > 10 else "medium"
                    }
                    insights.append(insight)
        
        return insights
    
    async def _generate_trend_insights(self, 
                                     columns: List[str], 
                                     data: pd.DataFrame,
                                     data_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate trend insights for time series data."""
        insights = []
        
        # Look for datetime columns
        datetime_columns = [col for col in data.columns if pd.api.types.is_datetime64_dtype(data[col])]
        
        if datetime_columns:
            # Simple trend analysis
            for datetime_col in datetime_columns:
                for numeric_col in columns:
                    if numeric_col in data.columns and pd.api.types.is_numeric_dtype(data[numeric_col]):
                        # Sort by date and check for trends
                        sorted_data = data.sort_values(datetime_col)
                        
                        # Simple linear trend check
                        x_values = range(len(sorted_data))
                        y_values = sorted_data[numeric_col].values
                        
                        # Calculate simple correlation with time
                        if len(x_values) > 1:
                            corr_with_time = pd.Series(x_values).corr(pd.Series(y_values))
                            
                            if abs(corr_with_time) > 0.3:  # Some trend
                                insight = {
                                    "type": "trend",
                                    "columns": [datetime_col, numeric_col],
                                    "title": f"Trend in {numeric_col} over time",
                                    "description": f"{numeric_col} shows a {'increasing' if corr_with_time > 0 else 'decreasing'} "
                                                 f"trend over time with correlation {corr_with_time:.3f}",
                                    "metrics": {
                                        "trend_correlation": corr_with_time,
                                        "direction": "increasing" if corr_with_time > 0 else "decreasing"
                                    },
                                    "significance": "high" if abs(corr_with_time) > 0.7 else "medium"
                                }
                                insights.append(insight)
        
        return insights
    
    async def _generate_general_insights(self, 
                                       step: Dict[str, Any], 
                                       data: pd.DataFrame,
                                       data_profile: Dict[str, Any],
                                       query: str) -> List[Dict[str, Any]]:
        """Generate general insights using LLM."""
        # Prepare context for LLM
        context = {
            "step": step,
            "data_profile": data_profile,
            "query": query,
            "data_sample": data.head(5).to_dict() if not data.empty else {}
        }
        
        # Create prompt for LLM
        prompt = INSIGHT_ANALYSIS_PROMPT.format(
            query=query,
            data_profile=json.dumps(data_profile, indent=2),
            analysis_step=json.dumps(step, indent=2),
            data_sample=json.dumps(context["data_sample"], indent=2)
        )
        
        # Call LLM
        try:
            llm_response = await self._call_llm(prompt, DEFAULT_SYSTEM_MESSAGE)
            
            # Parse LLM response into insights
            insights = await self._parse_llm_insights(llm_response, step)
            
            return insights
            
        except Exception as e:
            self.logger.error(f"Error generating general insights: {str(e)}")
            return []
    
    async def _generate_overall_insights(self, 
                                       data_profile: Dict[str, Any],
                                       data: pd.DataFrame,
                                       query: str) -> List[Dict[str, Any]]:
        """Generate overall insights using LLM."""
        # Create comprehensive prompt
        prompt = f"""
        Based on the following data profile and user query, generate key insights:
        
        User Query: {query}
        
        Data Profile:
        {json.dumps(data_profile, indent=2)}
        
        Please provide 3-5 key insights that directly address the user's query.
        Focus on the most important patterns, trends, or findings in the data.
        """
        
        try:
            llm_response = await self._call_llm(prompt, DEFAULT_SYSTEM_MESSAGE)
            
            # Parse response into structured insights
            insights = await self._parse_llm_insights(llm_response, {"type": "overall"})
            
            return insights
            
        except Exception as e:
            self.logger.error(f"Error generating overall insights: {str(e)}")
            return []
    
    async def _parse_llm_insights(self, 
                                llm_response: str, 
                                step: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse LLM response into structured insights."""
        insights = []
        
        # Simple parsing - split by lines and create insights
        lines = llm_response.strip().split('\n')
        
        current_insight = None
        for line in lines:
            line = line.strip()
            
            if line.startswith('- ') or line.startswith('• '):
                if current_insight:
                    insights.append(current_insight)
                
                current_insight = {
                    "type": step.get("type", "general"),
                    "title": line[2:].strip(),
                    "description": line[2:].strip(),
                    "metrics": {},
                    "significance": "medium"
                }
            elif line and current_insight:
                current_insight["description"] += " " + line
        
        if current_insight:
            insights.append(current_insight)
        
        # If no structured insights found, create a general one
        if not insights and llm_response.strip():
            insights.append({
                "type": step.get("type", "general"),
                "title": "AI Analysis Result",
                "description": llm_response.strip(),
                "metrics": {},
                "significance": "medium"
            })
        
        return insights
    
    async def validate_dependencies(self, context: Dict[str, Any]) -> bool:
        """
        Validate that data profile and analysis plan are available.
        
        Args:
            context: Context data from previous agents
            
        Returns:
            True if dependencies are met, False otherwise
        """
        return (
            context is not None and 
            "data_profile" in context and 
            "analysis_plan" in context
        )
