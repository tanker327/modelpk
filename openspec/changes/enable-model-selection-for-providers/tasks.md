# Tasks: Enable Model Selection for Providers

## Phase 1: Schema and Data Model (Foundation)

### 1. Update provider configuration schema
- Add `selectedModels` field to `ProviderConfigDataSchema` in `src/schemas/providerConfigSchema.ts`
- Define as optional array of strings with default empty array: `z.array(z.string()).optional().default([])`
- Update TypeScript `ProviderConfigData` type (automatically inferred from Zod schema)
- **Verify**: Run TypeScript compiler, ensure no type errors
- **Dependency**: None

### 2. Test schema changes with storage
- Manually test saving a config with `selectedModels` to IndexedDB
- Verify existing storage functions (`saveConfig`, `getAllConfigs`) handle new field correctly
- Test loading config with and without `selectedModels` field
- **Verify**: Use browser DevTools to inspect IndexedDB and confirm field is stored
- **Dependency**: Requires task 1

## Phase 2: UI Components (Display and Interaction)

### 3. Remove model truncation in ConfigPage
- Locate model display code in `src/pages/ConfigPage.tsx` (around line 252)
- Remove `.slice(0, 10)` limitation from model mapping
- Remove "+N more" indicator code (lines 260-264)
- **Verify**: Test connection returns all models without truncation
- **Dependency**: None (can be done in parallel with task 1)

### 4. Create ModelTag component
- Create `src/components/config/ModelTag.tsx`
- Accept props: `modelName: string`, `isSelected: boolean`, `onToggle: () => void`
- Implement two visual states:
  - Unselected: `bg-gray-100 text-gray-700` with hover effect
  - Selected: `bg-blue-500 text-white` with hover effect
- Add click handler that calls `onToggle`
- Add keyboard support (Enter/Space keys)
- Add aria-label for accessibility
- **Verify**: Render component in isolation with both states
- **Dependency**: None (can be done in parallel)

### 5. Update ProviderCard to use ModelTag
- In `src/pages/ConfigPage.tsx`, add local state for `selectedModels` in `ProviderCard`
- Initialize from `config.config.selectedModels || []`
- Map over `testResult.models` and render `ModelTag` for each
- Pass `isSelected` based on whether model is in `selectedModels` array
- Implement `handleModelToggle(modelName)` function
- **Verify**: Click models and verify they toggle visually
- **Dependency**: Requires tasks 3-4

### 6. Add CSS transitions for smooth state changes
- Add transition classes to ModelTag for background and color changes
- Use `transition-colors duration-150` for smooth visual feedback
- **Verify**: Toggle models and ensure smooth animation
- **Dependency**: Requires task 4

## Phase 3: State Management and Persistence (Data Sync)

### 7. Wire model selection to providerConfigsActions
- In `ProviderCard.handleModelToggle`, call `providerConfigsActions.updateConfig`
- Pass updated `selectedModels` array in config updates
- Ensure deep merge in `updateConfig` action handles nested config properly (already implemented)
- **Verify**: Check browser DevTools → Application → IndexedDB after toggling models
- **Dependency**: Requires tasks 1-2, 5

### 8. Implement immediate sync to IndexedDB
- Verify that `handleModelToggle` triggers `updateConfig` synchronously
- Ensure no debouncing/throttling (immediate save on each click)
- Add error handling for failed saves
- **Verify**: Toggle model, immediately refresh page, verify selection persists
- **Dependency**: Requires task 7

### 9. Load selected models on page mount
- Ensure `providerConfigsActions.init()` loads `selectedModels` from IndexedDB
- Verify `ProviderCard` receives and uses `config.config.selectedModels`
- Test with providers that have selections and providers that don't
- **Verify**: Refresh page after selecting models, verify selections are restored
- **Dependency**: Requires tasks 7-8

## Phase 4: Polish and Testing (Quality Assurance)

### 10. Test with large model lists
- Test with OpenAI (typically 50+ models)
- Test with Ollama (can have 100+ models if many are installed)
- Verify UI remains performant and usable
- Check that flexbox wrapping works correctly
- **Verify**: Visual inspection with large model lists
- **Dependency**: Requires tasks 3-6

### 11. Add accessibility features
- Ensure ModelTag has proper `role` attribute (defaults to `button` via click handler)
- Add `aria-pressed` attribute to indicate selected state
- Verify keyboard navigation works (Tab to focus, Enter/Space to toggle)
- Test with screen reader
- **Verify**: Use browser accessibility inspector
- **Dependency**: Requires task 4

### 12. Test edge cases
- Provider with 0 models (should show nothing)
- Provider with 1 model (should display normally)
- Rapidly clicking same model (should toggle correctly)
- Selecting all models, then deselecting all
- Switching between providers while selections are in progress
- **Verify**: Manual testing of all scenarios
- **Dependency**: Requires tasks 5-9

### 13. Update documentation
- Update `docs/user-guide/configuration.md` with model selection feature
- Add screenshots showing selected vs unselected models
- Document that selections persist across sessions
- **Verify**: Review documentation for clarity
- **Dependency**: Requires tasks 1-12

### 14. Add unit tests for model toggle logic
- Test `handleModelToggle` function adds model to empty array
- Test toggling removes model from array
- Test toggling preserves other selected models
- **Verify**: Run tests with `npm test`
- **Dependency**: Requires task 5

## Dependencies Summary

```
Phase 1 (Schema):
  Task 1 → Task 2

Phase 2 (UI):
  Task 3 (parallel)
  Task 4 (parallel)
  Task 5 ← Tasks 3-4
  Task 6 ← Task 4

Phase 3 (Persistence):
  Task 7 ← Tasks 1-2, 5
  Task 8 ← Task 7
  Task 9 ← Tasks 7-8

Phase 4 (Polish):
  Task 10 ← Tasks 3-6
  Task 11 ← Task 4
  Task 12 ← Tasks 5-9
  Task 13 ← Tasks 1-12
  Task 14 ← Task 5
```

## Estimated Timeline

- **Phase 1**: 0.5 hours (schema updates)
- **Phase 2**: 1.5 hours (UI components)
- **Phase 3**: 1 hour (persistence)
- **Phase 4**: 1 hour (testing and polish)
- **Total**: ~4 hours

## Success Criteria

- [x] Schema includes `selectedModels` field
- [x] All models display without truncation
- [x] Models can be clicked to toggle selection
- [x] Selected models have clear visual distinction
- [x] Selections save to IndexedDB immediately
- [x] Selections restore on page load
- [x] Works with large model lists (50+)
- [x] Keyboard accessible
- [x] Documentation updated
- [x] Tests passing
