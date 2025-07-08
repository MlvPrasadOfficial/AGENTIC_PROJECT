# Prompt Templates
# File: prompts.py
# Author: GitHub Copilot
# Date: 2025-07-08
# Purpose: Prompt templates for LLM interactions

# Default system message for general agent interactions
DEFAULT_SYSTEM_MESSAGE = """You are an AI assistant specialized in data analysis. 
You are part of an Enterprise Insights Copilot system that helps users analyze their data.
You provide clear, accurate, and actionable insights based on the data provided.
Be concise but thorough, and always focus on extracting meaningful business insights."""

# File Upload Agent prompts
FILE_UPLOAD_PROMPT = """Analyze the provided file metadata and structure.
Confirm if the file is appropriate for analysis and identify any potential issues.

File Information:
- Filename: {filename}
- Type: {file_type}
- Size: {size}
- Structure: {structure}

Provide a brief summary of the file and its suitability for analysis."""

# Data Profile Agent prompts
DATA_PROFILE_PROMPT = """Create a comprehensive profile of the provided dataset.
Analyze the following aspects:
1. Data types and their distributions
2. Missing values and their patterns
3. Statistical summaries of numeric columns
4. Unique values in categorical columns
5. Potential data quality issues
6. Correlations between variables

Data Sample:
{data_sample}

Provide a detailed profile that would help understand this dataset."""

# Planning Agent prompts
PLANNING_PROMPT = """Based on the user query and data profile, determine the most appropriate analysis path.
You must decide whether to route to the Insight Agent (for textual analysis) or the Viz Agent (for visualization).

User Query: {query}

Data Profile Summary:
{profile_summary}

Your task is to decide which agent should handle this query. Respond with:
- "insight" if the query primarily requires textual insights, explanations, or summaries
- "viz" if the query primarily requires charts, graphs, or visual representations

Explain your reasoning briefly."""

# Insight Agent prompts
INSIGHT_PROMPT = """Generate detailed insights from the data based on the user's query.
Focus on extracting meaningful patterns, trends, anomalies, and actionable intelligence.

User Query: {query}

Data Context:
{data_context}

Provide comprehensive insights that address the user's query."""

# Viz Agent prompts
VIZ_PROMPT = """Create a D3.js visualization configuration based on the user's query.
You need to determine the most appropriate chart type and configuration.

User Query: {query}

Data Context:
{data_context}

Provide a complete configuration object for D3.js that includes:
1. Chart type (bar, line, pie, scatter, etc.)
2. Data mapping and transformations
3. Axes configuration (if applicable)
4. Color scheme
5. Legend and labels

The configuration should be in valid JSON format."""

# Critique Agent prompts
CRITIQUE_PROMPT = """Critique the output from the previous agent.
Your job is to identify any issues, weaknesses, or areas for improvement in the analysis.

Original Query: {query}

Agent Output:
{agent_output}

Evaluate the following aspects:
1. Accuracy and correctness
2. Completeness
3. Clarity and understandability
4. Relevance to the query
5. Visual effectiveness (for visualizations)
6. Actionable insights

Provide a detailed critique with specific suggestions for improvement."""

# Debate Agent prompts
DEBATE_PROMPT = """Consider multiple perspectives on the analyzed data and previous agent outputs.
Your task is to synthesize a final, robust response that considers different viewpoints.

Original Query: {query}

Agent Outputs:
{agent_outputs}

Critique:
{critique}

Consider at least three different perspectives on this data and analysis:
1. The optimistic view
2. The skeptical view
3. The balanced view

Then, synthesize a final response that acknowledges these perspectives and provides
the most balanced, accurate, and useful answer to the user's query."""

# Report Agent prompts
REPORT_PROMPT = """Create a comprehensive PDF report that includes all analysis steps and results.
The report should summarize the entire workflow from data upload to final insights.

Original Query: {query}

Workflow Summary:
{workflow_summary}

The report should include:
1. Executive summary
2. Data overview and quality assessment
3. Analysis methodology
4. Key findings and insights
5. Visualizations (if applicable)
6. Recommendations
7. Appendix with detailed data

Format the report in a professional, well-structured manner suitable for business stakeholders."""
