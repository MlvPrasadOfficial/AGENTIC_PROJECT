# Data Profile Agent
# File: data_profile_agent.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Data Profile Agent for analyzing data structure and generating profiles

import time
import json
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path

from app.agents.base import BaseAgent, BaseAgentResponse
from app.services.file_service import FileService
from app.schemas.file import FileMetadata
from app.utils.prompts import DATA_PROFILE_PROMPT, DEFAULT_SYSTEM_MESSAGE
from app.core.config import settings
from langchain.prompts import PromptTemplate

class DataProfileAgent(BaseAgent):
    """
    Data Profile Agent responsible for analyzing data structure and generating
    statistical profiles. This is the second agent in the Enterprise Insights Copilot pipeline.
    """
    
    def __init__(self):
        """Initialize the Data Profile Agent"""
        super().__init__(
            name="Data Profile Agent",
            agent_type="data_profile"
        )
        self.file_service = FileService()
    
    async def run(self, 
                 query: str, 
                 context: Optional[Dict[str, Any]] = None,
                 file_id: Optional[str] = None) -> BaseAgentResponse:
        """
        Analyze data file and create profile.
        
        Args:
            query: Description or instructions for profiling
            context: Additional context (e.g., from previous agents)
            file_id: ID of the file to profile
            
        Returns:
            Agent response with data profiling results
        """
        start_time = time.time()
        
        if not file_id:
            return self._create_response(
                status="error",
                message="No file ID provided",
                result={"error": "File ID is required for data profiling"},
                processing_time=time.time() - start_time
            )
        
        try:
            # Get file metadata
            self.logger.info(f"Profiling file with ID: {file_id}")
            file_metadata = await self.file_service.get_file_metadata(file_id)
            
            if not file_metadata:
                return self._create_response(
                    status="error",
                    message=f"File with ID {file_id} not found",
                    result={"error": "File not found"},
                    processing_time=time.time() - start_time
                )
                
            # Load the data
            data = await self.file_service.load_file_data(file_id)
            if data is None:
                return self._create_response(
                    status="error",
                    message=f"Unable to load data from file {file_id}",
                    result={"error": "Data loading failed"},
                    processing_time=time.time() - start_time
                )
                
            # Generate profile
            profile = await self._generate_data_profile(data)
            
            # Generate natural language insights about the profile using LLM
            insights = await self._generate_profile_insights(profile, file_metadata)
            
            result = {
                "file_id": file_id,
                "filename": file_metadata.filename,
                "profile": profile,
                "insights": insights,
                "is_ready_for_planning": True
            }
            
            processing_time = time.time() - start_time
            
            # Update file metadata with profile and processing time
            await self.file_service.update_file_metadata(
                file_id,
                status="profiled",
                processing_time=processing_time,
                profile=profile
            )
            
            return self._create_response(
                status="success",
                message=f"Successfully profiled data in {file_metadata.filename}",
                result=result,
                processing_time=processing_time
            )
            
        except Exception as e:
            self.logger.error(f"Error profiling data: {str(e)}")
            return self._create_response(
                status="error",
                message=f"Error profiling data: {str(e)}",
                result={"error": str(e)},
                processing_time=time.time() - start_time
            )
    
    async def _generate_data_profile(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate a comprehensive profile of the dataframe.
        
        Args:
            data: Pandas DataFrame to profile
            
        Returns:
            Dictionary with profile information
        """
        profile = {
            "row_count": len(data),
            "column_count": len(data.columns),
            "columns": {},
            "missing_values": {},
            "correlations": {},
            "summary_statistics": {}
        }
        
        # Column information
        for column in data.columns:
            col_data = data[column]
            dtype = str(col_data.dtype)
            
            col_profile = {
                "dtype": dtype,
                "unique_values": int(col_data.nunique()),
                "missing_values": int(col_data.isna().sum()),
                "missing_percentage": round(float(col_data.isna().mean() * 100), 2),
            }
            
            # Add type-specific statistics
            if pd.api.types.is_numeric_dtype(col_data):
                col_profile.update({
                    "min": float(col_data.min()) if not pd.isna(col_data.min()) else None,
                    "max": float(col_data.max()) if not pd.isna(col_data.max()) else None,
                    "mean": float(col_data.mean()) if not pd.isna(col_data.mean()) else None,
                    "median": float(col_data.median()) if not pd.isna(col_data.median()) else None,
                    "std": float(col_data.std()) if not pd.isna(col_data.std()) else None,
                })
                
                # Check for potential outliers
                if not pd.isna(col_data.mean()) and not pd.isna(col_data.std()):
                    mean = col_data.mean()
                    std = col_data.std()
                    outliers = col_data[(col_data < mean - 3*std) | (col_data > mean + 3*std)]
                    col_profile["outlier_count"] = len(outliers)
                    col_profile["outlier_percentage"] = round(float(len(outliers) / len(col_data) * 100), 2)
            
            # Categorical data
            elif pd.api.types.is_string_dtype(col_data) or pd.api.types.is_categorical_dtype(col_data):
                # Get value counts for top categories
                value_counts = col_data.value_counts(normalize=True).head(10).to_dict()
                # Convert keys to strings to ensure JSON serialization
                value_counts = {str(k): float(v) for k, v in value_counts.items()}
                col_profile["top_categories"] = value_counts
            
            # Datetime data
            elif pd.api.types.is_datetime64_dtype(col_data):
                col_profile.update({
                    "min": str(col_data.min()) if not pd.isna(col_data.min()) else None,
                    "max": str(col_data.max()) if not pd.isna(col_data.max()) else None,
                })
                
                if not pd.isna(col_data.min()) and not pd.isna(col_data.max()):
                    time_span = col_data.max() - col_data.min()
                    col_profile["time_span_days"] = time_span.days
            
            profile["columns"][column] = col_profile
        
        # Missing values summary
        missing_values = data.isna().sum()
        profile["missing_values"] = {
            "total_missing": int(missing_values.sum()),
            "missing_percentage": round(float(missing_values.sum() / (data.shape[0] * data.shape[1]) * 100), 2),
            "columns_with_missing": int((missing_values > 0).sum()),
            "columns_complete": int((missing_values == 0).sum()),
        }
        
        # Correlation matrix (for numeric columns only)
        numeric_data = data.select_dtypes(include=['number'])
        if len(numeric_data.columns) > 1:
            # Convert correlation matrix to dictionary
            corr_matrix = numeric_data.corr().round(3).to_dict()
            # Make JSON serializable
            profile["correlations"] = {
                str(col): {str(k): float(v) for k, v in vals.items()}
                for col, vals in corr_matrix.items()
            }
        
        # Summary statistics
        profile["summary_statistics"] = {
            "numeric_columns": len(data.select_dtypes(include=['number']).columns),
            "categorical_columns": len(data.select_dtypes(include=['object', 'category']).columns),
            "datetime_columns": len(data.select_dtypes(include=['datetime']).columns),
            "boolean_columns": len(data.select_dtypes(include=['bool']).columns),
            "complete_rows": int((data.isna().sum(axis=1) == 0).sum()),
            "complete_rows_percentage": round(float((data.isna().sum(axis=1) == 0).mean() * 100), 2),
        }
        
        return profile
    
    async def _generate_profile_insights(self, profile: Dict[str, Any], file_metadata: FileMetadata) -> str:
        """
        Generate natural language insights about the data profile using LLM.
        
        Args:
            profile: Data profile dictionary
            file_metadata: File metadata
            
        Returns:
            Natural language insights about the data profile
        """
        # Prepare profile summary for the prompt
        profile_summary = {
            "row_count": profile["row_count"],
            "column_count": profile["column_count"],
            "missing_values": profile["missing_values"],
            "summary_statistics": profile["summary_statistics"],
        }
        
        # Include information about top columns (limit to avoid token overflow)
        column_summaries = []
        for col_name, col_data in list(profile["columns"].items())[:10]:  # Limit to 10 columns
            col_summary = f"Column '{col_name}' ({col_data['dtype']}): "
            if "mean" in col_data:
                col_summary += f"mean={col_data['mean']:.2f}, "
            if "top_categories" in col_data:
                top_cat = list(col_data["top_categories"].items())[:3]  # Top 3 categories
                categories = ", ".join([f"{cat}({pct:.1%})" for cat, pct in top_cat])
                col_summary += f"top categories: {categories}"
            if "missing_percentage" in col_data and col_data["missing_percentage"] > 0:
                col_summary += f", {col_data['missing_percentage']}% missing"
            column_summaries.append(col_summary)
        
        profile_summary["column_highlights"] = "\n".join(column_summaries)
        
        # Format the prompt with profile information
        prompt = DATA_PROFILE_PROMPT + f"""
Dataset: {file_metadata.filename}
Row Count: {profile['row_count']}
Column Count: {profile['column_count']}

Missing Data Summary:
- Total Missing: {profile['missing_values']['total_missing']} cells ({profile['missing_values']['missing_percentage']}%)
- Columns with Missing Data: {profile['missing_values']['columns_with_missing']} of {profile['column_count']}

Column Highlights:
{profile_summary['column_highlights']}

Based on this profile, provide:
1. A concise summary of the dataset
2. Key observations about data quality issues
3. Potential analysis opportunities
4. Recommendations for data preparation
"""
        
        # Call LLM to generate insights
        try:
            return await self._call_llm(
                prompt=prompt, 
                system_message=DEFAULT_SYSTEM_MESSAGE,
                temperature=0.3
            )
        except Exception as e:
            self.logger.error(f"Error generating profile insights: {str(e)}")
            return "Unable to generate insights due to an error."
    
    def _get_tools(self) -> List:
        """Get the tools for this agent"""
        # Data Profile Agent doesn't need complex tools since it mainly analyzes data structure
        return []
    
    def _get_agent_prompt(self) -> PromptTemplate:
        """Get the prompt template for this agent"""
        # ReAct agent prompt template for data profiling
        template = """You are a data profiling agent. Your job is to analyze data structure and generate statistical profiles.

You have access to the following tools:
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

For data profiling tasks:
1. Load and examine the data structure
2. Calculate statistical summaries
3. Identify data quality issues
4. Generate comprehensive profile report

Begin!

Question: {input}
{agent_scratchpad}"""
        
        return PromptTemplate(
            input_variables=["input", "tools", "tool_names", "agent_scratchpad"],
            template=template
        )
