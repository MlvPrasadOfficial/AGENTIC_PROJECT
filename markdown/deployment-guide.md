# Deployment Guide
# File: deployment-guide.md
# Author: GitHub Copilot
# Date: 2025-07-07
# Purpose: Comprehensive deployment instructions for production environments

## Deployment Overview

This guide covers deploying the Enterprise Insights Copilot to various environments including development, staging, and production. The application supports multiple deployment strategies including traditional servers, containerized deployments, and cloud platforms.

## Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Memory**: Minimum 2GB RAM, recommended 4GB+
- **Storage**: Minimum 10GB free space
- **Network**: Stable internet connection for AI model APIs

### Environment Setup
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows 10+
- **Web Server**: Nginx or Apache (for production)
- **SSL Certificate**: Valid certificate for HTTPS
- **Domain**: Configured domain name (for production)

## Development Deployment

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd JUL7PROJECT/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_APP_NAME="Enterprise Insights Copilot (Dev)"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## Staging Deployment

### Staging Server Setup
```bash
# Update system packages
sudo apt update ; sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -r -s /bin/bash copilot
sudo mkdir -p /opt/copilot
sudo chown copilot:copilot /opt/copilot
```

### Application Deployment
```bash
# Switch to application user
sudo su - copilot

# Clone repository
cd /opt/copilot
git clone <repository-url> .

# Install dependencies
cd frontend
npm ci --production

# Build application
npm run build

# Configure PM2
pm2 start ecosystem.config.js --env staging
pm2 save
pm2 startup
```

### Staging Environment Variables
Create `.env.production` file:
```env
NEXT_PUBLIC_APP_NAME="Enterprise Insights Copilot (Staging)"
NEXT_PUBLIC_APP_URL="https://staging.copilot.company.com"
NEXT_PUBLIC_API_URL="https://api-staging.copilot.company.com"
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## Production Deployment

### Production Server Configuration

#### Server Setup
```bash
# Server hardening
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Install required packages
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx
sudo cp deployment/nginx/production.conf /etc/nginx/sites-available/copilot
sudo ln -s /etc/nginx/sites-available/copilot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL Certificate Setup
```bash
# Obtain SSL certificate
sudo certbot --nginx -d copilot.company.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Docker Deployment

#### Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV NODE_ENV production
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://copilot.company.com
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/nginx:/etc/nginx/conf.d
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
    restart: unless-stopped
```

### Cloud Platform Deployments

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
cd frontend
vercel --prod

# Configure environment variables
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_API_URL production
```

#### AWS Deployment
```bash
# Install AWS CLI
aws configure

# Deploy using AWS Amplify
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

#### Google Cloud Platform
```bash
# Install gcloud CLI
gcloud init

# Deploy to App Engine
echo "runtime: nodejs18" > app.yaml
gcloud app deploy
```

## Database Setup (When Backend is Ready)

### PostgreSQL Configuration
```sql
-- Create database and user
CREATE DATABASE copilot_db;
CREATE USER copilot_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE copilot_db TO copilot_user;

-- Enable required extensions
\c copilot_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

### Database Migration
```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Create database backup
pg_dump copilot_db > backup_$(date +%Y%m%d).sql
```

## Monitoring and Logging

### Application Monitoring
```bash
# Install monitoring tools
npm install -g @pm2/monitor

# Configure monitoring
pm2 monitor <secret-key>

# Set up log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Health Checks
```bash
# Health check endpoint
curl -f http://localhost:3000/api/health

# Application metrics
curl http://localhost:3000/api/metrics
```

### Log Management
```bash
# View application logs
pm2 logs copilot

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Log aggregation (optional)
# Configure with services like ELK Stack or Splunk
```

## Security Configuration

### Environment Security
```bash
# Set secure file permissions
chmod 600 .env.production
chown copilot:copilot .env.production

# Configure firewall
sudo ufw allow from trusted_ip to any port 22
sudo ufw deny 22
sudo ufw enable
```

### Application Security
```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.js optimization
module.exports = {
  compress: true,
  images: {
    domains: ['trusted-domain.com'],
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    optimizeCss: true,
    modularizeImports: {
      'lucide-react': {
        transform: 'lucide-react/dist/esm/icons/{{member}}'
      }
    }
  }
};
```

### CDN Configuration
```nginx
# Nginx caching configuration
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /images/ {
    expires 1M;
    add_header Cache-Control "public";
}
```

## Backup and Recovery

### Automated Backups
```bash
#!/bin/bash
# backup-script.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/copilot"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/copilot

# Backup database (when implemented)
pg_dump copilot_db > $BACKUP_DIR/db_$DATE.sql

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 sync $BACKUP_DIR s3://copilot-backups/
```

### Recovery Procedures
```bash
# Application recovery
sudo systemctl stop copilot
tar -xzf app_backup.tar.gz -C /
sudo systemctl start copilot

# Database recovery (when implemented)
psql copilot_db < db_backup.sql
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear build cache
rm -rf .next
npm run build

# Check for dependency conflicts
npm ls
npm audit fix
```

#### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check memory usage
pm2 monit

# Review slow queries (when backend ready)
# Check PostgreSQL slow query log
```

#### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Test certificate
openssl s_client -connect copilot.company.com:443

# Check certificate expiry
echo | openssl s_client -connect copilot.company.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Rollback Procedures

### Application Rollback
```bash
# Stop current version
pm2 stop copilot

# Restore previous version
git checkout previous-stable-tag
npm ci
npm run build

# Restart application
pm2 restart copilot
```

### Database Rollback (When Implemented)
```bash
# Restore database from backup
psql copilot_db < previous_backup.sql

# Run any necessary data migrations
npm run db:rollback
```

## Support and Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review logs, check disk space, update security patches
- **Monthly**: Performance optimization, dependency updates, backup verification
- **Quarterly**: Security audit, disaster recovery testing, capacity planning

### Support Contacts
- **Technical Issues**: Create GitHub issue or contact development team
- **Security Concerns**: Follow responsible disclosure process
- **Emergency**: Use emergency contact procedures

---

**Note**: This deployment guide covers the frontend application. Backend deployment instructions will be added when the backend implementation is completed.
