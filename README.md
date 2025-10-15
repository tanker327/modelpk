# AI Racers

A React-based web application for comparing outputs from different AI models using the same prompt.

## Project Status

✅ **LLM Provider Configuration** - Complete! Configure and test connections to OpenAI, Gemini, Anthropic, xAI, and Ollama.
✅ **Model Comparison UI** - Complete! Compare responses from multiple models side-by-side with timing metrics.

## Tech Stack

### Core
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6** - Build tool and dev server
- **React Router 7** - Client-side routing

### State & Data
- **Zedux 1.3** - Atomic state management
- **Zod 4.1** - Runtime schema validation
- **idb 8** - IndexedDB wrapper for local persistence

### Styling & Components
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **Radix UI** - Unstyled component primitives

### Testing
- **Jest 30** - Test framework
- **Testing Library 16** - React testing utilities

## Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker

Run the application in a Docker container:

```bash
# Build and start with docker compose
docker compose up -d

# View logs
docker compose logs -f

# Stop and remove containers
docker compose down

# Rebuild and restart
docker compose up -d --build
```

The application will be available at `http://localhost:3000`

**Docker Features:**
- Multi-stage build for optimized image size
- Nginx serving with SPA routing support
- Health checks for monitoring
- Gzip compression and security headers
- Static asset caching

For detailed Docker documentation, see `docs/DOCKER.md`

### Project Structure

```
ai-racers/
├── src/
│   ├── components/
│   │   ├── config/      # Configuration page components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility functions
│   ├── pages/
│   │   └── ConfigPage.tsx # Provider configuration page
│   ├── schemas/         # Zod schemas
│   ├── services/
│   │   ├── providers/   # Provider connection testers
│   │   └── storage/     # IndexedDB operations
│   ├── state/
│   │   ├── atoms/       # Zedux atoms
│   │   └── ecosystem.ts # Zedux configuration
│   ├── App.tsx          # Main application component with routing
│   ├── App.test.tsx     # App tests
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── docs/                # Documentation
│   ├── user-guide/
│   │   └── configuration.md # User guide for provider config
│   └── IMPLEMENTATION.md    # Technical implementation docs
├── public/              # Static assets
├── dist/                # Production build output
├── openspec/            # OpenSpec documentation
├── jest.config.js       # Jest configuration
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## OpenSpec Workflow

This project follows the OpenSpec workflow for spec-driven development:

- **Proposals**: See `openspec/changes/` for active changes
- **Specs**: See `openspec/specs/` for current specifications

### Completed Changes

- `init-hello-world-app` - ✅ Basic React + TypeScript + Vite setup
- `setup-project-libraries` - ✅ All libraries installed and configured
- `add-llm-config-page` - ✅ LLM provider configuration with testing

## Features

### LLM Provider Configuration

Configure and test connections to multiple LLM providers:

**Supported Providers:**
- 🤖 **OpenAI** - GPT models (gpt-4o, gpt-4-turbo, etc.)
- 🧠 **Gemini** - Google's Gemini models
- 💬 **Anthropic** - Claude models (claude-3.5-sonnet, etc.)
- ⚡ **xAI** - Grok models
- 🏠 **Ollama** - Local open-source models

**Key Features:**
- ✅ Easy API key configuration
- ✅ Test connection to validate credentials
- ✅ View all available models for each provider
- ✅ Select specific models for racing (click to toggle)
- ✅ Automatic persistence in browser (IndexedDB)
- ✅ Secure API key masking
- ✅ Helpful error messages and troubleshooting

**Getting Started:**
1. Start the dev server: `npm run dev`
2. Navigate to the config page: `http://localhost:5174/config`
3. Enter your API keys for desired providers
4. Click "Test" to validate and see available models
5. Click on model names to select them for racing (selected models have blue background)
6. Your selections are automatically saved and persist across sessions

**Known Limitations:**
- ⚠️ **Anthropic API**: Cannot be tested directly from the browser due to CORS restrictions. Your API key will be saved and can be used when the app has a backend proxy. The other providers (OpenAI, Gemini, xAI, Ollama) support browser testing.

**Documentation:**
- User Guide: See `docs/user-guide/configuration.md`
- Implementation Details: See `docs/IMPLEMENTATION.md`

### Model Comparison

Compare multiple AI models side-by-side:

**Key Features:**
- ✅ Select multiple providers and models
- ✅ Input custom system and user prompts
- ✅ Parallel API requests for true "racing"
- ✅ Side-by-side response panels
- ✅ Response timing metrics
- ✅ Graceful error handling
- ✅ Responsive layout (mobile/tablet/desktop)

**How to Use:**
1. Navigate to the home page (/)
2. Select providers and models you want to compare
3. Enter optional system prompt and required user prompt
4. Click "Submit" to run the comparison
5. View responses side-by-side with timing information
6. Click "Reset" to start a new comparison

## Next Steps

Upcoming features:
- Comparison history and saving
- Export/share functionality
- Streaming responses
- Model-specific parameters (temperature, max_tokens, etc.)
- Token usage tracking
- Cost estimation

## License

Private project
