# AI Racers

A React-based web application for comparing outputs from different AI models using the same prompt.

## Project Status

✅ **LLM Provider Configuration** - Complete! Configure and test connections to OpenAI, Gemini, Anthropic, xAI, and Ollama.

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

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

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

## Next Steps

With provider configuration complete, upcoming features include:
- Prompt input interface
- Model selection UI
- Side-by-side model comparison
- Race history and analytics

## License

Private project
