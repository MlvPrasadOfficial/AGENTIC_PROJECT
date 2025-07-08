# Enterprise Insights Copilot - Project Understanding & Backend Plan

## Project Overview

| Aspect | Details |
|--------|---------|
| **Project Name** | Enterprise Insights Copilot |
| **Purpose** | Data analysis platform with AI-driven insights for enterprises |
| **Architecture** | Frontend (Next.js) + Backend (FastAPI) + LLM-powered Agent System |
| **Current Status** | Frontend UI implemented, Backend in progress |

## 8-Agent Pipeline Understanding

| Agent | Purpose | Dependencies | Status |
|-------|---------|-------------|--------|
| **1. File Upload Agent** | Handles data file uploading, validation, and storage | None | Implemented in UI |
| **2. Data Profile Agent** | Analyzes data structure, statistics, and generates data profile report | File Upload Agent | Implemented in UI |
| **3. Planning Agent** | Creates analysis plan based on data profile and user query | Data Profile Agent | Implemented in UI |
| **4. Insight Agent** | Generates insights using LLM based on planning agent output | Planning Agent | Implemented in UI |
| **5. Viz Agent** | Creates visualizations based on insights and planning | Planning Agent | Implemented in UI |
| **6. Critique Agent** | Reviews insights and visualizations for quality and accuracy | Insight Agent, Viz Agent | Implemented in UI |
| **7. Debate Agent** | Explores multiple perspectives on the insights | Critique Agent | Implemented in UI |
| **8. Report Agent** | Generates final report from all agent outputs | Debate Agent | Implemented in UI |

## Example Workflow

1. User uploads sales data CSV file
2. File Upload Agent validates and stores the file
3. Data Profile Agent analyzes columns, data types, statistics
4. User asks "Show me sales trends by region"
5. Planning Agent creates analysis plan (time series by region)
6. Insight Agent generates key findings using LLM
7. Viz Agent creates region-based trend charts
8. Critique Agent reviews insights for accuracy
9. Debate Agent provides multiple perspectives on regional performance
10. Report Agent compiles all into final analysis document

## Backend Development Plan

| Component | Description | Status |
|-----------|-------------|--------|
| **FastAPI App Structure** | Core application setup with routing, middleware, etc. | Completed |
| **File Service** | Service for handling file uploads and storage | In Progress |
| **Agent Base Class** | Base implementation for all agents | In Progress |
| **LLM Integration** | Integration with LLaMA 3.1 or other LLM providers | Pending |
| **RAG System** | Retrieval-Augmented Generation for insights | Pending |
| **LangGraph Workflow** | Agent orchestration with LangGraph | Pending |
| **API Endpoints** | REST endpoints for frontend-backend communication | In Progress |
| **Testing Suite** | Unit and integration tests | Pending |
| **Documentation** | API docs, usage examples, deployment guide | Pending |

## Current Focus

- Implementing File Service for handling uploaded files
- Creating Agent implementations based on the base class
- Setting up LangGraph workflow for agent orchestration
- Developing API endpoints for frontend integration

## Next Steps

1. Complete agent implementations with prompt templates
2. Integrate LLaMA 3.1 for insight generation
3. Implement RAG system for enhanced insights
4. Connect frontend UI to backend API endpoints
5. Add comprehensive testing
6. Deploy MVP for initial testing

_Last Updated: July 8, 2025_
