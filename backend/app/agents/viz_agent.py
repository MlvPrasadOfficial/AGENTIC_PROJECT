# Visualization Agent
# File: viz_agent.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Visualization Agent for creating data visualizations

import time
import json
import base64
import io
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

from app.agents.base import BaseAgent, BaseAgentResponse
from app.services.file_service import FileService
from app.utils.prompts import VISUALIZATION_PROMPT, DEFAULT_SYSTEM_MESSAGE
from app.core.config import settings

class VizAgent(BaseAgent):
    """
    Visualization Agent responsible for creating data visualizations.
    This is the fifth agent in the Enterprise Insights Copilot pipeline.
    """
    
    def __init__(self):
        """Initialize the Visualization Agent"""
        super().__init__(
            name="Visualization Agent",
            agent_type="viz"
        )
        self.file_service = FileService()
        # Set matplotlib backend for headless operation
        plt.switch_backend('Agg')
        
        # Set style
        sns.set_style("whitegrid")
        plt.style.use('seaborn-v0_8')
    
    async def run(self, 
                 query: str, 
                 context: Optional[Dict[str, Any]] = None,
                 file_id: Optional[str] = None) -> BaseAgentResponse:
        """
        Create visualizations based on insights and analysis.
        
        Args:
            query: User's visualization request
            context: Context from previous agents (profile, plan, insights)
            file_id: ID of the file to visualize
            
        Returns:
            Agent response with visualizations
        """
        start_time = time.time()
        
        if not file_id:
            return self._create_response(
                status="error",
                message="No file ID provided",
                result={"error": "File ID is required for visualization"},
                processing_time=time.time() - start_time
            )
        
        try:
            # Get file metadata and validate dependencies
            self.logger.info(f"Creating visualizations for file with ID: {file_id}")
            file_metadata = await self.file_service.get_file_metadata(file_id)
            
            if not file_metadata:
                return self._create_response(
                    status="error",
                    message=f"File with ID {file_id} not found",
                    result={"error": "File not found"},
                    processing_time=time.time() - start_time
                )
            
            # Validate context
            if not context:
                return self._create_response(
                    status="error",
                    message="No context provided from previous agents",
                    result={"error": "Context with insights is required"},
                    processing_time=time.time() - start_time
                )
            
            data_profile = context.get("data_profile")
            insights = context.get("insights", [])
            
            if not data_profile:
                return self._create_response(
                    status="error",
                    message="Missing data profile",
                    result={"error": "Data profile is required"},
                    processing_time=time.time() - start_time
                )
            
            # Load actual data
            data = await self.file_service.load_file_data(file_id)
            if data is None:
                return self._create_response(
                    status="error",
                    message=f"Unable to load data from file {file_id}",
                    result={"error": "Data loading failed"},
                    processing_time=time.time() - start_time
                )
            
            # Generate visualizations
            visualizations = await self._generate_visualizations(
                query, data_profile, insights, data
            )
            
            result = {
                "file_id": file_id,
                "filename": file_metadata.filename,
                "visualizations": visualizations,
                "query": query,
                "is_ready_for_critique": True
            }
            
            processing_time = time.time() - start_time
            
            # Update file metadata
            await self.file_service.update_file_metadata(
                file_id,
                status="visualized",
                processing_time=processing_time,
                visualizations=visualizations
            )
            
            return self._create_response(
                status="success",
                message=f"Successfully created visualizations for {file_metadata.filename}",
                result=result,
                processing_time=processing_time
            )
            
        except Exception as e:
            self.logger.error(f"Error creating visualizations: {str(e)}")
            return self._create_response(
                status="error",
                message=f"Error creating visualizations: {str(e)}",
                result={"error": str(e)},
                processing_time=time.time() - start_time
            )
    
    async def _generate_visualizations(self, 
                                     query: str, 
                                     data_profile: Dict[str, Any], 
                                     insights: List[Dict[str, Any]],
                                     data: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Generate visualizations based on data profile and insights.
        
        Args:
            query: User's visualization request
            data_profile: Data profile from previous agent
            insights: Insights from insight agent
            data: Actual data as DataFrame
            
        Returns:
            List of visualizations with base64 encoded images
        """
        visualizations = []
        
        # Create visualizations based on insights
        for insight in insights:
            viz = await self._create_visualization_for_insight(insight, data, data_profile)
            if viz:
                visualizations.append(viz)
        
        # Create standard visualizations based on data profile
        standard_viz = await self._create_standard_visualizations(data_profile, data)
        visualizations.extend(standard_viz)
        
        # Create custom visualizations based on query
        custom_viz = await self._create_custom_visualizations(query, data_profile, data)
        visualizations.extend(custom_viz)
        
        return visualizations
    
    async def _create_visualization_for_insight(self, 
                                              insight: Dict[str, Any],
                                              data: pd.DataFrame,
                                              data_profile: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a visualization for a specific insight."""
        insight_type = insight.get("type")
        
        if insight_type == "correlation":
            return await self._create_correlation_plot(insight, data)
        elif insight_type == "distribution":
            return await self._create_distribution_plot(insight, data)
        elif insight_type == "outlier":
            return await self._create_outlier_plot(insight, data)
        elif insight_type == "trend":
            return await self._create_trend_plot(insight, data)
        elif insight_type == "descriptive":
            return await self._create_descriptive_plot(insight, data)
        
        return None
    
    async def _create_correlation_plot(self, 
                                     insight: Dict[str, Any],
                                     data: pd.DataFrame) -> Dict[str, Any]:
        """Create a correlation plot."""
        columns = insight.get("columns", [])
        
        if len(columns) >= 2:
            fig, ax = plt.subplots(figsize=(10, 6))
            
            # Scatter plot
            ax.scatter(data[columns[0]], data[columns[1]], alpha=0.6)
            ax.set_xlabel(columns[0])
            ax.set_ylabel(columns[1])
            ax.set_title(f"Correlation between {columns[0]} and {columns[1]}")
            
            # Add trend line
            z = np.polyfit(data[columns[0]].dropna(), data[columns[1]].dropna(), 1)
            p = np.poly1d(z)
            ax.plot(data[columns[0]], p(data[columns[0]]), "r--", alpha=0.8)
            
            plt.tight_layout()
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode()
            plt.close()
            
            return {
                "type": "correlation",
                "title": f"Correlation Plot: {columns[0]} vs {columns[1]}",
                "description": insight.get("description", ""),
                "image": img_base64,
                "columns": columns,
                "chart_type": "scatter"
            }
        
        return None
    
    async def _create_distribution_plot(self, 
                                      insight: Dict[str, Any],
                                      data: pd.DataFrame) -> Dict[str, Any]:
        """Create a distribution plot."""
        column = insight.get("column")
        
        if column and column in data.columns:
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
            
            # Histogram
            ax1.hist(data[column].dropna(), bins=30, alpha=0.7, edgecolor='black')
            ax1.set_xlabel(column)
            ax1.set_ylabel('Frequency')
            ax1.set_title(f'Distribution of {column}')
            
            # Box plot
            ax2.boxplot(data[column].dropna())
            ax2.set_ylabel(column)
            ax2.set_title(f'Box Plot of {column}')
            
            plt.tight_layout()
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode()
            plt.close()
            
            return {
                "type": "distribution",
                "title": f"Distribution Analysis: {column}",
                "description": insight.get("description", ""),
                "image": img_base64,
                "columns": [column],
                "chart_type": "histogram_boxplot"
            }
        
        return None
    
    async def _create_outlier_plot(self, 
                                 insight: Dict[str, Any],
                                 data: pd.DataFrame) -> Dict[str, Any]:
        """Create an outlier detection plot."""
        column = insight.get("column")
        
        if column and column in data.columns:
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Create box plot with outliers highlighted
            box_plot = ax.boxplot(data[column].dropna(), patch_artist=True)
            
            # Highlight outliers
            outliers = []
            q1 = data[column].quantile(0.25)
            q3 = data[column].quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers = data[(data[column] < lower_bound) | (data[column] > upper_bound)][column]
            
            # Add outlier points
            if not outliers.empty:
                ax.scatter(np.ones(len(outliers)), outliers, color='red', alpha=0.7, s=50)
            
            ax.set_ylabel(column)
            ax.set_title(f'Outlier Detection: {column}')
            ax.grid(True, alpha=0.3)
            
            plt.tight_layout()
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode()
            plt.close()
            
            return {
                "type": "outlier",
                "title": f"Outlier Analysis: {column}",
                "description": insight.get("description", ""),
                "image": img_base64,
                "columns": [column],
                "chart_type": "boxplot_outliers"
            }
        
        return None
    
    async def _create_trend_plot(self, 
                               insight: Dict[str, Any],
                               data: pd.DataFrame) -> Dict[str, Any]:
        """Create a trend plot."""
        columns = insight.get("columns", [])
        
        if len(columns) >= 2:
            datetime_col = columns[0]
            value_col = columns[1]
            
            # Sort by datetime
            sorted_data = data.sort_values(datetime_col)
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Line plot
            ax.plot(sorted_data[datetime_col], sorted_data[value_col], marker='o', linewidth=2, markersize=4)
            ax.set_xlabel(datetime_col)
            ax.set_ylabel(value_col)
            ax.set_title(f'Trend Analysis: {value_col} over {datetime_col}')
            
            # Add trend line
            x_numeric = np.arange(len(sorted_data))
            z = np.polyfit(x_numeric, sorted_data[value_col].dropna(), 1)
            p = np.poly1d(z)
            ax.plot(sorted_data[datetime_col], p(x_numeric), "r--", alpha=0.8, label='Trend Line')
            
            ax.legend()
            ax.grid(True, alpha=0.3)
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode()
            plt.close()
            
            return {
                "type": "trend",
                "title": f"Trend Analysis: {value_col} over time",
                "description": insight.get("description", ""),
                "image": img_base64,
                "columns": columns,
                "chart_type": "line_trend"
            }
        
        return None
    
    async def _create_descriptive_plot(self, 
                                     insight: Dict[str, Any],
                                     data: pd.DataFrame) -> Dict[str, Any]:
        """Create a descriptive statistics plot."""
        column = insight.get("column")
        
        if column and column in data.columns:
            if pd.api.types.is_numeric_dtype(data[column]):
                fig, ax = plt.subplots(figsize=(10, 6))
                
                # Create a detailed histogram with statistics
                ax.hist(data[column].dropna(), bins=30, alpha=0.7, edgecolor='black')
                
                # Add mean and median lines
                mean_val = data[column].mean()
                median_val = data[column].median()
                
                ax.axvline(mean_val, color='red', linestyle='--', label=f'Mean: {mean_val:.2f}')
                ax.axvline(median_val, color='green', linestyle='--', label=f'Median: {median_val:.2f}')
                
                ax.set_xlabel(column)
                ax.set_ylabel('Frequency')
                ax.set_title(f'Descriptive Statistics: {column}')
                ax.legend()
                ax.grid(True, alpha=0.3)
                
                plt.tight_layout()
                
                # Convert to base64
                img_buffer = io.BytesIO()
                plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
                img_buffer.seek(0)
                img_base64 = base64.b64encode(img_buffer.read()).decode()
                plt.close()
                
                return {
                    "type": "descriptive",
                    "title": f"Descriptive Statistics: {column}",
                    "description": insight.get("description", ""),
                    "image": img_base64,
                    "columns": [column],
                    "chart_type": "histogram_stats"
                }
        
        return None
    
    async def _create_standard_visualizations(self, 
                                            data_profile: Dict[str, Any],
                                            data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Create standard visualizations based on data profile."""
        visualizations = []
        
        # Correlation heatmap for numeric columns
        numeric_columns = [col for col in data.columns if pd.api.types.is_numeric_dtype(data[col])]
        
        if len(numeric_columns) >= 2:
            fig, ax = plt.subplots(figsize=(12, 8))
            
            # Create correlation matrix
            corr_matrix = data[numeric_columns].corr()
            
            # Create heatmap
            sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0,
                       square=True, linewidths=0.5, ax=ax)
            
            ax.set_title('Correlation Matrix')
            plt.tight_layout()
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode()
            plt.close()
            
            visualizations.append({
                "type": "correlation_matrix",
                "title": "Correlation Matrix",
                "description": "Correlation matrix showing relationships between numeric variables",
                "image": img_base64,
                "columns": numeric_columns,
                "chart_type": "heatmap"
            })
        
        # Missing values visualization
        missing_data = data.isnull().sum()
        if missing_data.sum() > 0:
            fig, ax = plt.subplots(figsize=(12, 6))
            
            missing_data = missing_data[missing_data > 0].sort_values(ascending=False)
            
            ax.bar(range(len(missing_data)), missing_data.values)
            ax.set_xticks(range(len(missing_data)))
            ax.set_xticklabels(missing_data.index, rotation=45, ha='right')
            ax.set_ylabel('Missing Values Count')
            ax.set_title('Missing Values by Column')
            
            plt.tight_layout()
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode()
            plt.close()
            
            visualizations.append({
                "type": "missing_values",
                "title": "Missing Values Analysis",
                "description": "Bar chart showing missing values count by column",
                "image": img_base64,
                "columns": missing_data.index.tolist(),
                "chart_type": "bar"
            })
        
        return visualizations
    
    async def _create_custom_visualizations(self, 
                                          query: str,
                                          data_profile: Dict[str, Any],
                                          data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Create custom visualizations based on user query."""
        visualizations = []
        
        # Use LLM to suggest visualization types based on query
        viz_suggestions = await self._get_visualization_suggestions(query, data_profile)
        
        for suggestion in viz_suggestions:
            viz = await self._create_visualization_from_suggestion(suggestion, data)
            if viz:
                visualizations.append(viz)
        
        return visualizations
    
    async def _get_visualization_suggestions(self, 
                                           query: str,
                                           data_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get visualization suggestions from LLM."""
        prompt = VISUALIZATION_PROMPT.format(
            query=query,
            data_profile=json.dumps(data_profile, indent=2)
        )
        
        try:
            llm_response = await self._call_llm(prompt, DEFAULT_SYSTEM_MESSAGE)
            
            # Parse suggestions (simple implementation)
            suggestions = []
            
            # Look for common visualization keywords
            if "scatter" in llm_response.lower():
                suggestions.append({"type": "scatter", "description": "Scatter plot"})
            if "histogram" in llm_response.lower():
                suggestions.append({"type": "histogram", "description": "Histogram"})
            if "bar" in llm_response.lower():
                suggestions.append({"type": "bar", "description": "Bar chart"})
            if "line" in llm_response.lower():
                suggestions.append({"type": "line", "description": "Line chart"})
            
            return suggestions
            
        except Exception as e:
            self.logger.error(f"Error getting visualization suggestions: {str(e)}")
            return []
    
    async def _create_visualization_from_suggestion(self, 
                                                  suggestion: Dict[str, Any],
                                                  data: pd.DataFrame) -> Optional[Dict[str, Any]]:
        """Create a visualization from an LLM suggestion."""
        # Simple implementation - would be enhanced with more sophisticated parsing
        viz_type = suggestion.get("type")
        
        if viz_type == "scatter" and len(data.select_dtypes(include=[np.number]).columns) >= 2:
            numeric_cols = data.select_dtypes(include=[np.number]).columns[:2]
            
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.scatter(data[numeric_cols[0]], data[numeric_cols[1]], alpha=0.6)
            ax.set_xlabel(numeric_cols[0])
            ax.set_ylabel(numeric_cols[1])
            ax.set_title(f'Scatter Plot: {numeric_cols[0]} vs {numeric_cols[1]}')
            
            plt.tight_layout()
            
            # Convert to base64
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
            img_buffer.seek(0)
            img_base64 = base64.b64encode(img_buffer.read()).decode()
            plt.close()
            
            return {
                "type": "custom_scatter",
                "title": f"Scatter Plot: {numeric_cols[0]} vs {numeric_cols[1]}",
                "description": suggestion.get("description", ""),
                "image": img_base64,
                "columns": list(numeric_cols),
                "chart_type": "scatter"
            }
        
        return None
    
    async def validate_dependencies(self, context: Dict[str, Any]) -> bool:
        """
        Validate that data profile is available.
        
        Args:
            context: Context data from previous agents
            
        Returns:
            True if dependencies are met, False otherwise
        """
        return (
            context is not None and 
            "data_profile" in context
        )
