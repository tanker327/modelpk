# Logging Guidelines

## ⚠️ MANDATORY: Use Centralized Logging

**NEVER use `console.log`, `console.info`, `console.warn`, or `console.error` directly in this project.**

All logging MUST go through the centralized logger from `@/services/logger`.

## Quick Start

```typescript
import { createLogger } from '@/services/logger'

const log = createLogger('YourModuleName')

// Use these instead of console.*:
log.debug('Detailed debugging info')   // Hidden in production
log.info('General information')         // Hidden in production
log.warn('Warning message')             // Shown in production
log.error('Error occurred', error)      // Shown in production
```

## Why We Do This

1. **Security**: Prevents sensitive data (API keys, prompts) from leaking to production logs
2. **Performance**: Reduces log overhead in production builds
3. **Debugging**: Can enable debug logs in production when needed
4. **Consistency**: All logs have uniform format `[ModelPK][Module] message`

## Log Levels

| Level | Production | Development | Use For |
|-------|-----------|-------------|---------|
| `debug()` | Hidden | Shown | Very detailed implementation details |
| `info()` | Hidden | Shown | General application flow |
| `warn()` | **Shown** | Shown | Potential issues, deprecated features |
| `error()` | **Shown** | Shown | Actual errors, failures |

## Security Rules

### ❌ NEVER Log These:

```typescript
// ❌ API keys
log.info(`Encrypting API key: ${apiKey}`)

// ❌ User prompts (may contain sensitive info)
log.debug(`User prompt: ${prompt}`)

// ❌ Full provider IDs with context that reveals user's setup
log.info(`User configured ${providerId} with endpoint ${endpoint}`)

// ❌ Response content (may contain sensitive data)
log.info(`Response: ${response}`)
```

### ✅ SAFE Logging:

```typescript
// ✅ Generic actions without data
log.debug('Encrypting API key')
log.debug('Processing user prompt')
log.debug('Sending API request')

// ✅ Non-sensitive metadata
log.debug(`Retrieved ${configs.length} configurations`)
log.info(`Successfully fetched ${models.length} models`)

// ✅ Errors (sanitize sensitive parts)
log.error('Failed to save configuration:', error)
log.error('API request failed:', error)
```

## Module Naming Convention

Use PascalCase for module names to match the file/component name:

```typescript
// For services
const log = createLogger('ConfigStorage')
const log = createLogger('Encryption')
const log = createLogger('OpenAIProvider')

// For components
const log = createLogger('ComparisonPage')
const log = createLogger('ResponsePanel')

// For atoms/state
const log = createLogger('ProviderConfigsAtom')
```

## Migration from console.*

If you find any `console.*` usage in the code, replace it:

```typescript
// Before:
console.info('[ConfigStorage] Saved configuration')
console.error('[ConfigStorage] Failed:', error)

// After:
import { createLogger } from '@/services/logger'
const log = createLogger('ConfigStorage')

log.debug('Saved configuration')  // Note: Changed to debug (hidden in prod)
log.error('Failed:', error)
```

## Advanced Usage

### Conditional Logging

```typescript
// ❌ Don't do this (logger handles it automatically)
if (import.meta.env.DEV) {
  log.info('Development message')
}

// ✅ Do this (logger automatically hides in production)
log.info('Development message')
```

### Runtime Debug Mode (Production)

Users can enable debug logs in production console:

```javascript
// In browser console:
import { setLogLevel } from '@/services/logger'
setLogLevel('debug')
```

## Enforcement

- **Pre-commit**: Code with `console.*` should be flagged in code review
- **ESLint**: Consider adding a rule to prevent `console.*` usage (future enhancement)
- **Testing**: Verify logs don't contain sensitive data

## Examples by File Type

### Service Files

```typescript
import { createLogger } from '@/services/logger'
const log = createLogger('MyService')

export async function doSomething() {
  log.debug('Starting operation')

  try {
    // ... code ...
    log.debug('Operation successful')
  } catch (error) {
    log.error('Operation failed:', error)
    throw error
  }
}
```

### React Components

```typescript
import { createLogger } from '@/services/logger'
const log = createLogger('MyComponent')

export function MyComponent() {
  const handleClick = async () => {
    log.debug('Button clicked')

    try {
      await someAsyncOperation()
      log.debug('Operation completed')
    } catch (error) {
      log.error('Operation failed:', error)
    }
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

### State/Atoms

```typescript
import { createLogger } from '@/services/logger'
const log = createLogger('MyAtom')

export const myActions = {
  doSomething: async () => {
    log.debug('Action started')
    // ... code ...
    log.debug('Action completed')
  }
}
```

## Questions?

See the full implementation details: `docs/logging-implementation.md`
