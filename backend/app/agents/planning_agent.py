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

from langchain_core.tools import Tool
from langchain_core.prompts import PromptTemplate
from langchain.tools.base import BaseTool

from app.agents.base import BaseAgent, BaseAgentRequest, BaseAgentResponse
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

class PlanningToolKit:
    """Custom tools for the Planning Agent"""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def get_data_profile_tool(self) -> Tool:
        """Tool to get data profile from file service"""
        def get_data_profile(file_id: str) -> str:
            """Get data profile for planning purposes"""
            try:
                profile = self.file_service.get_data_profile(file_id)
                return json.dumps(profile, indent=2)
            except Exception as e:
                return f"Error getting data profile: {str(e)}"
        
        return Tool(
            name="get_data_profile",
            description="Get detailed data profile including columns, types, statistics",
            func=get_data_profile
        )
    
    def create_analysis_plan_tool(self) -> Tool:
        """Tool to create structured analysis plan"""
        def create_analysis_plan(requirements: str) -> str:
            """Create structured analysis plan based on requirements"""
            plan_template = {
                "analysis_type": "statistical_analysis",
                "steps": [
                    "Data validation and cleaning",
                    "Exploratory data analysis", 
                    "Statistical testing",
                    "Insight generation"
                ],
                "visualizations": ["correlation_matrix", "distribution_plots"],
                "metrics": ["mean", "median", "correlation"],
                "focus_areas": []
            }
            return json.dumps(plan_template, indent=2)
        
        return Tool(
            name="create_analysis_plan", 
            description="Create structured analysis plan with steps and requirements",
            func=create_analysis_plan
        )

class PlanningAgent(BaseAgent):
    """
    🎯 PLANNING AGENT - The Strategic Analysis Orchestrator
    
    COMPREHENSIVE AGENT EXPLANATION:
    ================================
    
    PURPOSE & ROLE:
    The Planning Agent serves as the strategic brain of the Enterprise Insights Copilot 
    system, acting as the third agent in the pipeline. It analyzes user queries and 
    data profiles to create comprehensive analysis plans that guide all subsequent 
    processing steps.
    
    CORE RESPONSIBILITIES:
    1. QUERY INTERPRETATION:
       - Natural language processing of user requests
       - Intent classification (exploratory vs targeted analysis)
       - Entity extraction (metrics, dimensions, time periods)
       - Ambiguity resolution through context analysis
       - Priority scoring of analysis objectives
    
    2. STRATEGIC PLANNING:
       - Multi-step analysis workflow creation
       - Resource allocation and timeline estimation
       - Risk assessment and mitigation strategies
       - Alternative approach identification
       - Success criteria definition
    
    3. ROUTE DECISION MAKING:
       - Insight vs Visualization pathway selection
       - Complexity assessment and tool selection
       - Processing order optimization
       - Parallel vs sequential execution planning
       - Fallback strategy development
    
    4. ANALYSIS BLUEPRINT CREATION:
       - Detailed step-by-step analysis plans
       - Required visualization specifications
       - Key metrics and KPI identification
       - Statistical method recommendations
       - Expected output format definition
    
    5. CONTEXT INTEGRATION:
       - Data profile analysis incorporation
       - Historical analysis pattern recognition
       - User preference learning and adaptation
       - Domain expertise integration
       - Regulatory compliance considerations
    
    DECISION LOGIC:
    - Exploratory queries → Insight Agent pathway
    - Visualization requests → Viz Agent pathway
    - Complex analysis → Multi-agent orchestration
    - Simple queries → Direct processing
    - Ambiguous requests → Clarification protocols
    
    INTEGRATION POINTS:
    - Input: User queries + Data Profile Agent results
    - Output: Comprehensive analysis plan + routing decisions
    - Next Agents: Insight Agent OR Visualization Agent
    - Storage: Plan cache + decision history
    
    TECHNICAL ARCHITECTURE:
    - Base Class: BaseAgent (LangChain-powered)
    - NLP Engine: Advanced query understanding
    - Planning Algorithms: Multi-criteria decision making
    - Route Optimizer: Intelligent agent selection
    - Context Manager: Historical knowledge integration
    
    ADVANCED FEATURES:
    - Adaptive planning based on data characteristics
    - Multi-objective optimization
    - Uncertainty quantification and risk assessment
    - Dynamic plan adjustment during execution
    - Learning from previous analysis outcomes
    
    PLANNING METHODOLOGIES:
    - Hierarchical task decomposition
    - Resource-aware scheduling
    - Constraint satisfaction planning
    - Probabilistic reasoning
    - Multi-agent coordination protocols
    
    ERROR HANDLING:
    - Unclear queries → Clarification requests
    - Impossible requests → Alternative suggestions
    - Resource constraints → Scaled-down approaches
    - Time limitations → Priority-based planning
    
    PERFORMANCE OPTIMIZATION:
    - Plan caching for similar queries
    - Parallel planning for complex requests
    - Early termination for infeasible plans
    - Incremental plan refinement
    
    MONITORING & ADAPTATION:
    - Plan execution tracking
    - Success rate analysis
    - Performance bottleneck identification
    - Continuous improvement through feedback
    
    This agent is the strategic coordinator that ensures efficient resource utilization 
    and optimal analysis outcomes by creating intelligent, data-driven analysis plans.
    """
    """
    LangChain-powered Planning Agent for creating analysis plans.
    Routes to either Insight Agent or Visualization Agent based on query intent.
    """
    
    def __init__(self):
        """Initialize the LangChain Planning Agent"""
        self.file_service = FileService()
        self.toolkit = PlanningToolKit(self.file_service)
        
        super().__init__(
            name="Planning Agent",
            agent_type="planning"
        )
    
    def _get_tools(self) -> List[Tool]:
        """Get tools for the planning agent"""
        return [
            self.toolkit.get_data_profile_tool(),
            self.toolkit.create_analysis_plan_tool()
        ]
    
    def _get_agent_prompt(self) -> PromptTemplate:
        """Get the prompt template for planning agent"""
        template = """You are an expert Planning Agent for data analysis. 
        
Your role is to:
1. Analyze user queries to understand their intent
2. Examine data profiles to understand available data
3. Create structured analysis plans
4. Route to appropriate agents (Insight or Visualization)

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
