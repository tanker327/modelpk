# Logging Implementation - Security Enhancement

## ⚠️ IMPORTANT: DO NOT USE console.log ⚠️

**This project uses centralized logging via `loglevel`. Never use `console.log/info/warn/error` directly.**

If you see `console.*` in code, it should be replaced with the logger from `@/services/logger`.

## Overview

Implemented centralized logging using `loglevel` to replace all `console.log/info/error/warn` statements throughout the application. This provides:

- **Environment-based log control**: Info/debug logs hidden in production, only warnings and errors shown
- **Consistent log format**: All logs prefixed with `[ModelPK][Module]`
- **Better security**: Prevents sensitive data from appearing in production logs
- **Runtime control**: Can enable debug logs in production console if needed

## Implementation Status

### ✅ Completed

1. **Package Installation**
   - Installed `loglevel@^1.9.2`
   - No vulnerabilities detected

2. **Centralized Logger** (`src/services/logger.ts`)
   - Created `logger` service with environment-based configuration
   - Created `createLogger(namespace)` for module-specific loggers
   - Production log level: `warn` (only warnings and errors)
   - Development log level: `info` (all logs except trace/debug)

3. **Updated Files** (Console statements replaced with logger)
   - ✅ `src/services/security/encryption.ts` - All 6 console statements
   - ✅ `src/services/storage/configStorage.ts` - All 28 console statements
   - ✅ `src/services/api/openaiComparison.ts` - 1 console statement
   - ✅ `src/services/api/geminiComparison.ts` - 4 console statements
   - ✅ `src/services/api/anthropicComparison.ts` - 1 console statement
   - ✅ `src/services/api/xaiComparison.ts` - 1 console statement
   - ✅ `src/services/api/ollamaComparison.ts` - 4 console statements

### 🔄 Remaining Work

The following files still have console statements that should be updated:

#### API Services (1 file remaining)
- `src/services/api/openrouterComparison.ts` - 5 console statements

#### Provider Services (6 files)
- `src/services/providers/openaiProvider.ts` - 2 console statements
- `src/services/providers/geminiProvider.ts` - 2 console statements
- `src/services/providers/anthropicProvider.ts` - 2 console statements
- `src/services/providers/xaiProvider.ts` - 2 console statements
- `src/services/providers/ollamaProvider.ts` - 2 console statements
- `src/services/providers/openrouterProvider.ts` - 2 console statements

#### State Management (2 files)
- `src/state/atoms/providerConfigsAtom.ts` - 9 console statements
- `src/state/atoms/testResultsAtom.ts` - 5 console statements

#### Components (3 files)
- `src/pages/ComparisonPage.tsx` - 7 console statements
- `src/hooks/useLocalStorage.ts` - 2 console statements
- `src/hooks/useConfigBackup.ts` - 4 console statements

#### Other Services (1 file)
- `src/services/pricing/pricingService.ts` - 3 console statements

**Total Remaining**: ~50 console statements across 15 files

## Usage Guide

### Basic Usage (REQUIRED for all new code)

```typescript
import { createLogger } from '@/services/logger'

const log = createLogger('YourModule')

// These will be hidden in production:
log.debug('Detailed debugging info')
log.info('General information')

// These will always show:
log.warn('Warning message')
log.error('Error occurred', error)
```

### ❌ NEVER DO THIS:
```typescript
// ❌ BAD - Direct console usage
console.log('Something happened')
console.info('User logged in')
console.error('Failed:', error)

// ❌ BAD - Logging sensitive data
log.info(`API Key: ${apiKey}`)
log.debug(`User prompt: ${userPrompt}`)
```

### ✅ ALWAYS DO THIS:
```typescript
// ✅ GOOD - Use centralized logger
const log = createLogger('YourModule')
log.debug('Something happened')
log.info('User logged in')
log.error('Failed:', error)

// ✅ GOOD - Generic messages without sensitive data
log.debug('Encrypting API key')
log.debug('Processing user prompt')
```

### Migration Pattern

**Before:**
```typescript
console.info('[MyModule] Doing something:', data)
console.error('[MyModule] Failed:', error)
```

**After:**
```typescript
import { createLogger } from '@/services/logger'

const log = createLogger('MyModule')

log.info('Doing something') // Don't log sensitive data!
log.error('Failed:', error)
```

### Security Best Practices

When updating console statements:

1. **Remove sensitive data from logs**:
   ```typescript
   // ❌ BAD: Logs API key
   log.info(`Encrypting API key: ${apiKey}`)

   // ✅ GOOD: Generic message
   log.debug('Encrypting API key')
   ```

2. **Don't log user input verbatim**:
   ```typescript
   // ❌ BAD: Could log sensitive prompts
   log.info(`User prompt: ${prompt}`)

   // ✅ GOOD: Just acknowledge
   log.debug('Processing user prompt')
   ```

3. **Use appropriate log levels**:
   - `debug`: Very detailed info (not shown even in dev by default)
   - `info`: General flow (shown in dev, hidden in prod)
   - `warn`: Potential issues (shown in prod)
   - `error`: Actual errors (shown in prod)

## Runtime Configuration

Users can enable debug logs in production console:

```javascript
// In browser console:
import { setLogLevel } from '@/services/logger'
setLogLevel('debug')
```

## Quick Update Script

For remaining files, use this pattern:

1. Add import at top:
```typescript
import { createLogger } from '@/services/logger'

const log = createLogger('ModuleName')
```

2. Replace console statements:
   - `console.info(...)` → `log.info(...)`
   - `console.warn(...)` → `log.warn(...)`
   - `console.error(...)` → `log.error(...)`
   - `console.debug(...)` → `log.debug(...)`

3. Remove `[ModuleName]` prefixes from messages (handled by logger)

4. Sanitize sensitive data from log messages

## Testing

After updating all files:

```bash
# Test in development (should see info logs)
npm run dev

# Test production build (should only see warnings/errors)
npm run build
npm run preview
```

## Benefits

- ✅ Prevents API keys from appearing in logs
- ✅ Reduces log noise in production
- ✅ Consistent formatting across codebase
- ✅ Easy to enable debug mode when needed
- ✅ Better performance (fewer logs in production)
- ✅ Addresses security concern #5 from audit
