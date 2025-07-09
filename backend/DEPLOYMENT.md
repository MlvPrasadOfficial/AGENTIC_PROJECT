# Deployment Guide for Enterprise Insights Copilot
# Author: GitHub Copilot
# Date: 2025-07-09

# Enterprise Insights Copilot Deployment Guide

This guide provides instructions for deploying the Enterprise Insights Copilot backend in production environments.

## System Requirements

- Python 3.10+ (recommended: 3.11)
- PostgreSQL 15+ (or SQLite for development)
- 8GB+ RAM (16GB recommended)
- 4+ CPU cores (8+ recommended)
- 100GB+ storage space
- Linux-based OS (Ubuntu 22.04 LTS recommended)
- NVIDIA GPU (optional, for faster LLM processing)

## Installation Options

### 1. Docker Deployment (Recommended)

#### Prerequisites
- Docker 24+
- Docker Compose 2.18+

#### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/example/enterprise-insights-copilot.git
   cd enterprise-insights-copilot
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. Verify the deployment:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

### 2. Manual Deployment

#### Prerequisites
- Python 3.10+
- PostgreSQL 15+
- Nginx (for production)
- Supervisord (for process management)

#### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/example/enterprise-insights-copilot.git
   cd enterprise-insights-copilot
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up the database:
   ```bash
   python -m app.db.init_db
   ```

6. Start the application with Gunicorn:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
   ```

## Configuration Options

### Environment Variables

The application can be configured using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Deployment environment | `development` |
| `DEBUG` | Enable debug mode | `False` in production |
| `PORT` | Server port | `8000` |
| `WORKERS` | Number of worker processes | `4` |
| `DATABASE_URL` | Database connection string | `postgresql://user:password@localhost:5432/dbname` |
| `SECRET_KEY` | Secret key for JWT tokens | `your-secret-key` (change this!) |
| `LLM_MODEL` | LLM model to use | `llama3:8b` |
| `USE_LOCAL_LLM` | Whether to use local LLM | `True` |
| `LOCAL_LLM_URL` | URL for local LLM server | `http://localhost:11434` |
| `LLM_API_KEY` | API key for remote LLM | None |
| `UPLOAD_DIR` | Directory for file uploads | `uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `100000000` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Database Setup

For PostgreSQL (recommended for production):

1. Create a database:
   ```sql
   CREATE DATABASE enterprise_insights;
   CREATE USER insights_user WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE enterprise_insights TO insights_user;
   ```

2. Update your `.env` file:
   ```
   DATABASE_URL=postgresql://insights_user:your-password@localhost:5432/enterprise_insights
   ```

### LLM Configuration

The system supports both local (via Ollama) and remote LLM providers:

#### Local Ollama Setup

1. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. Pull the required model:
   ```bash
   ollama pull llama3:8b
   ```

3. Start the Ollama service:
   ```bash
   ollama serve
   ```

4. Configure the application to use local LLM:
   ```
   USE_LOCAL_LLM=True
   LOCAL_LLM_URL=http://localhost:11434
   ```

#### Remote LLM API

To use a remote LLM API provider:

1. Obtain an API key from your provider
2. Configure the application:
   ```
   USE_LOCAL_LLM=False
   LLM_API_URL=https://api.your-provider.com/v1/chat/completions
   LLM_API_KEY=your-api-key
   ```

## Production Deployment with Nginx and Supervisord

For a production deployment, we recommend using Nginx as a reverse proxy and Supervisord for process management.

### Nginx Configuration

Create a new Nginx site configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/v1/chat/ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    client_max_body_size 100M;
}
```

### Supervisord Configuration

Create a Supervisord configuration file:

```ini
[program:enterprise-insights]
command=/path/to/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 127.0.0.1:8000
directory=/path/to/enterprise-insights-copilot
user=www-data
autostart=true
autorestart=true
stdout_logfile=/var/log/enterprise-insights-stdout.log
stderr_logfile=/var/log/enterprise-insights-stderr.log
environment=ENVIRONMENT=production,DATABASE_URL=postgresql://insights_user:your-password@localhost:5432/enterprise_insights
```

## Scaling Considerations

For higher traffic scenarios, consider:

1. **Load Balancing**: Deploy multiple instances behind a load balancer
2. **Database Scaling**: 
   - Use connection pooling
   - Consider read replicas for high-read workloads
3. **Caching**: Implement Redis for caching responses
4. **Kubernetes Deployment**: For highly scalable deployments

## Monitoring and Maintenance

### Health Checks

The API provides a health endpoint at `/api/v1/health` that can be used for monitoring.

### Logging

Logs are written to the standard output and can be captured by your container orchestration or log management system.

### Backup Strategy

For production deployments, implement regular database backups:

```bash
pg_dump -U insights_user enterprise_insights > backup_$(date +%Y%m%d).sql
```

## Security Considerations

1. **Secure your environment variables**: Never commit .env files to version control
2. **Use HTTPS**: Always deploy with TLS in production
3. **Implement rate limiting**: To prevent abuse
4. **Regular updates**: Keep dependencies updated to patch security vulnerabilities
5. **Principle of least privilege**: For database users and API tokens

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check database credentials and connectivity
   - Verify PostgreSQL is running and accessible

2. **LLM errors**:
   - Check if Ollama service is running (for local LLM)
   - Verify API key and endpoint (for remote LLM)

3. **File upload issues**:
   - Check file size limits in both application and web server
   - Verify upload directory permissions

### Getting Help

For issues not covered in this guide, please:

1. Check the troubleshooting section in the README
2. Consult the GitHub repository issues
3. Contact support@enterpriseinsights.example.com
