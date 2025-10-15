# Tasks: Build Comparison UI

## Phase 1: Data Models and Schemas (Foundation)

### 1. Create comparison schemas
- Create `src/schemas/comparisonSchema.ts`
- Define `ComparisonRequestSchema` with testName, systemPrompt, userPrompt, selections
- Define `ProviderModelSelection` schema for provider/model pairs
- Define `ComparisonResponseSchema` with status, response, error, timing fields
- Export TypeScript types from schemas
- **Verify**: TypeScript compiles without errors
- **Dependency**: None

### 2. Create comparison types and interfaces
- Define `ComparisonState` interface for managing UI state
- Define `ResponseStatus` type (pending, loading, success, error)
- Define helper types for timing (startTime, endTime, durationMs)
- **Verify**: Types are used correctly throughout codebase
- **Dependency**: Requires task 1

## Phase 2: API Integration (Service Layer)

### 3. Create base comparison service
- Create `src/services/api/comparisonService.ts`
- Define `sendComparisonRequest()` function signature
- Implement timing tracking (start, end, duration calculation)
- Create error handling utilities
- **Verify**: Service structure is in place
- **Dependency**: Requires task 1

### 4. Implement OpenAI comparison API
- Create `src/services/api/openaiComparison.ts`
- Implement chat completions API call
- Format system and user prompts correctly
- Handle response parsing
- Add error handling for OpenAI-specific errors
- **Verify**: Manual test with real API key
- **Dependency**: Requires task 3

### 5. Implement Gemini comparison API
- Create `src/services/api/geminiComparison.ts`
- Implement generateContent API call
- Combine system and user prompts (Gemini format)
- Handle response parsing from Gemini format
- Add error handling
- **Verify**: Manual test with real API key
- **Dependency**: Requires task 3

### 6. Implement Anthropic comparison API
- Create `src/services/api/anthropicComparison.ts`
- Implement messages API call with system prompt separate
- Add required max_tokens parameter (default 1024)
- Handle response parsing
- Handle CORS errors gracefully
- **Verify**: Manual test (may fail due to CORS, handle gracefully)
- **Dependency**: Requires task 3

### 7. Implement xAI comparison API
- Create `src/services/api/xaiComparison.ts`
- Implement chat completions API (OpenAI-compatible)
- Reuse OpenAI format with xAI base URL
- Handle response parsing
- Add error handling
- **Verify**: Manual test with real API key
- **Dependency**: Requires task 3

### 8. Implement Ollama comparison API
- Create `src/services/api/ollamaComparison.ts`
- Implement generate API call (non-streaming)
- Combine system and user prompts
- Handle response parsing from Ollama format
- Add connection error handling
- **Verify**: Test with local Ollama instance
- **Dependency**: Requires task 3

## Phase 3: UI Components (User Interface)

### 9. Create ComparisonPage component
- Update `src/App.tsx` to use ComparisonPage instead of HomePage
- Create `src/pages/ComparisonPage.tsx` with basic layout
- Add state for testName, systemPrompt, userPrompt
- Add state for selectedCombinations
- Add state for responses
- **Verify**: Page renders without errors
- **Dependency**: Requires task 2

### 10. Create ProviderModelSelector component
- Create `src/components/comparison/ProviderModelSelector.tsx`
- Load configured providers from providerConfigsActions
- Display provider checkboxes
- Show model dropdown when provider is checked
- Populate dropdown with selectedModels from config
- Handle provider and model selection/deselection
- **Verify**: Can select and deselect providers and models
- **Dependency**: Requires task 9

### 11. Create PromptInput component
- Create `src/components/comparison/PromptInput.tsx`
- Add optional test name input field
- Add optional system prompt textarea
- Add required user prompt textarea with validation
- Style inputs with Tailwind and shadcn/ui
- **Verify**: Inputs update state correctly
- **Dependency**: Requires task 9

### 12. Create ActionButtons component
- Create `src/components/comparison/ActionButtons.tsx`
- Add Reset button that clears all state
- Add Submit button that triggers comparison
- Disable Submit if user prompt is empty
- Disable Submit if no provider/model selected
- Show loading state on Submit button during API calls
- **Verify**: Buttons trigger correct actions
- **Dependency**: Requires tasks 9-11

### 13. Create ResponsePanel component
- Create `src/components/comparison/ResponsePanel.tsx`
- Accept props: provider, model, status, response, error, durationMs
- Display provider and model name in header
- Show loading spinner when status is 'loading'
- Display response text in scrollable area
- Display timing information
- Display errors with appropriate styling
- **Verify**: Component renders all states correctly
- **Dependency**: None (can be parallel)

### 14. Create ResultsGrid component
- Create `src/components/comparison/ResultsGrid.tsx`
- Accept array of response data
- Render ResponsePanel for each item
- Implement responsive grid layout (flexbox/grid)
- Handle different numbers of panels (1-10+)
- Add empty state when no results yet
- **Verify**: Layout adapts to different screen sizes
- **Dependency**: Requires task 13

## Phase 4: Integration and State Management (Wiring)

### 15. Integrate API calls in ComparisonPage
- Import all comparison API functions
- Implement handleSubmit function
- For each selected combination, call appropriate API
- Use Promise.all() for parallel execution
- Track individual response states
- Update responses state as requests complete
- **Verify**: API calls are made and responses update UI
- **Dependency**: Requires tasks 4-8, 9-14

### 16. Implement reset functionality
- Create handleReset function in ComparisonPage
- Clear testName, systemPrompt, userPrompt
- Clear selectedCombinations array
- Clear responses state
- **Verify**: Reset button clears everything
- **Dependency**: Requires task 15

### 17. Add response timing display
- Format duration as human-readable (ms or s)
- Display timing prominently in ResponsePanel
- Show timing even for failed requests
- **Verify**: Timing displays correctly for all responses
- **Dependency**: Requires tasks 13-15

### 18. Handle edge cases
- No providers configured: show message and link to config
- No models selected for provider: show appropriate message
- All requests fail: display all error messages
- Very long responses: test scrolling works
- Multiple selections from same provider: ensure they all display
- **Verify**: All edge cases handled gracefully
- **Dependency**: Requires task 15

## Phase 5: Polish and Testing (Quality Assurance)

### 19. Improve responsive design
- Test on mobile (< 640px): panels stack vertically
- Test on tablet (640-1024px): panels wrap appropriately
- Test on desktop (> 1024px): side-by-side layout
- Adjust spacing and sizing for each breakpoint
- **Verify**: Visual inspection on different screen sizes
- **Dependency**: Requires task 14

### 20. Add loading and error states
- Implement loading spinners for ResponsePanel
- Style error messages with appropriate colors
- Add icons for success/error states
- Test with intentionally failing requests
- **Verify**: All states display correctly
- **Dependency**: Requires task 13

### 21. Optimize performance
- Ensure parallel API calls don't block UI
- Add request timeout (30 seconds)
- Test with slow API responses
- Verify no memory leaks on repeated comparisons
- **Verify**: Performance testing with multiple requests
- **Dependency**: Requires task 15

### 22. Add accessibility features
- Ensure form inputs have proper labels
- Add aria-labels to buttons and panels
- Test keyboard navigation
- Ensure loading states are announced to screen readers
- **Verify**: Accessibility inspector shows no issues
- **Dependency**: Requires tasks 10-14

### 23. Update documentation
- Update README with comparison feature description
- Add screenshots showing the comparison UI
- Document known limitations (CORS, etc.)
- Add usage examples
- **Verify**: Documentation is clear and accurate
- **Dependency**: Requires tasks 1-22

### 24. Write tests
- Unit tests for comparison service functions
- Unit tests for timing calculations
- Component tests for ProviderModelSelector
- Component tests for PromptInput
- Component tests for ResponsePanel
- Integration test for full comparison flow
- **Verify**: All tests pass with `npm test`
- **Dependency**: Requires tasks 1-22

## Dependencies Summary

```
Phase 1 (Schemas):
  Task 1 → Task 2

Phase 2 (API):
  Task 3 → Tasks 4,5,6,7,8 (parallelizable)

Phase 3 (UI):
  Task 9 → Tasks 10,11,12
  Task 13 (parallel)
  Task 14 ← Task 13

Phase 4 (Integration):
  Task 15 ← Tasks 4-8, 9-14
  Task 16 ← Task 15
  Task 17 ← Tasks 13-15
  Task 18 ← Task 15

Phase 5 (Polish):
  Tasks 19-24 ← Tasks 1-18
```

## Estimated Timeline

- **Phase 1**: 1 hour (schemas and types)
- **Phase 2**: 4 hours (5 provider integrations)
- **Phase 3**: 4 hours (UI components)
- **Phase 4**: 2 hours (wiring and state management)
- **Phase 5**: 3 hours (polish, testing, docs)
- **Total**: ~14 hours

## Success Criteria

- [x] User can select multiple provider/model combinations
- [x] User can input test name (optional), system prompt (optional), and user prompt (required)
- [x] Submit button sends requests to all selected combinations in parallel
- [x] Responses display side-by-side in panels
- [x] Each panel shows provider, model, response, and timing
- [x] Reset button clears all inputs and selections
- [x] Loading states show while waiting for responses
- [x] Errors display gracefully
- [x] Layout is responsive (mobile, tablet, desktop)
- [x] All provider APIs work correctly (except known CORS issues)
- [x] Documentation is updated
- [ ] Tests are passing (deferred - core functionality complete)
