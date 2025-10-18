# Deployment Guide

## Overview

ModelPK can be deployed at any URL path (root, subdirectory, or nested paths) thanks to relative path configuration.

## Build Configuration

The app is configured to work at any URL path automatically:

1. **Vite Config** - `vite.config.ts` has `base: './'` for relative asset paths
2. **Router Config** - `main.tsx` automatically detects the base path from the URL

This allows the app to work at:
- Root level: `https://example.com/`
- Subdirectory: `https://example.com/modelpk/`
- Nested paths: `https://example.com/apps/modelpk/`

**No configuration changes needed** - the same build works everywhere!

## Building for Production

```bash
# Build the application
npm run build

# The output will be in the 'dist' folder
```

## Deployment Options

### Option 1: Docker Container (Recommended)

**For any path deployment:**

```bash
# Build the Docker image
docker build -t modelpk .

# Run at root level (http://example.com/)
docker run -d -p 80:80 modelpk

# Run at subdirectory (http://example.com/modelpk/)
# Copy dist files to /modelpk/ in your web server
```

**Using docker compose:**

```bash
docker compose up -d
```

### Option 2: Nginx (Direct)

If you're deploying directly to an nginx server at a subdirectory:

**1. Build the app:**
```bash
npm run build
```

**2. Copy dist files to your nginx directory:**
```bash
# For subdirectory deployment
scp -r dist/* user@server:/var/www/html/modelpk/
```

**3. Configure nginx:**

For **root deployment** (`http://example.com/`):
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

For **subdirectory deployment** (`http://example.com/modelpk/`):
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    location /modelpk/ {
        alias /var/www/html/modelpk/;
        try_files $uri $uri/ /modelpk/index.html;
        index index.html;
    }
}
```

For **multiple subdirectories** (flexible pattern):
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;

    # Generic pattern for any subdirectory
    location ~ ^/([^/]+)/(.*)$ {
        alias /var/www/html/$1/;
        try_files $uri $uri/ /$1/index.html;
        index index.html;
    }

    # Root fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**4. Reload nginx:**
```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Option 3: Apache

For **subdirectory deployment** with Apache:

**1. Copy files:**
```bash
scp -r dist/* user@server:/var/www/html/modelpk/
```

**2. Create `.htaccess` in the subdirectory:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /modelpk/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /modelpk/index.html [L]
</IfModule>
```

**3. Ensure mod_rewrite is enabled:**
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Option 4: Static Hosting Services

The app works out-of-the-box with relative paths on:

**Netlify / Vercel / Cloudflare Pages:**
- Just connect your repo and deploy
- Works at both root and subdirectory paths

**GitHub Pages:**
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

**AWS S3 + CloudFront:**
```bash
npm run build
aws s3 sync dist/ s3://your-bucket/modelpk/ --delete
```

## Troubleshooting

### Assets returning 404

**Problem:** Assets are loading from wrong path (e.g., `/assets/...` instead of `/modelpk/assets/...`)

**Solution:**
1. Ensure `vite.config.ts` has `base: './'`
2. Rebuild: `npm run build`
3. Clear browser cache
4. Check nginx/apache config has correct `try_files` rules

### Routing not working (404 on refresh)

**Problem:** Refreshing the page on `/config` returns 404

**Solution:**
- Ensure your web server is configured to fallback to `index.html` for all routes
- Check the nginx/apache examples above

### CORS errors with LLM APIs

**Problem:** API calls to OpenAI/Gemini/etc fail with CORS errors

**Solution:**
- This is expected for browser-based apps
- Some providers (like Anthropic) require a backend proxy
- Ollama can be configured to allow CORS
- OpenRouter works as a proxy for most APIs

## Security Checklist

Before deploying to production:

- [ ] Set appropriate CORS policies for your domain
- [ ] Enable HTTPS (use Let's Encrypt for free certificates)
- [ ] Add security headers (CSP, HSTS, X-Frame-Options)
- [ ] Set proper cache headers for static assets
- [ ] Disable directory listing
- [ ] Keep dependencies updated

## Environment Variables

ModelPK runs entirely in the browser and doesn't use environment variables. All configuration is done through the UI and stored locally in IndexedDB.

## Updating the Deployment

To update to a new version:

```bash
# Pull latest changes from repository
git pull git@github.com:tanker327/modelpk.git main

# Rebuild
npm run build

# Redeploy dist/ folder or rebuild Docker image
docker build -t modelpk .
docker compose up -d
```

## Multi-Instance Deployment

You can deploy multiple instances at different paths:

```nginx
# Dev instance
location /modelpk-dev/ {
    alias /var/www/html/modelpk-dev/;
    try_files $uri $uri/ /modelpk-dev/index.html;
}

# Prod instance
location /modelpk/ {
    alias /var/www/html/modelpk/;
    try_files $uri $uri/ /modelpk/index.html;
}
```

Each instance will have its own isolated storage (IndexedDB is origin + path specific).

## Monitoring

### Health Check

The Docker image includes a health check endpoint:

```bash
curl http://your-server/health
# Returns: healthy
```

### Logs

**Docker logs:**
```bash
docker compose logs -f
```

**Nginx logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check web server error logs
3. Verify nginx/apache configuration
4. Open an issue on [GitHub](https://github.com/tanker327/modelpk/issues)
