# Tasks: Add LLM Provider Configuration Page

## Phase 1: Foundation (Data Models & Storage)

### 1. Create provider configuration data models
- Create Zod schemas in `src/schemas/providerConfigSchema.ts`
- Define `ProviderConfig` type with fields: id, name, enabled, config
- Define `TestResult` type with fields: providerId, status, models, error, testedAt
- Define provider-specific configuration types for each provider
- Export TypeScript types from Zod schemas
- **Verify**: Run TypeScript compiler, ensure no type errors

### 2. Implement IndexedDB storage service
- Install IndexedDB wrapper library (`idb` or `localforage`)
- Create `src/services/storage/configStorage.ts`
- Implement database initialization with `ai-racers-config` database name
- Create `providers` object store with `id` as keyPath
- Implement CRUD operations: saveConfig, getConfig, getAllConfigs, deleteConfig
- Implement export/import functions: exportConfigs, importConfigs
- Add error handling for quota exceeded and permissions errors
- **Verify**: Write unit tests for all storage operations
- **Dependency**: Requires task 1 (schemas)

### 3. Create Zedux atoms for state management
- Create `src/state/atoms/providerConfigsAtom.ts`
- Implement atom to manage array of provider configurations
- Add actions for updateConfig, deleteConfig, toggleEnabled
- Integrate with IndexedDB storage service for persistence
- Create `src/state/atoms/testResultsAtom.ts`
- Implement atom to manage test results with caching (5-minute TTL)
- Add actions for startTest, setTestSuccess, setTestError
- **Verify**: Write unit tests for atom state transitions
- **Dependency**: Requires tasks 1-2

## Phase 2: Provider Testing Logic

### 4. Create provider tester utilities
- Create `src/services/providers/providerTester.ts` with base interface
- Define `ProviderTester` interface with `testConnection` method
- Create utility function to mask API keys for display
- Add rate limiting/debouncing utility (1-second cooldown)
- **Verify**: Unit tests for utilities
- **Dependency**: Requires task 1 (schemas)

### 5. Implement OpenAI provider tester
- Create `src/services/providers/openaiProvider.ts`
- Implement `testConnection` method calling `/v1/models` endpoint
- Set up proper authentication header (Bearer token)
- Parse model list from response
- Handle authentication errors, network errors, rate limits
- **Verify**: Integration test with mock API responses
- **Dependency**: Requires task 4

### 6. Implement Gemini provider tester
- Create `src/services/providers/geminiProvider.ts`
- Implement `testConnection` method calling `/models` endpoint
- Set up `x-goog-api-key` header authentication
- Parse model list from Gemini API response format
- Handle provider-specific errors
- **Verify**: Integration test with mock API responses
- **Dependency**: Requires task 4

### 7. Implement Anthropic provider tester
- Create `src/services/providers/anthropicProvider.ts`
- Implement `testConnection` method with required headers
- Set up `x-api-key`, `anthropic-version`, and `content-type` headers
- Parse model list or make test request to validate credentials
- Handle Anthropic-specific error responses
- **Verify**: Integration test with mock API responses
- **Dependency**: Requires task 4

### 8. Implement xAI provider tester
- Create `src/services/providers/xaiProvider.ts`
- Implement `testConnection` method calling `/v1/models` endpoint
- Set up Bearer token authentication (OpenAI-compatible)
- Parse model list from response
- Handle xAI-specific errors and rate limits (5 RPM)
- **Verify**: Integration test with mock API responses
- **Dependency**: Requires task 4

### 9. Implement Ollama provider tester
- Create `src/services/providers/ollamaProvider.ts`
- Implement `testConnection` method calling `/api/tags` endpoint
- No authentication required (local service)
- Parse local model list from tags response
- Handle connection errors with helpful messages (suggest `ollama serve`)
- Handle CORS issues with guidance
- **Verify**: Integration test with mock responses and local Ollama if available
- **Dependency**: Requires task 4

## Phase 3: UI Components

### 10. Set up routing for config page
- Install React Router if not already present (or use existing routing solution)
- Add `/config` route to router configuration in `src/main.tsx` or routing file
- Create placeholder `src/pages/ConfigPage.tsx` component
- **Verify**: Navigate to `/config` and see placeholder page
- **Parallel**: Can be done alongside other tasks

### 11. Create ProviderCard component
- Create `src/components/config/ProviderCard.tsx`
- Accept props: provider config, test result, onTest, onUpdate
- Display provider name and icon/logo placeholder
- Show enabled/disabled toggle
- Render appropriate form based on provider type (API key vs endpoint)
- Display test button and status
- Show model list when test succeeds
- Display errors in user-friendly format
- **Verify**: Component tests with React Testing Library
- **Dependency**: Requires task 3 (atoms for data)

### 12. Create ProviderForm component
- Create `src/components/config/ProviderForm.tsx`
- Create form fields for API key input (with show/hide toggle)
- Create form field for endpoint/base URL input
- Implement input validation using Zod schemas
- Show validation errors inline
- Auto-save on blur/debounce using Zedux atom actions
- Mask API key display (show only last 4-6 chars)
- **Verify**: Component tests for validation and auto-save
- **Dependency**: Requires task 3 (atoms)

### 13. Create TestButton component
- Create `src/components/config/TestButton.tsx`
- Display loading state during test
- Implement debouncing (prevent clicks within 1 second)
- Call provider tester service on click
- Update test results atom with results
- Handle errors and display them
- **Verify**: Component tests for loading states and error handling
- **Dependency**: Requires tasks 3-9 (atoms and testers)

### 14. Create ModelsList component
- Create `src/components/config/ModelsList.tsx`
- Accept props: models array, provider name
- Display model count (e.g., "5 models available")
- Render models in a list or grid format
- Handle long lists with scrolling/pagination
- Show "Tested X minutes ago" timestamp
- **Verify**: Component tests with various model lists
- **Dependency**: None (presentational component)

### 15. Implement ConfigPage component
- Update `src/pages/ConfigPage.tsx`
- Use `providerConfigsAtom` and `testResultsAtom` from Zedux
- Render page header and description
- Map through all five providers and render ProviderCard for each
- Add export/import configuration buttons
- Implement export handler (download JSON file)
- Implement import handler (file upload and validation)
- **Verify**: E2E test of full configuration flow
- **Dependency**: Requires tasks 11-14 (all UI components)

## Phase 4: Polish & Testing

### 16. Add proper error handling and logging
- Review all error paths and ensure user-friendly messages
- Implement proper error logging (console.error) without exposing API keys
- Add debug logs for troubleshooting (behind feature flag or dev mode)
- Test error scenarios: network failures, invalid keys, CORS, rate limits
- **Verify**: Manual testing of all error scenarios
- **Dependency**: Requires tasks 1-15 (all implementation tasks)

### 17. Implement security best practices
- Ensure API keys are never logged in full
- Verify masked display in UI
- Test that IndexedDB is origin-scoped
- Add CSP headers recommendation to deployment docs
- Document HTTPS requirement for production
- **Verify**: Security review and penetration testing
- **Dependency**: Requires tasks 1-15

### 18. Write comprehensive tests
- Write unit tests for all provider testers (with mocked fetch)
- Write integration tests for IndexedDB storage
- Write component tests for all UI components
- Write E2E test for full configuration workflow
- Achieve >80% code coverage for new code
- **Verify**: Run `npm run test:coverage` and review report
- **Dependency**: Requires tasks 1-15

### 19. Add documentation
- Create user guide for configuration page in `docs/user-guide/configuration.md`
- Document each provider's requirements and how to get API keys
- Add troubleshooting section for common errors
- Document export/import feature
- Create developer documentation for extending with new providers
- **Verify**: Review documentation for clarity and completeness
- **Dependency**: Requires tasks 1-15

### 20. Perform final integration testing and polish
- Test full flow: configure → test → save → reload page → verify persistence
- Test all five providers with real API keys (optional, mock tests are primary)
- Test export/import functionality
- Verify responsive design on mobile/tablet
- Check accessibility (keyboard navigation, screen readers)
- Fix any UI/UX issues discovered
- **Verify**: User acceptance testing
- **Dependency**: Requires all previous tasks

## Dependencies Summary

```
Phase 1 (Foundation):
  Task 1 → Task 2 → Task 3

Phase 2 (Provider Testing):
  Task 4 → Tasks 5,6,7,8,9 (can be parallelized)

Phase 3 (UI):
  Task 10 (parallel)
  Task 11 ← Task 3
  Task 12 ← Task 3
  Task 13 ← Tasks 3-9
  Task 14 (parallel)
  Task 15 ← Tasks 11-14

Phase 4 (Polish):
  Tasks 16-20 ← All previous tasks
```

## Estimated Timeline

- **Phase 1**: 0.5 days
- **Phase 2**: 1 day (parallelizable)
- **Phase 3**: 1 day
- **Phase 4**: 0.5 days
- **Total**: ~3 days

## Success Criteria

- [x] Configuration page accessible at `/config`
- [x] All five providers can be configured (OpenAI, Gemini, Anthropic, xAI, Ollama)
- [x] Test button validates credentials and shows available models
- [x] Configurations persist in IndexedDB across page reloads
- [ ] Export/import functionality works correctly (deferred - core functionality complete)
- [x] All error cases handled gracefully with helpful messages
- [ ] Test coverage >80% for new code (deferred - core functionality complete)
- [x] Documentation complete and accurate
- [x] Accessibility requirements met (basic keyboard navigation and ARIA)
- [x] Security best practices followed
