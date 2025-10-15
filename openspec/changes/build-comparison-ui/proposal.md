# Proposal: Build Comparison UI

## Overview

Build the core comparison UI on the main page that allows users to select multiple provider/model combinations, input prompts (system and user), and see side-by-side responses with timing information.

## Problem Statement

Currently, the main page is just a placeholder. Users need a functional UI to:
1. Select which providers and models to compare
2. Input prompts to send to the selected models
3. Submit the comparison request
4. View responses side-by-side with timing metrics
5. Reset and start a new comparison

## Proposed Solution

### User Experience Flow

1. **Provider/Model Selection**:
   - User sees a list of configured providers (with selected models from config page)
   - For each provider, user can select one or more models
   - Only providers with API keys configured are available

2. **Prompt Input**:
   - Optional "Test Name" field for organizing comparisons
   - "System Prompt" textarea (optional)
   - "User Prompt" textarea (required)

3. **Actions**:
   - "Reset" button clears all selections and inputs
   - "Submit" button sends requests to all selected provider/model combinations

4. **Results Display**:
   - Multiple panels side-by-side, one per provider/model combination
   - Each panel shows:
     - Provider name and model name
     - Response text
     - Response time (in seconds or milliseconds)
     - Status indicator (loading, success, error)

### Technical Approach

1. **Schema Updates**: Create schemas for comparison requests and responses
2. **Provider API Integration**:
   - Create unified API service that calls each provider
   - Handle streaming vs non-streaming responses
   - Track timing for each request
3. **UI Components**:
   - ComparisonPage component (replaces HomePage)
   - Provider/Model selector component
   - Prompt input component
   - Response panel component (for displaying results)
4. **State Management**:
   - Track selected provider/model combinations
   - Track prompts and test name
   - Track response state (loading, data, errors) for each combination
   - Track timing for each request

## User Stories

- **As a user**, I want to select multiple provider/model combinations so that I can compare their outputs
- **As a user**, I want to input a system prompt and user prompt so that I can test how models respond
- **As a user**, I want to see how long each model takes to respond so that I can evaluate performance
- **As a user**, I want to see responses side-by-side so that I can easily compare them
- **As a user**, I want to reset everything so that I can start a new comparison
- **As a user**, I want to name my tests so that I can organize my comparisons

## Success Criteria

- [ ] User can select multiple provider/model combinations
- [ ] User can input system prompt (optional) and user prompt (required)
- [ ] User can optionally name the test
- [ ] Submit button sends requests to all selected combinations
- [ ] Responses display side-by-side in panels
- [ ] Each panel shows provider, model, response text, and timing
- [ ] Reset button clears all inputs and selections
- [ ] Loading states are shown while waiting for responses
- [ ] Errors are displayed gracefully

## Out of Scope (For Now)

- Saving comparison history
- Export/share functionality
- Streaming responses (start with simple request/response)
- Model-specific parameters (temperature, max_tokens, etc.)
- Token usage tracking
- Cost estimation

## Dependencies

- Requires `add-llm-config-page` to be complete (providers configured)
- Requires `enable-model-selection-for-providers` to be complete (models selected)

## Risks and Mitigations

**Risk**: CORS issues when calling APIs from browser (especially Anthropic)
**Mitigation**: Document limitation; consider adding a simple proxy server later

**Risk**: Very long responses may break UI layout
**Mitigation**: Use scrollable panels with max height

**Risk**: Multiple simultaneous API calls may be slow or fail
**Mitigation**: Show individual loading states; allow partial success

## Open Questions

1. Should we support streaming responses or start with simple request/response?
   - **Recommendation**: Start simple (non-streaming), add streaming later
2. Should we show token counts?
   - **Recommendation**: Defer to future enhancement
3. Should responses be saved to history?
   - **Recommendation**: Defer to future enhancement
4. What happens if one provider fails but others succeed?
   - **Recommendation**: Show error in that panel, but display other successful responses
