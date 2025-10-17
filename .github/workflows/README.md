# GitHub Actions Workflows

## Docker Image Publishing

The `docker-publish.yml` workflow automatically builds and pushes Docker images to GitHub Container Registry (ghcr.io).

### Setup Instructions

**No additional setup required!**

This workflow uses GitHub Container Registry which is integrated with your GitHub account. The built-in `GITHUB_TOKEN` is automatically used for authentication.

### Workflow Triggers

The workflow runs automatically on:

- **Push to main branch** - Builds and tags as `latest`
- **Pull requests** - Builds and tags as `pr-{number}`
- **Manual trigger** - Can be triggered manually from the Actions tab

### Image Tags

Images are tagged with:

- `latest` - Latest build from main branch
- `main` - Main branch builds
- `pr-123` - Pull request number
- `sha-abc1234` - Git commit SHA
- `v1.0.0`, `v1.0`, `v1` - Semantic version tags (when you push a version tag)

### Multi-Platform Support

Images are built for:
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM, Apple Silicon)

### Using the Published Image

Once the workflow runs successfully, pull and run your image:

```bash
# Pull latest
docker pull ghcr.io/YOUR_GITHUB_USERNAME/modelpk:latest

# Run
docker run -d -p 3000:80 ghcr.io/YOUR_GITHUB_USERNAME/modelpk:latest
```

**Note:** Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username or organization name.

### Making the Image Public

By default, GitHub Container Registry images are private. To make it public:

1. Go to your GitHub profile
2. Click on "Packages" tab
3. Find the `modelpk` package
4. Click on "Package settings"
5. Scroll down to "Danger Zone"
6. Click "Change visibility" and select "Public"

### Creating a Release

To publish a versioned release:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will automatically build and push with tags: `v1.0.0`, `1.0.0`, `1.0`, `1`, and `latest`.

### Monitoring

- View workflow runs in the "Actions" tab of your GitHub repository
- Check packages: https://github.com/YOUR_USERNAME?tab=packages

### Environment Variables

The workflow passes build-time metadata as build args:
- `BUILD_DATE` - Timestamp of the commit
- `VCS_REF` - Git commit SHA
- `VERSION` - Version from metadata

These can be used in your Dockerfile if needed:

```dockerfile
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.version="${VERSION}"
```

### Troubleshooting

**Build fails with "permission denied"**
- Ensure the repository has the correct permissions set
- Go to Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

**Image not appearing in packages**
- Check that the workflow completed successfully in the Actions tab
- Verify the job has `packages: write` permission

**Cannot pull image**
- If the image is private, authenticate with GitHub:
  ```bash
  echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
  ```
- Or make the package public (see "Making the Image Public" above)
