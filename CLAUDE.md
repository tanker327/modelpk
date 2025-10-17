# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ModelPK is a React-based web application for comparing outputs from different AI models using the same prompt (PK = "Player Killing", a gaming term for competitive battles). The app runs entirely in the browser with no backend, using IndexedDB for persistent storage and direct API calls to various LLM providers.

## Development Commands

```bash
# Start development server (http://localhost:5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test:coverage

# Docker commands (uses docker compose, not docker-compose)
docker compose up -d
docker compose down
docker compose logs -f
```

## Architecture

### State Management Pattern

This app uses **Zedux** for atomic state management, but with a simplified pattern that avoids full reactivity:

- **Atoms are defined but not consumed via hooks** - The `providerConfigsAtom` exists for potential future use
- **Actions pattern for state updates** - Export an `actions` object with async functions (e.g., `providerConfigsActions`)
- **Direct state access via closure** - Use a module-level `currentConfigs` variable to track state without React re-renders
- **Manual storage sync** - State updates immediately sync to IndexedDB via `configStorage` service

Example pattern from `src/state/atoms/providerConfigsAtom.ts`:
```typescript
// Module-level state (not reactive)
let currentConfigs: ProviderConfig[] = initialState.configs

// Actions that update state and persist
export const providerConfigsActions = {
  updateConfig: async (providerId, updates) => {
    // Update in-memory state
    currentConfigs = [/* updated configs */]
    // Persist to IndexedDB
    await configStorage.saveConfig(updatedConfig)
  },
  getConfigs: () => currentConfigs
}
```

### Storage Architecture

**Two-layer persistence:**

1. **IndexedDB (via `idb`)** - For provider configurations (API keys, endpoints, selected models)
   - Database: `modelpk-config`
   - Stores: `providers`, `encryption`
   - All API keys are encrypted at rest using Web Crypto API
   - See `src/services/storage/configStorage.ts`

2. **localStorage** - For UI state and comparison data
   - Uses custom `useLocalStorage` hook (see `src/hooks/useLocalStorage.ts`)
   - Keys prefixed with `modelpk-`
   - Used for: test names, prompts, responses, UI collapse states

### Provider Integration Pattern

Each LLM provider has two service files:

1. **Provider Tester** (`src/services/providers/[provider]Provider.ts`)
   - Tests connection and fetches available models
   - Example: `testOpenAIConnection()` returns `{ success: boolean, models?: string[], error?: string }`

2. **Comparison Service** (`src/services/api/[provider]Comparison.ts`)
   - Sends actual comparison requests
   - Returns standardized response with `{ success, response?, error?, tokenUsage? }`
   - Called dynamically via `comparisonService.ts` router

**To add a new provider:**
1. Add provider ID to `ProviderId` union in `src/schemas/providerConfigSchema.ts`
2. Create `[provider]Provider.ts` with `test[Provider]Connection()` function
3. Create `[provider]Comparison.ts` with `send[Provider]Comparison()` function
4. Add dynamic import case to `src/services/api/comparisonService.ts`
5. Add provider to `DEFAULT_PROVIDERS` array in `providerConfigSchema.ts`

### Security

- **API Keys**: Encrypted using Web Crypto API (AES-GCM) before storage
- **Master Salt**: Randomly generated per browser, stored in IndexedDB
- **Encryption Service**: `src/services/security/encryption.ts`
- **Export Format**: Exported configs contain plain text API keys (for portability), automatically re-encrypted on import

### Component Architecture

**Page Components:**
- `ConfigPage.tsx` - Provider configuration with connection testing
- `ComparisonPage.tsx` - Model selection, prompt input, and results display

**Key UI Patterns:**
- **Collapsible sections** - Use `isExpanded` state stored in localStorage
- **Real-time updates** - State updates trigger re-renders, no polling needed
- **Parallel API requests** - All comparison requests fire simultaneously via `Promise.all()`
- **Responsive layout** - Results use flexbox with horizontal scroll for wide content

**shadcn/ui Components:**
- Located in `src/components/ui/`
- Customized from shadcn/ui templates
- Use Radix UI primitives with Tailwind styling

## Important Patterns to Follow

### When making UI changes:

1. **Results layout is single-row flex** - ComparisonPage uses `flex overflow-x-auto` to always show all responses in one row
2. **Provider/model names wrap responsively** - ResponsePanel header uses `flex-wrap` to stack names when space is limited
3. **Page width is 100%** - Both pages use `w-full` instead of `max-w-*` for full-width layouts

### When adding features:

1. **State persistence** - Use `useLocalStorage` for UI state, `configStorage` for provider data
2. **Logging** - ALWAYS use the centralized logger from `@/services/logger`, NEVER use `console.log/info/warn/error`
   ```typescript
   import { createLogger } from '@/services/logger'
   const log = createLogger('YourModule')

   log.debug('Detailed info')  // Hidden in production
   log.info('General info')    // Hidden in production
   log.warn('Warning')          // Shown in production
   log.error('Error', error)    // Shown in production
   ```
3. **Error handling** - Log errors with `log.error()` and show user-friendly messages
4. **API requests** - Follow the provider pattern (tester + comparison service)
5. **Type safety** - Use Zod schemas for runtime validation, TypeScript for compile-time safety
6. **Security** - Never log sensitive data (API keys, user prompts, etc.) even in debug mode

## Development Workflow

This project follows the OpenSpec workflow for significant changes:
1. Create proposals for new features or architectural changes
2. Implement approved changes following the spec
3. Archive completed changes and update specs

See the OpenSpec instructions below for detailed workflow guidance.

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->
