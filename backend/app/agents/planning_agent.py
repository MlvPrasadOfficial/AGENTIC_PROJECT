# Planning Agent
# File: planning_agent.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Planning Agent for creating analysis plans based on data profile and user query

import time
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel

from app.agents.base import BaseAgent, BaseAgentResponse
from app.services.file_service import FileService
from app.schemas.file import FileMetadata
from app.utils.prompts import PLANNING_PROMPT, DEFAULT_SYSTEM_MESSAGE
from app.core.config import settings

class AnalysisPlan(BaseModel):
    """Model for an analysis plan"""
    steps: List[Dict[str, Any]]
    required_visualizations: List[Dict[str, Any]]
    metrics: List[Dict[str, Any]]
    insights_focus: List[str]

class PlanningAgent(BaseAgent):
    """
    Planning Agent responsible for creating analysis plans based on data profile and user query.
    This is the third agent in the Enterprise Insights Copilot pipeline.
    """
    
    def __init__(self):
        """Initialize the Planning Agent"""
        super().__init__(
            name="Planning Agent",
            agent_type="planning"
        )
        self.file_service = FileService()
    
    async def run(self, 
                 query: str, 
                 context: Optional[Dict[str, Any]] = None,
                 file_id: Optional[str] = None) -> BaseAgentResponse:
        """
        Create an analysis plan based on the data profile and user query.
        
        Args:
            query: User's question or analytics request
            context: Additional context including data profile from previous agent
            file_id: ID of the file to use for planning
            
        Returns:
            Agent response with analysis plan
        """
        start_time = time.time()
        
        if not query:
            return self._create_response(
                status="error",
                message="No query provided",
                result={"error": "User query is required for planning"},
                processing_time=time.time() - start_time
            )
            
        if not file_id:
            return self._create_response(
                status="error",
                message="No file ID provided",
                result={"error": "File ID is required for planning"},
                processing_time=time.time() - start_time
            )
        
        try:
            # Get file metadata with profile
            self.logger.info(f"Creating analysis plan for file with ID: {file_id}, Query: '{query}'")
            file_metadata = await self.file_service.get_file_metadata(file_id)
            
            if not file_metadata:
                return self._create_response(
                    status="error",
                    message=f"File with ID {file_id} not found",
                    result={"error": "File not found"},
                    processing_time=time.time() - start_time
                )
                
            # Check if profile exists
            if not file_metadata.profile:
                return self._create_response(
                    status="error",
                    message=f"No profile found for file {file_id}. Run Data Profile Agent first.",
                    result={"error": "Missing data profile"},
                    processing_time=time.time() - start_time
                )
            
            # Get context from previous agents
            data_profile = file_metadata.profile
            
            # Generate analysis plan
            analysis_plan = await self._create_analysis_plan(query, data_profile, file_metadata)
            
            result = {
                "file_id": file_id,
                "filename": file_metadata.filename,
                "query": query,
                "analysis_plan": analysis_plan.dict(),
                "is_ready_for_insight_and_viz": True
            }
            
            processing_time = time.time() - start_time
            
            # Update file metadata with analysis plan
            await self.file_service.update_file_metadata(
                file_id,
                status="planned",
                plan=analysis_plan.dict()
            )
            
            return self._create_response(
                status="success",
                message=f"Successfully created analysis plan for query: '{query}'",
                result=result,
                processing_time=processing_time
            )
            
        except Exception as e:
            self.logger.error(f"Error creating analysis plan: {str(e)}")
            return self._create_response(
                status="error",
                message=f"Error creating analysis plan: {str(e)}",
                result={"error": str(e)},
                processing_time=time.time() - start_time
            )
    
    async def _create_analysis_plan(self, 
                                  query: str, 
                                  data_profile: Dict[str, Any], 
                                  file_metadata: FileMetadata) -> AnalysisPlan:
        """
        Create a detailed analysis plan using the LLM based on the data profile and user query.
        
        Args:
            query: User's question or analytics request
            data_profile: Data profile generated by the Data Profile Agent
            file_metadata: File metadata
            
        Returns:
            Analysis plan with steps, visualizations, metrics, and insights focus
        """
        # Prepare data profile summary for the prompt
        profile_summary = {
            "row_count": data_profile["row_count"],
            "column_count": data_profile["column_count"],
            "columns": {},
            "missing_values": data_profile["missing_values"],
        }
        
        # Include information about columns
        for col_name, col_data in data_profile["columns"].items():
            col_type = col_data["dtype"]
            profile_summary["columns"][col_name] = {
                "type": col_type,
                "missing_percentage": col_data["missing_percentage"]
            }
            
            if "min" in col_data and "max" in col_data:
                profile_summary["columns"][col_name]["range"] = [col_data["min"], col_data["max"]]
                
            if "top_categories" in col_data:
                profile_summary["columns"][col_name]["categories"] = col_data["top_categories"]
        
        # Format the prompt with query and profile information
        column_list = "\n".join([
            f"- {col}: {details['type']}" +
            (f" (range: {details['range'][0]}-{details['range'][1]})" if "range" in details else "") +
            (f" (missing: {details['missing_percentage']}%)" if details['missing_percentage'] > 0 else "")
            for col, details in profile_summary["columns"].items()
        ])
        
        prompt = f"""
User Query: {query}

Dataset: {file_metadata.filename}
Row Count: {profile_summary['row_count']}
Column Count: {profile_summary['column_count']}

Available Columns:
{column_list}

Based on this information, create a detailed analysis plan to answer the user's query. Include:

1. Analysis Steps: Provide a list of analysis steps with specific operations to perform.
2. Visualizations: Recommend specific visualizations that would best represent the data for this query.
3. Key Metrics: Identify important metrics to calculate.
4. Insights Focus: Areas to focus on for generating insights.

Format your response as a structured JSON object with the following structure:
{{
  "steps": [
    {{ "step": 1, "operation": "Filter data...", "description": "..." }},
    ...
  ],
  "required_visualizations": [
    {{ "type": "bar_chart", "x_axis": "column_name", "y_axis": "column_name", "purpose": "..." }},
    ...
  ],
  "metrics": [
    {{ "name": "metric_name", "formula": "...", "description": "..." }},
    ...
  ],
  "insights_focus": ["Focus area 1", "Focus area 2", ...]
}}
"""
        
        # Call LLM to generate analysis plan
        try:
            llm_response = await self._call_llm(
                prompt=prompt, 
                system_message=DEFAULT_SYSTEM_MESSAGE,
                temperature=0.3
            )
            
            # Extract JSON from the response
            json_str = self._extract_json_from_text(llm_response)
            plan_dict = json.loads(json_str)
            
            # Parse into AnalysisPlan
            return AnalysisPlan(**plan_dict)
        except Exception as e:
            self.logger.error(f"Error generating analysis plan: {str(e)}")
            # Return a minimal valid plan in case of error
            return AnalysisPlan(
                steps=[{"step": 1, "operation": "Basic analysis", "description": "Perform basic analysis due to error in planning"}],
                required_visualizations=[{"type": "table", "purpose": "Show raw data"}],
                metrics=[{"name": "count", "formula": "COUNT(*)", "description": "Total count"}],
                insights_focus=["Basic data overview"]
            )
    
    def _extract_json_from_text(self, text: str) -> str:
        """
        Extract JSON from text that might contain additional content.
        
        Args:
            text: Text that contains JSON
            
        Returns:
            Extracted JSON string
        """
        # Find JSON between curly braces
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1
        
        if start_idx == -1 or end_idx == 0:
            raise ValueError("No JSON object found in the text")
            
        json_str = text[start_idx:end_idx]
        
        # Validate JSON
        try:
            json.loads(json_str)
            return json_str
        except json.JSONDecodeError:
            # Try to clean up the JSON
            json_str = json_str.replace('\n', ' ').replace('\r', '')
            # Remove any markdown code block markers
            json_str = json_str.replace('```json', '').replace('```', '')
            # Try again
            json.loads(json_str)  # This will raise an exception if still invalid
            return json_str
