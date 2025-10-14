# Design: Enable Model Selection for Providers

## Architecture Overview

This change extends the existing provider configuration system to support model selection. It touches three main areas:
1. **Data Layer**: Schema updates to store selected models
2. **UI Layer**: Interactive model tags with toggle functionality
3. **Persistence Layer**: Real-time sync to IndexedDB

## Data Model Changes

### Schema Extension

```typescript
// Before
export const ProviderConfigDataSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().url().optional(),
  baseUrl: z.string().url().optional(),
})

// After
export const ProviderConfigDataSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().url().optional(),
  baseUrl: z.string().url().optional(),
  selectedModels: z.array(z.string()).optional().default([]), // NEW
})
```

### Storage Structure

IndexedDB will store selected models as part of the provider config:

```json
{
  "id": "openai",
  "name": "OpenAI",
  "enabled": false,
  "config": {
    "apiKey": "sk-...",
    "baseUrl": "https://api.openai.com/v1",
    "selectedModels": ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"]
  }
}
```

## Component Architecture

### ConfigPage Component Flow

```
ConfigPage
  └─ ProviderCard (per provider)
       ├─ API Key Input
       ├─ Endpoint Input
       ├─ Test Button
       └─ ModelList (NEW component)
            └─ ModelTag (clickable, per model)
```

### State Management

**Local State** (in ProviderCard):
- `selectedModels: string[]` - tracks which models are selected

**Actions** (in providerConfigsActions):
- `updateConfig()` - extended to handle `selectedModels` field
- No new actions needed; existing action handles the update

### UI Component Design

#### ModelTag Component

Visual states:
- **Unselected**: Light gray background (`bg-gray-100`), gray text
- **Selected**: Blue background (`bg-blue-500`), white text, optional checkmark icon
- **Hover**: Slightly darker background, cursor pointer

Interaction:
- Click anywhere on tag to toggle
- Immediate visual feedback (no loading state needed for local toggle)
- Background save to IndexedDB after toggle

## Data Flow

### Model Selection Flow

```
1. User clicks model tag
   └─> ProviderCard.handleModelToggle()
       ├─> Update local selectedModels state
       ├─> providerConfigsActions.updateConfig(providerId, { config: { selectedModels } })
       │   └─> configStorage.saveConfig() → IndexedDB
       └─> UI re-renders with new selection state
```

### Page Load Flow

```
1. Page loads
   └─> providerConfigsActions.init()
       ├─> configStorage.getAllConfigs() → fetch from IndexedDB
       ├─> Merge with DEFAULT_PROVIDERS
       └─> Return configs with selectedModels
           └─> ProviderCard receives config.config.selectedModels
               └─> Initialize local selectedModels state
                   └─> Render ModelTags with correct selected state
```

## Implementation Strategy

### Phase 1: Schema and Storage (Foundation)
1. Update `ProviderConfigDataSchema` to include `selectedModels`
2. Update TypeScript types to reflect new field
3. Ensure existing storage functions handle the new field (no changes needed - they're generic)

### Phase 2: UI Components (User Interface)
1. Create `ModelTag` component with selected/unselected states
2. Replace truncated model list with full list
3. Add click handlers for model selection
4. Update local state on click

### Phase 3: Persistence (Data Sync)
1. Wire up model toggle to `updateConfig` action
2. Test IndexedDB persistence
3. Test page reload scenario

### Phase 4: Polish (User Experience)
1. Add smooth transitions for selected state
2. Ensure keyboard accessibility (Enter/Space to toggle)
3. Add aria-labels for screen readers
4. Test with large model lists (50+ models)

## Alternative Approaches Considered

### Alternative 1: Default all models to selected
**Pros**: Users don't have to manually select
**Cons**: Makes selection less intentional; "select all" can be a one-click action later
**Decision**: Start with none selected, let users opt-in

### Alternative 2: Separate "Model Management" page
**Pros**: Keeps config page simpler
**Cons**: Adds navigation friction; models are discovered during testing, so natural to select them immediately
**Decision**: Keep inline with test results

### Alternative 3: Checkbox beside each model
**Pros**: More explicit selection mechanism
**Cons**: Takes more space; clicking the tag itself is more direct
**Decision**: Use toggle tags (click anywhere)

## Performance Considerations

- **Large Model Lists**: OpenAI can return 50+ models. Using CSS flexbox with `flex-wrap: wrap` should handle this without virtualization
- **State Updates**: Model selection triggers a single IndexedDB write per click, which is acceptable
- **Re-renders**: Only ProviderCard re-renders on selection change, not entire page

## Security Considerations

No new security concerns. Selected models are stored locally in IndexedDB alongside API keys, which already have appropriate browser security.

## Testing Strategy

- **Unit Tests**: Test model toggle logic, ensure state updates correctly
- **Integration Tests**: Test IndexedDB persistence and retrieval of selected models
- **Visual Tests**: Verify selected vs unselected styling is clear
- **Manual Tests**: Test with providers that have many models (OpenAI, Ollama)
