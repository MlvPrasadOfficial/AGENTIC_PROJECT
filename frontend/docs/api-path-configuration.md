# API Path Configuration Guide

## Overview

This document explains how API paths are configured in the Enterprise Insights Copilot application to avoid common issues like duplicate path prefixes.

## Current Configuration

The application uses the following configuration for API URLs:

- Base API URL: `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)
- API Version Prefix: `/api/v1` (added by backend)
- Resource Paths: `/files/upload`, `/analysis/run`, etc. (relative paths used in API client calls)

## Avoiding Path Duplication

To prevent the duplicate path prefix issue (`/api/v1/api/v1/`) that was fixed on 2025-07-07:

1. The environment variable `NEXT_PUBLIC_API_URL` should contain only the base URL without the API version prefix:
   - Correct: `http://localhost:8000`
   - Incorrect: `http://localhost:8000/api/v1`

2. When making API calls using `apiClient`, always use relative resource paths:
   - Correct: `/files/upload`
   - Incorrect: `/api/v1/files/upload`

3. The `apiClient` will automatically combine:
   - Base URL from `environmentService.apiUrl`
   - API version prefix (`/api/v1`) added by the backend
   - Relative resource path provided in the function call

## Example

```typescript
// Correct usage
const response = await apiClient.uploadFile('/files/upload', file);

// This creates a request to: http://localhost:8000/api/v1/files/upload
// NOT to: http://localhost:8000/api/v1/api/v1/files/upload
```

## Deployment Configuration

When deploying to different environments, ensure that `NEXT_PUBLIC_API_URL` is set to the base URL only:

```
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production
NEXT_PUBLIC_API_URL=https://api.enterpriseinsights.app
```

## Troubleshooting

If you encounter 404 errors with API paths, check:
1. Network requests in browser dev tools to verify the full URL being requested
2. Ensure no duplicate `/api/v1` prefixes in the URL
3. Verify the `environmentService.apiUrl` configuration
4. Check the API client implementation for correct path construction
