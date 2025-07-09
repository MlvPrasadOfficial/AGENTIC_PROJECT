# Enterprise Insights Copilot - Deployment Guide

## System Requirements

- **Python**: 3.9 or higher
- **Node.js**: 18.0 or higher
- **Storage**: At least 500MB free space
- **Memory**: At least 4GB RAM

## Quick Start

The easiest way to run the application is using our cross-platform starter script:

```bash
# Navigate to the project root
cd path/to/project

# Start both frontend and backend
python start.py
```

This will start both the backend and frontend servers and open the application in your default browser.

## Manual Setup

If you prefer to start each component separately, follow these steps:

### Backend Setup

```bash
# Navigate to the backend directory
cd path/to/project/backend

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to the frontend directory
cd path/to/project/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000 and the backend API at http://localhost:8000.

## Production Deployment

For production deployments, follow these steps:

### Backend Production Setup

```bash
# Build and start the backend with production settings
cd path/to/project/backend

# Set environment variables
export APP_ENVIRONMENT=production
export DEBUG=False

# Start with Gunicorn (recommended for production)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend Production Build

```bash
# Build the frontend for production
cd path/to/project/frontend

# Create optimized build
npm run build

# Serve the built assets with a static file server
npx serve -s out
```

## Environment Configuration

### Backend Environment Variables

- `APP_ENVIRONMENT`: Development or production environment (default: development)
- `DEBUG`: Enable debug mode (default: True in development)
- `LOG_LEVEL`: Logging level (default: DEBUG in development, INFO in production)
- `HOST`: Host to bind to (default: 127.0.0.1)
- `PORT`: Port to bind to (default: 8000)
- `SECRET_KEY`: Secret key for JWT tokens
- `LLM_API_KEY`: API key for LLM access if using external service

### Frontend Environment Variables

Configure these in `.env.local`:

- `NEXT_PUBLIC_API_URL`: URL of the backend API
- `NEXT_PUBLIC_DEBUG`: Enable debug features

## Docker Deployment

Docker configuration files are included for containerized deployment.

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Troubleshooting

### Common Issues

1. **"Cannot connect to backend" error**
   - Check that the backend server is running
   - Verify the API URL configuration in the frontend
   - Check for network or firewall issues

2. **File upload failures**
   - Verify upload directory permissions
   - Check file size limits in server configuration
   - Ensure correct MIME types are allowed

3. **LLM-related errors**
   - Check LLM API key configuration
   - Verify network connectivity to LLM service

### Getting Help

If you encounter issues not covered here, please:
1. Check the application logs
2. Review the API documentation
3. Contact support at support@enterpriseinsightscopilot.com
