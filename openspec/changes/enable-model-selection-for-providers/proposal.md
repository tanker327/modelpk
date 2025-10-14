# Proposal: Enable Model Selection for Providers

## Overview

Enable users to view all discovered models for each LLM provider (instead of just showing the first 10) and allow them to select/deselect which models should be available for use when running prompts. Selected models will be persisted in IndexedDB and kept in sync with the UI.

## Problem Statement

Currently, the config page only displays the first 10 models returned from provider testing, with a "+N more" indicator for any additional models. Users cannot:
1. See the full list of available models
2. Choose which specific models they want to use for racing/comparison
3. Have their model preferences persist across sessions

## Proposed Solution

### User Experience Flow

1. User enters API credentials and clicks "Test" button
2. All discovered models are displayed in a scrollable, wrapped list (no truncation)
3. Each model is shown as a clickable tag/badge
4. Clicking a model toggles its "selected" state (visual indicator: different color/style)
5. Selected models are automatically saved to IndexedDB
6. On page reload, previously selected models are restored and displayed as selected

### Technical Approach

1. **Schema Update**: Add `selectedModels: string[]` to `ProviderConfigData`
2. **UI Update**:
   - Remove the `.slice(0, 10)` limitation
   - Make model tags clickable with toggle functionality
   - Add visual distinction for selected vs unselected models
3. **State Management**: Update `providerConfigsActions` to handle model selection
4. **Persistence**: Automatically sync selected models to IndexedDB on change

## User Stories

- **As a user**, I want to see all available models for a provider so that I can make informed choices about which models to use
- **As a user**, I want to click on model names to mark them as "available for racing" so that I can control which models appear in comparison workflows
- **As a user**, I want my model selections to persist across browser sessions so that I don't have to reconfigure them each time

## Success Criteria

- [ ] All models from test results are visible (no truncation)
- [ ] Models can be clicked to toggle selected state
- [ ] Selected models have clear visual distinction (e.g., different background color, checkmark)
- [ ] Selected models are saved to IndexedDB immediately on change
- [ ] Selected models are restored from IndexedDB on page load
- [ ] Model selection state persists across page refreshes

## Out of Scope

- Model search/filtering (can be added later if needed)
- Model grouping or categorization
- Model metadata display (descriptions, capabilities, pricing)
- Using selected models in actual prompt racing (future feature)

## Dependencies

- Requires existing `add-llm-config-page` change to be complete
- Builds on existing IndexedDB persistence infrastructure

## Risks and Mitigations

**Risk**: Some providers may return 100+ models, causing UI performance issues
**Mitigation**: Use CSS flexbox with wrapping; consider virtualization only if performance degrades in testing

**Risk**: Users might accidentally deselect all models
**Mitigation**: No enforcement needed at this stage; can add validation later when models are actually used for racing
