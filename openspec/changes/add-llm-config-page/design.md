# Design: LLM Provider Configuration Page

## Architecture Overview

The configuration system consists of three layers:

1. **UI Layer**: React components for the `/config` page
2. **State Layer**: Zedux atoms for managing provider configurations
3. **Persistence Layer**: IndexedDB for storing configurations locally

```
┌─────────────────────────────────────────┐
│         /config Page Component          │
│  ┌─────────────────────────────────┐   │
│  │  Provider Configuration Forms   │   │
│  │  - OpenAI, Gemini, Anthropic    │   │
│  │  - xAI, Ollama                  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Test Connection Buttons        │   │
│  │  - API validation               │   │
│  │  - Model discovery              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│     State Management (Zedux Atoms)      │
│  - providerConfigsAtom                  │
│  - testResultsAtom                      │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Persistence Layer (IndexedDB)        │
│  - config-db database                   │
│  - providers store                      │
└─────────────────────────────────────────┘
```

## Data Models

### Provider Configuration Schema

```typescript
interface ProviderConfig {
  id: 'openai' | 'gemini' | 'anthropic' | 'xai' | 'ollama'
  name: string
  enabled: boolean
  config: {
    apiKey?: string      // For cloud providers
    endpoint?: string    // For Ollama
    baseUrl?: string     // Optional custom endpoint
  }
}

interface TestResult {
  providerId: string
  status: 'idle' | 'testing' | 'success' | 'error'
  models?: string[]
  error?: string
  testedAt?: Date
}
```

### IndexedDB Schema

```javascript
Database: 'modelpk-config'
Version: 1
Stores:
  - providers (keyPath: 'id')
    - Stores ProviderConfig objects
```

## Provider-Specific Configuration Requirements

### OpenAI
- **Required**: API Key (starts with "sk-")
- **Optional**: Base URL (for Azure OpenAI or proxies)
- **Default Base URL**: https://api.openai.com/v1
- **Authentication**: Bearer token in `Authorization` header
- **Test Endpoint**: GET /v1/models

### Gemini (Google)
- **Required**: API Key (starts with "AIza")
- **Optional**: Base URL
- **Default Base URL**: https://generativelanguage.googleapis.com/v1beta
- **Authentication**: API key in `x-goog-api-key` header or URL param
- **Test Endpoint**: GET /models

### Anthropic
- **Required**: API Key
- **Optional**: Base URL
- **Default Base URL**: https://api.anthropic.com/v1
- **Authentication**: API key in `x-api-key` header
- **Required Headers**: `anthropic-version: 2023-06-01`, `content-type: application/json`
- **Test Endpoint**: GET /v1/models (requires valid API key)

### xAI
- **Required**: API Key (starts with "xai-")
- **Optional**: Base URL
- **Default Base URL**: https://api.grok.xai.com/v1
- **Authentication**: Bearer token in `Authorization` header (OpenAI-compatible)
- **Test Endpoint**: GET /v1/models

### Ollama
- **Required**: Endpoint URL
- **Default Endpoint**: http://localhost:11434
- **Authentication**: None (local service)
- **Test Endpoint**: GET /api/tags

## Component Structure

```
src/
├── pages/
│   └── ConfigPage.tsx              # Main config page
├── components/
│   └── config/
│       ├── ProviderCard.tsx        # Individual provider config card
│       ├── ProviderForm.tsx        # Form for API key/endpoint input
│       ├── TestButton.tsx          # Test connection button
│       └── ModelsList.tsx          # Display available models
├── state/
│   └── atoms/
│       ├── providerConfigsAtom.ts  # Provider configurations state
│       └── testResultsAtom.ts      # Test results state
├── services/
│   ├── storage/
│   │   └── configStorage.ts        # IndexedDB operations
│   └── providers/
│       ├── providerTester.ts       # Test provider connections
│       ├── openaiProvider.ts       # OpenAI-specific logic
│       ├── geminiProvider.ts       # Gemini-specific logic
│       ├── anthropicProvider.ts    # Anthropic-specific logic
│       ├── xaiProvider.ts          # xAI-specific logic
│       └── ollamaProvider.ts       # Ollama-specific logic
└── schemas/
    └── providerConfigSchema.ts     # Zod schemas for validation
```

## UI/UX Design

### Config Page Layout

```
┌──────────────────────────────────────────────┐
│  AI Racers - Provider Configuration          │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  OpenAI                         [Test] │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │ API Key: ****************sk-abc  │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │  ✓ Connected - 5 models available     │ │
│  │  • gpt-4o, gpt-4-turbo, gpt-3.5...   │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Gemini (Google)                [Test] │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │ API Key: ****************AIza123 │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │  ✗ Connection failed: Invalid key     │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ... (similar cards for other providers)     │
│                                              │
└──────────────────────────────────────────────┘
```

### State Machine for Testing

```
[Idle] → (Test Click) → [Testing] → [Success/Error]
                           ↓
                      API Request
```

## Error Handling

### Network Errors
- Display user-friendly messages for network failures
- Distinguish between network errors and API errors
- Suggest checking CORS for local Ollama connections

### Validation Errors
- Client-side validation using Zod schemas
- Real-time validation feedback in forms
- Prevent test attempts with invalid configurations

### API Errors
- Parse provider-specific error responses
- Display rate limit messages with retry guidance
- Show authentication errors clearly

## Security Considerations

1. **Client-Side Storage**: API keys stored in IndexedDB are scoped to the origin, providing browser-level isolation
2. **Display Masking**: Show masked API keys in UI (e.g., `************sk-abc`)
3. **No Logging**: Never log full API keys to console
4. **CSP Headers**: Recommend Content Security Policy to prevent XSS
5. **HTTPS Only**: Document that app should be served over HTTPS in production

## Performance Considerations

1. **Lazy Loading**: Load provider test modules only when needed
2. **Debouncing**: Debounce test button clicks to prevent rapid API calls
3. **Caching**: Cache test results with timestamp (5-minute TTL)
4. **Optimistic Updates**: Update UI immediately, persist to IndexedDB asynchronously

## Testing Strategy

1. **Unit Tests**: Test individual provider testers with mocked API responses
2. **Integration Tests**: Test IndexedDB storage operations
3. **Component Tests**: Test form validation and UI state changes
4. **E2E Tests**: Test full configuration flow with test providers

## Future Extensibility

This design allows for future enhancements:
- Adding new providers by implementing the provider interface
- Exporting/importing configurations
- Organization-level configuration sharing
- Configuration versioning and migration
- Usage tracking per provider
