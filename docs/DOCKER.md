# Docker Deployment Guide

This guide explains how to build and run ModelPK using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start the application**:
   ```bash
   docker compose up -d
   ```

2. **Access the application**:
   Open your browser and navigate to: `http://localhost:3000`

3. **Stop the application**:
   ```bash
   docker compose down
   ```

### Using Docker CLI

1. **Build the image**:
   ```bash
   docker build -t modelpk:latest .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name modelpk \
     -p 3000:80 \
     --restart unless-stopped \
     modelpk:latest
   ```

3. **Stop the container**:
   ```bash
   docker stop modelpk
   docker rm modelpk
   ```

## Docker Configuration

### Dockerfile

The Dockerfile uses a multi-stage build process:

1. **Build Stage**: Uses Node.js 20 Alpine to build the application
   - Installs dependencies with `npm ci`
   - Builds the production bundle with `npm run build`

2. **Production Stage**: Uses Nginx Alpine for serving
   - Copies built application from builder stage
   - Uses custom nginx configuration for SPA routing
   - Includes health check endpoint

### Nginx Configuration

The application uses a custom Nginx configuration (`nginx.conf`) that includes:

- **SPA Routing**: Routes all requests to `index.html` for client-side routing
- **Gzip Compression**: Enabled for text-based files
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Static Asset Caching**: 1-year cache for immutable assets
- **No-Cache for HTML**: Ensures fresh HTML on each request
- **Health Check Endpoint**: `/health` endpoint for monitoring

### Docker Compose Configuration

The `docker-compose.yml` file includes:

- **Port Mapping**: Maps host port 3000 to container port 80
- **Health Checks**: Automatic health monitoring
- **Restart Policy**: Automatically restarts unless stopped
- **Networking**: Isolated bridge network
- **Labels**: Metadata for container management

## Advanced Usage

### Viewing Logs

```bash
# Docker Compose
docker compose logs -f

# Docker CLI
docker logs -f modelpk
```

### Health Check

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' modelpk

# Access health endpoint directly
curl http://localhost:3000/health
```

### Rebuild and Restart

```bash
# Rebuild and restart with Docker Compose
docker compose up -d --build

# Or with Docker CLI
docker build -t modelpk:latest . && \
docker stop modelpk && \
docker rm modelpk && \
docker run -d --name modelpk -p 3000:80 --restart unless-stopped modelpk:latest
```

### Custom Port

To run on a different port, modify the port mapping:

```bash
# Docker Compose: Edit docker-compose.yml
ports:
  - "8080:80"  # Change 3000 to 8080

# Docker CLI
docker run -d --name modelpk -p 8080:80 --restart unless-stopped modelpk:latest
```

## Troubleshooting

### Container Won't Start

1. Check logs:
   ```bash
   docker compose logs
   ```

2. Ensure port 3000 is not in use:
   ```bash
   lsof -i :3000  # macOS/Linux
   netstat -ano | findstr :3000  # Windows
   ```

### Build Failures

1. Clear Docker cache and rebuild:
   ```bash
   docker compose build --no-cache
   ```

2. Check available disk space:
   ```bash
   docker system df
   docker system prune  # Clean up unused resources
   ```

### Health Check Failing

1. Check if nginx is running inside container:
   ```bash
   docker exec modelpk ps aux
   ```

2. Test health endpoint:
   ```bash
   docker exec modelpk wget --spider http://localhost/health
   ```

## Production Considerations

### Environment Variables

For production deployments, you can pass environment variables:

```yaml
# In docker-compose.yml
environment:
  - NODE_ENV=production
  - CUSTOM_VAR=value
```

### SSL/TLS

For HTTPS, consider:
- Using a reverse proxy (Nginx, Traefik, Caddy)
- Mounting SSL certificates
- Using Let's Encrypt for automatic certificates

### Resource Limits

Add resource constraints in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      memory: 256M
```

### Monitoring

- Use health checks to monitor container status
- Integrate with monitoring tools (Prometheus, Grafana)
- Set up log aggregation (ELK stack, Loki)

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build Docker image
  run: docker build -t modelpk:${{ github.sha }} .

- name: Push to registry
  run: docker push modelpk:${{ github.sha }}
```

### Docker Registry

```bash
# Tag for registry
docker tag modelpk:latest registry.example.com/modelpk:latest

# Push to registry
docker push registry.example.com/modelpk:latest
```

## Support

For issues or questions:
- Check the logs first
- Review this documentation
- Open an issue on the project repository
