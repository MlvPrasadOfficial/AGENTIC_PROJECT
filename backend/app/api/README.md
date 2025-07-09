# API Documentation
# File: README.md
# Author: GitHub Copilot
# Date: 2025-07-09
# Purpose: API documentation for Enterprise Insights Copilot Backend

# Enterprise Insights Copilot API Documentation

## Overview

This document provides detailed information about the Enterprise Insights Copilot API endpoints, authentication, and usage. The API allows clients to interact with the agentic data analysis system, upload files, run analysis agents, and conduct chat-based interactions.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

The API uses JWT Bearer token authentication.

### Getting an Access Token

```
POST /auth/token
```

**Request Body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Using the Access Token

Include the token in the Authorization header of your requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints

### Health Check

```
GET /health
```

Returns the health status of the API.

### File Operations

#### Upload File

```
POST /files/upload
```

Upload a file for analysis. Uses multipart/form-data.

**Request:**
- Form field: `file` - The file to upload

**Response:**
```json
{
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "example.csv",
  "file_size": 1024,
  "file_type": "csv",
  "upload_time": "2025-07-09T12:00:00Z"
}
```

#### Get File List

```
GET /files
```

Returns a list of all files uploaded by the authenticated user.

#### Get File Details

```
GET /files/{file_id}
```

Returns detailed information about a specific file.

### Agent Operations

#### Run Agent

```
POST /agents/{agent_type}/run
```

Run a specific agent on a file.

**Request Body:**
```json
{
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "query": "Analyze this dataset and find correlations",
  "context": {
    "additional_parameters": "value"
  }
}
```

**Response:**
Returns the agent's response with analysis results.

#### Get Agent Results

```
GET /agents/{agent_type}/results/{file_id}
```

Returns the results of a specific agent for a specific file.

### Chat Operations

#### Create Chat Session

```
POST /chat/sessions
```

Creates a new chat session.

**Response:**
```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "created_at": "2025-07-09T12:00:00Z",
  "message_count": 0
}
```

#### Get Chat History

```
GET /chat/sessions/{session_id}
```

Returns the message history for a chat session.

#### Send Message

```
POST /chat/sessions/{session_id}/messages
```

Send a message in a chat session.

**Request Body:**
```json
{
  "message": "Analyze the trends in this dataset",
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "use_rag": true,
  "stream": false
}
```

**Response:**
Returns the assistant's response.

#### Stream Message Response

```
POST /chat/sessions/{session_id}/stream
```

Stream a response to a message in chunks.

**Request Body:**
Same as Send Message, but with `stream: true`.

**Response:**
Server-sent events with chunks of the response.

#### WebSocket Connection

```
WebSocket /chat/ws/{session_id}
```

Establish a WebSocket connection for real-time chat.

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server-side error

Error responses include a JSON object with details:

```json
{
  "detail": "Error message describing the issue"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

When rate limit is exceeded, the API returns a `429 Too Many Requests` status code.

## Versioning

The current API version is v1. The version is included in the URL path.

## Support

For API support, contact support@enterpriseinsights.example.com.
