# Enterprise Insights Copilot: Project Understanding & Backend Development Plan

## Project Understanding Summary

| Aspect | Description |
|--------|-------------|
| **Project Name** | Enterprise Insights Copilot |
| **Project Type** | AI-Powered Data Analytics Platform with Multi-Agent Architecture |
| **Frontend** | Next.js 14+, Tailwind CSS, shadcn/ui, D3.js, Glassmorphism UI |
| **Backend** | FastAPI, LangChain, LangGraph, Pinecone, OLLAMA (Llama 3.1) |
| **Infrastructure** | Vercel (Frontend), Render (Backend), Docker, GitHub Actions |
| **Architecture** | 8-Agent Vertical Pipeline with RAG Integration |
| **Primary Use Case** | Business analytics through natural language queries |

## 8-Agent Pipeline Workflow

| # | Agent | Purpose | Dependencies | Output |
|---|-------|---------|-------------|--------|
| 1 | **File Upload Agent** | Handles file ingestion and validation | None | Uploaded file metadata |
| 2 | **Data Profile Agent** | Analyzes data schema, statistics, nulls | File Upload Agent | Data profile stats |
| 3 | **Planning Agent** | Routes user queries to appropriate agent | Data Profile Agent | Route decision |
| 4 | **Insight Agent** | Generates textual analytics insights | Planning Agent | Text analysis |
| 5 | **Viz Agent** | Creates D3.js visualizations | Planning Agent | Chart configs |
| 6 | **Critique Agent** | Reviews quality of insights/visualizations | Insight Agent & Viz Agent | Quality assessment |
| 7 | **Debate Agent** | Multi-perspective analysis | Critique Agent | Final response |
| 8 | **Report Agent** | Compiles workflow outputs to PDF | Debate Agent | Downloadable report |

## Example Workflow

1. User uploads sales.csv file → **File Upload Agent** processes it
2. **Data Profile Agent** automatically analyzes data structure and statistics
3. User asks: "Show me sales trends by region as a chart" in chat
4. **Planning Agent** determines this needs visualization and routes to **Viz Agent**
5. **Viz Agent** generates D3.js configuration for a line chart
6. **Critique Agent** evaluates the visualization quality
7. **Debate Agent** considers multiple perspectives and finalizes the response
8. **Report Agent** compiles the analysis into a downloadable PDF
9. User receives final response in chat and visualization in bottom panel

## Backend Development Plan

| Phase | Tasks | Priority | Status |
|-------|-------|----------|--------|
| **Setup** | Create FastAPI project structure<br>Install dependencies<br>Configure environment variables | High | Not Started |
| **Agent Architecture** | Implement BaseAgent class<br>Create individual agent implementations<br>Setup LangGraph workflow | High | Not Started |
| **File Handling** | Create file upload endpoints<br>Implement CSV/JSON/Excel parsers<br>Setup data validation | High | Not Started |
| **RAG Integration** | Connect Pinecone client<br>Implement document chunking<br>Setup embedding pipeline | Medium | Not Started |
| **LLM Integration** | Configure OLLAMA connection<br>Implement prompt templates<br>Setup LangChain chains | High | Not Started |
| **API Endpoints** | Create endpoints for all agents<br>Implement WebSocket for streaming<br>Add authentication | High | Not Started |
| **Data Processing** | Create data profiling service<br>Implement statistical analysis<br>Setup chart generation | Medium | Not Started |
| **Testing** | Unit tests for agents<br>Integration tests for workflow<br>Mock LLM responses | Medium | Not Started |
| **Documentation** | API documentation<br>Setup Swagger UI<br>Environment setup guide | Low | Not Started |
| **Deployment** | Create Dockerfile<br>Setup Render deployment<br>Configure CI/CD | Low | Not Started |

## Technical Implementation Details

```python
# Backend core architecture will follow this pattern:

# 1. Base Agent Class
class BaseAgent:
    def __init__(self, name, model_name=None):
        self.name = name
        self.model_name = model_name or os.getenv("OLLAMA_MODEL")
    
    async def run(self, input_data, context=None):
        # To be implemented by subclasses
        raise NotImplementedError

# 2. LangGraph Workflow Implementation
def build_agent_workflow():
    graph = StateGraph()
    
    # Add nodes for each agent
    graph.add_node("file_upload", FileUploadAgent().run)
    graph.add_node("data_profile", DataProfileAgent().run)
    graph.add_node("planning", PlanningAgent().run)
    graph.add_node("insight", InsightAgent().run)
    graph.add_node("viz", VizAgent().run)
    graph.add_node("critique", CritiqueAgent().run)
    graph.add_node("debate", DebateAgent().run)
    graph.add_node("report", ReportAgent().run)
    
    # Define the workflow connections
    graph.add_edge("file_upload", "data_profile")
    graph.add_edge("data_profile", "planning")
    
    # Conditional routing
    graph.add_conditional_edges(
        "planning",
        lambda output: output["route"],
        {
            "insight": "insight",
            "viz": "viz"
        }
    )
    
    graph.add_edge("insight", "critique")
    graph.add_edge("viz", "critique")
    graph.add_edge("critique", "debate")
    graph.add_edge("debate", "report")
    
    return graph.compile()
```

## Next Steps

1. Create backend project structure
2. Implement environment configuration
3. Build FastAPI server with initial routes
4. Implement file upload and processing
5. Create agent base class and first implementations
6. Connect with frontend via API endpoints
7. Implement RAG and LLM integration
8. Add testing and deployment configuration
