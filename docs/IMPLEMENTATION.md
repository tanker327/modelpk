# LLM Provider Configuration - Implementation Documentation

This document describes the implementation of the LLM provider configuration feature.

## Architecture Overview

The configuration system follows a three-layer architecture:

```
UI Layer (React Components)
    ↓
State Layer (Zedux Atoms)
    ↓
Persistence Layer (IndexedDB)
```

## Project Structure

```
src/
├── pages/
│   └── ConfigPage.tsx              # Main configuration page UI
├── services/
│   ├── storage/
│   │   └── configStorage.ts        # IndexedDB CRUD operations
│   └── providers/
│       ├── providerTester.ts       # Common testing utilities
│       ├── openaiProvider.ts       # OpenAI connection tester
│       ├── geminiProvider.ts       # Gemini connection tester
│       ├── anthropicProvider.ts    # Anthropic connection tester
│       ├── xaiProvider.ts          # xAI connection tester
│       └── ollamaProvider.ts       # Ollama connection tester
├── state/
│   └── atoms/
│       ├── providerConfigsAtom.ts  # Configuration state management
│       └── testResultsAtom.ts      # Test results state management
└── schemas/
    └── providerConfigSchema.ts     # Zod validation schemas
```

## Data Models

### ProviderConfig

```typescript
interface ProviderConfig {
  id: 'openai' | 'gemini' | 'anthropic' | 'xai' | 'ollama'
  name: string
  enabled: boolean
  config: {
    apiKey?: string
    endpoint?: string
    baseUrl?: string
  }
}
```

### TestResult

```typescript
interface TestResult {
  providerId: string
  status: 'idle' | 'testing' | 'success' | 'error'
  models?: string[]
  error?: string
  testedAt?: Date
}
```

## State Management

### Provider Configurations Atom

Located in `src/state/atoms/providerConfigsAtom.ts`

**State:**
- `configs`: Array of provider configurations
- `loading`: Boolean indicating if loading from IndexedDB
- `error`: Error message if loading fails

**Actions:**
- `updateConfig(providerId, updates)`: Update a provider's configuration
- `toggleEnabled(providerId)`: Toggle enabled state
- `deleteConfig(providerId)`: Reset provider to defaults
- `reload()`: Reload from IndexedDB
- `setConfigs(configs)`: Set all configurations at once

### Test Results Atom

Located in `src/state/atoms/testResultsAtom.ts`

**State:**
- `results`: Record mapping provider ID to test result

**Actions:**
- `startTest(providerId)`: Mark test as in progress
- `setTestSuccess(providerId, models)`: Record successful test
- `setTestError(providerId, error)`: Record failed test
- `isCacheValid(providerId)`: Check if cached result is still valid (5min TTL)
- `clearTest(providerId)`: Clear test result
- `clearAllTests()`: Clear all test results

## IndexedDB Schema

**Database:** `modelpk-config`
**Version:** 1
**Store:** `providers` (keyPath: 'id')

**Operations:**
- `saveConfig(config)`: Save provider configuration
- `getConfig(providerId)`: Get single configuration
- `getAllConfigs()`: Get all configurations
- `deleteConfig(providerId)`: Delete configuration
- `exportConfigs()`: Export to JSON string
- `importConfigs(jsonData)`: Import from JSON string

## Provider Testing

Each provider has its own tester module implementing the `ProviderTester` interface:

```typescript
interface ProviderTester {
  testConnection(config: ProviderConfig): Promise<TestConnectionResult>
}
```

### OpenAI Tester

- Endpoint: `GET /v1/models`
- Auth: Bearer token in `Authorization` header
- Returns: List of GPT models

### Gemini Tester

- Endpoint: `GET /models?key={apiKey}`
- Auth: API key in query parameter
- Returns: List of Gemini models

### Anthropic Tester

- Endpoint: `POST /v1/messages` (test request)
- Auth: API key in `x-api-key` header
- Additional headers: `anthropic-version`, `content-type`
- Returns: Known Claude models (hardcoded as API doesn't have public model list)

### xAI Tester

- Endpoint: `GET /v1/models` (OpenAI-compatible)
- Auth: Bearer token in `Authorization` header
- Returns: List of available models

### Ollama Tester

- Endpoint: `GET /api/tags`
- Auth: None (local service)
- Returns: List of locally installed models

## Error Handling

### Common Errors

- **Network errors**: Catch fetch failures, suggest connectivity check
- **Authentication errors**: Detect 401/403 status, suggest checking API key
- **Rate limit errors**: Detect 429 status, parse retry-after header
- **CORS errors**: Detect CORS failures, provide troubleshooting guidance

### Error Message Parsing

The `parseApiErrorResponse()` utility extracts error messages from different API response formats:
- Checks `content-type` header
- Parses JSON errors
- Falls back to text response or HTTP status

## Security Considerations

1. **Client-side storage**: API keys stored in IndexedDB (browser-scoped)
2. **No logging**: API keys are never logged to console
3. **Masked display**: UI shows masked keys (e.g., `************sk-abc`)
4. **HTTPS only**: Recommended for production deployment
5. **Origin isolation**: IndexedDB scoped to app origin

## Performance Optimizations

1. **Auto-save**: Configurations saved on blur (debounced)
2. **Result caching**: Test results cached for 5 minutes
3. **Lazy loading**: Provider configs loaded from IndexedDB on mount
4. **Optimistic updates**: UI updates immediately, IndexedDB persists async

## Testing

To run tests:
```bash
npm test
```

To run tests with coverage:
```bash
npm run test:coverage
```

## Future Enhancements

Potential improvements not included in this implementation:

1. **Export/Import UI**: Add buttons to export/import configurations
2. **Configuration versioning**: Support schema migrations
3. **Encrypted storage**: Encrypt API keys before storing
4. **Usage tracking**: Track API usage per provider
5. **Model presets**: Save favorite model configurations
6. **Organization sync**: Sync configs across team members
7. **Proxy support**: Add proxy configuration for corporate networks
8. **Offline mode**: Better offline handling and queuing

## Extending with New Providers

To add a new provider:

1. **Add provider ID** to `ProviderIdSchema` in `providerConfigSchema.ts`
2. **Add default config** to `DEFAULT_PROVIDERS` and `DEFAULT_BASE_URLS`
3. **Create provider tester** in `src/services/providers/{provider}Provider.ts`
4. **Update ConfigPage** to handle the new provider in the switch statement
5. **Test** the new provider configuration and connection

## Troubleshooting Development Issues

### TypeScript Errors

Run type checking:
```bash
npx tsc --noEmit
```

### Build Errors

Clean build and reinstall:
```bash
rm -rf node_modules dist
npm install
npm run build
```

### IndexedDB Issues

Clear IndexedDB in browser DevTools:
1. Open DevTools (F12)
2. Go to Application tab
3. Expand IndexedDB
4. Right-click `modelpk-config` → Delete

### State Not Updating

The current implementation uses a polling interval to force re-renders. This is a simple solution but could be improved with proper Zedux reactive updates in future iterations.

## Dependencies

- **react-router-dom**: Routing (`/` and `/config`)
- **idb**: IndexedDB wrapper for type-safe database operations
- **@zedux/react**: State management with atoms
- **zod**: Runtime validation and type generation
- **tailwindcss**: Styling
- **shadcn/ui**: UI components (Button)
