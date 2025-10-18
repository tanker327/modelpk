# ModelPK - AI Model Comparison Arena

A secure, browser-based web application for comparing outputs from multiple AI models side-by-side. Let AI models battle it out (PK-style) with the same prompt and see which one performs best for your needs.

## 🔒 Security First

**Your API keys never leave your browser.** ModelPK runs entirely in your browser with no backend server:

- ✅ **Encrypted Storage** - All API keys are encrypted using Web Crypto API (AES-GCM) before being stored in IndexedDB
- ✅ **No Server** - Direct API calls from your browser to LLM providers (OpenAI, Gemini, etc.)
- ✅ **No Tracking** - Your prompts, responses, and API keys stay on your device
- ✅ **Open Source** - Inspect the code yourself to verify security claims

**How it works:**
1. You enter your API key in the config page
2. The key is immediately encrypted using a randomly generated master salt
3. Encrypted key is stored in your browser's IndexedDB
4. When making API calls, the key is decrypted in-memory and sent directly to the provider
5. No third-party servers or logging involved

## ✨ Features

### 🏁 Model Racing
- Compare responses from multiple AI models simultaneously
- See which model is fastest and most accurate for your use case
- Side-by-side comparison with timing metrics
- Support for extended thinking (<think> tags) visualization

### 🤖 Supported Providers
- **OpenAI** - GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, and more
- **Gemini** - Google's latest Gemini models
- **Anthropic** - Claude 3.5 Sonnet, Claude 3 Opus, and more (via OpenRouter)
- **xAI** - Grok models
- **Ollama** - Local open-source models (Llama, Mistral, etc.)
- **OpenRouter** - Access to 100+ models through a single API

### 🎯 Key Features
- ✅ Parallel API requests for true "racing"
- ✅ Token usage and cost tracking
- ✅ Markdown and raw response views
- ✅ JSON response visualization
- ✅ Export/import configurations for backup
- ✅ Persistent state across sessions
- ✅ Fully responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- API keys for your desired LLM providers

### Installation

```bash
# Clone the repository
git clone git@github.com:tanker327/modelpk.git
cd modelpk

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5174`

### First-Time Setup

1. **Navigate to Config Page** - Click "Configure Providers" button
2. **Add API Keys** - Enter your API keys for desired providers
3. **Test Connection** - Click "Test" to verify credentials and see available models
4. **Select Models** - Click on model names to select them for racing (blue = selected)
5. **Start Racing** - Go back to home page and start comparing!

### Docker Deployment

Run ModelPK in a container:

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

Access at `http://localhost:3000`

**Docker features:**
- Multi-stage build for small image size
- Nginx with gzip compression
- Security headers
- Health checks
- Static asset caching

## 📖 Usage Guide

### Getting Your API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Gemini**: https://aistudio.google.com/app/apikey
- **xAI**: https://console.x.ai/
- **Anthropic/Claude**: Use OpenRouter (see below)
- **Ollama**: No API key needed, just install Ollama locally
- **OpenRouter**: https://openrouter.ai/keys (gives access to 100+ models)

### Comparing Models

1. Select providers and models from the "Select Providers & Models" section
2. Enter an optional system prompt (e.g., "You are a helpful coding assistant")
3. Enter your user prompt (required)
4. Click "Submit" to run the comparison
5. View responses side-by-side with:
   - ⏱️ Response time
   - 📊 Token usage
   - 🏆 Fastest/slowest indicators
   - 💭 Thinking process (for supported models)

### Tips

- **Start with 2-3 models** to see differences clearly
- **Use OpenRouter** for easy access to many models with one API key
- **Try Ollama** for free local models (no API costs)
- **Export your config** regularly to backup your settings
- **Compare on different tasks** - some models excel at coding, others at creative writing

## 🛠️ Development

### Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Zedux** for state management
- **IndexedDB** for encrypted storage
- **Zod** for schema validation

### Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Linting
npm run lint             # Check for issues
npm run lint:fix         # Auto-fix issues
```

### Project Structure

```
modelpk/
├── src/
│   ├── components/       # React components
│   │   ├── comparison/   # Comparison page components
│   │   ├── config/       # Config page components
│   │   └── ui/           # shadcn/ui components
│   ├── services/
│   │   ├── api/          # API integration services
│   │   ├── providers/    # Provider connection testers
│   │   ├── security/     # Encryption utilities
│   │   └── storage/      # IndexedDB operations
│   ├── state/            # Zedux state management
│   ├── schemas/          # Zod type schemas
│   ├── hooks/            # Custom React hooks
│   └── pages/            # Page components
├── docs/                 # Documentation
└── openspec/             # OpenSpec specifications
```

## 🔐 Security Details

### API Key Encryption

API keys are encrypted using the Web Crypto API:

1. **Algorithm**: AES-GCM (256-bit)
2. **Master Salt**: Randomly generated per browser (stored separately in IndexedDB)
3. **Per-key Salt**: Each API key gets a unique salt
4. **Format**: `base64(salt):base64(iv):base64(encryptedData)`

### No Backend Required

This app doesn't need a backend because:
- Modern browsers support CORS requests to LLM APIs
- IndexedDB provides encrypted local storage
- All computation happens client-side
- API keys are only decrypted in memory when needed

### Export Security Warning

⚠️ **Important**: Exported configuration files contain API keys in **plain text** for portability. Keep exported files secure! They will be re-encrypted when imported.

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! This project follows the OpenSpec workflow for all significant changes.

**Before contributing:**
1. Check existing [issues](https://github.com/tanker327/modelpk/issues) and [pull requests](https://github.com/tanker327/modelpk/pulls)
2. Read `CLAUDE.md` for development guidelines and architecture patterns
3. For significant changes, see the `openspec/` directory for the proposal workflow

**Development setup:**
```bash
git clone git@github.com:tanker327/modelpk.git
cd modelpk
npm install
npm run dev
```

## 🐛 Known Issues

- **Anthropic API**: Cannot be tested directly from browser due to CORS restrictions. Use OpenRouter as a proxy to access Claude models.
- **Browser Storage**: If you clear browser data, your API keys and configs will be lost. Export regularly!

## 💡 FAQ

**Q: Is this safe? How do I know my API keys aren't being sent somewhere?**
A: The app has no backend and all code is open source. You can inspect the Network tab in browser DevTools to verify that API calls only go to official LLM provider endpoints. API keys are encrypted in IndexedDB and never sent anywhere except directly to the provider you're using.

**Q: Why use this instead of switching between ChatGPT, Claude, etc.?**
A: ModelPK lets you compare responses side-by-side with identical prompts, see which is fastest, and track token usage - all in one place. Perfect for developers, researchers, and anyone choosing between models.

**Q: Can I use this offline?**
A: The app itself can be cached for offline use, but you need an internet connection to make API calls to LLM providers (except Ollama, which runs locally).

**Q: Does this work on mobile?**
A: Yes! The UI is fully responsive and works on phones and tablets.

**Q: How much does this cost?**
A: The app is free. You only pay for the API calls you make to LLM providers at their standard rates. Use Ollama for completely free local models.

## 📧 Support

For issues, feature requests, or questions, please open an issue on [GitHub](https://github.com/tanker327/modelpk/issues).

---

**Built with ❤️ for the AI community**
