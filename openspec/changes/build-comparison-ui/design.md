# Design: Build Comparison UI

## Architecture Overview

This change introduces the core comparison functionality. It involves:
1. **Data Layer**: Schemas for comparison requests/responses
2. **Service Layer**: API integration for calling each provider
3. **UI Layer**: Comparison page with selector, input, and results components
4. **State Layer**: Managing comparison state and responses

## Data Model

### Comparison Request Schema

```typescript
export const ComparisonRequestSchema = z.object({
  testName: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1), // Required
  selections: z.array(z.object({
    providerId: ProviderIdSchema,
    modelId: z.string(),
  })),
})
```

### Comparison Response Schema

```typescript
export const ComparisonResponseSchema = z.object({
  providerId: ProviderIdSchema,
  modelId: z.string(),
  status: z.enum(['pending', 'loading', 'success', 'error']),
  response: z.string().optional(),
  error: z.string().optional(),
  startTime: z.number().optional(), // timestamp
  endTime: z.number().optional(), // timestamp
  durationMs: z.number().optional(), // calculated duration
})
```

## Component Architecture

```
ComparisonPage
  ├─ ProviderModelSelector
  │    └─ ProviderCheckbox (per provider)
  │         └─ ModelSelect (dropdown for models)
  ├─ PromptInput
  │    ├─ TestNameInput
  │    ├─ SystemPromptTextarea
  │    └─ UserPromptTextarea
  ├─ ActionButtons
  │    ├─ ResetButton
  │    └─ SubmitButton
  └─ ResultsGrid
       └─ ResponsePanel (per selected combination)
            ├─ Provider/Model Header
            ├─ Status Indicator
            ├─ Response Text
            └─ Timing Info
```

## Service Layer Design

### Provider API Service

Create a unified service that handles API calls to all providers:

```typescript
// src/services/api/comparisonService.ts

interface ComparisonRequest {
  providerId: ProviderId
  modelId: string
  systemPrompt?: string
  userPrompt: string
  config: ProviderConfigData
}

interface ComparisonResponse {
  success: boolean
  response?: string
  error?: string
  durationMs: number
}

async function sendComparisonRequest(request: ComparisonRequest): Promise<ComparisonResponse>
```

Each provider will need its own implementation:
- `src/services/api/openaiComparison.ts`
- `src/services/api/geminiComparison.ts`
- `src/services/api/anthropicComparison.ts`
- `src/services/api/xaiComparison.ts`
- `src/services/api/ollamaComparison.ts`

### API Format Per Provider

**OpenAI**:
```json
POST /v1/chat/completions
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ]
}
```

**Gemini**:
```json
POST /models/{model}:generateContent?key={apiKey}
{
  "contents": [
    {"parts": [{"text": "system + user combined"}]}
  ]
}
```

**Anthropic**:
```json
POST /v1/messages
{
  "model": "claude-3-5-sonnet-20241022",
  "system": "...",
  "messages": [{"role": "user", "content": "..."}],
  "max_tokens": 1024
}
```

**xAI** (OpenAI-compatible):
```json
POST /v1/chat/completions
{
  "model": "grok-beta",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ]
}
```

**Ollama**:
```json
POST /api/generate
{
  "model": "llama2",
  "prompt": "system + user combined",
  "stream": false
}
```

## State Management

### Local State (in ComparisonPage)

```typescript
interface ComparisonState {
  // Input state
  testName: string
  systemPrompt: string
  userPrompt: string

  // Selection state
  selectedCombinations: Array<{
    providerId: ProviderId
    modelId: string
  }>

  // Response state
  responses: Record<string, ComparisonResponse> // key: `${providerId}-${modelId}`

  // UI state
  isSubmitting: boolean
}
```

### Data Flow

#### Selection Flow
```
1. User checks provider checkbox
   └─> Show model dropdown for that provider
       └─> Populate dropdown with selectedModels from config
           └─> User selects model(s)
               └─> Add to selectedCombinations array
```

#### Submission Flow
```
1. User clicks Submit
   ├─> Validate userPrompt is not empty
   ├─> For each selected combination:
   │   ├─> Set status to 'loading'
   │   ├─> Record startTime
   │   ├─> Call sendComparisonRequest()
   │   ├─> Record endTime
   │   ├─> Calculate durationMs
   │   └─> Update response state
   └─> Display all responses in panels
```

#### Reset Flow
```
1. User clicks Reset
   ├─> Clear testName, systemPrompt, userPrompt
   ├─> Clear selectedCombinations
   └─> Clear responses
```

## UI Layout

### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────┐
│  Provider/Model Selection                                │
│  [x] OpenAI  [Dropdown: gpt-4o ▼]                       │
│  [x] Anthropic [Dropdown: claude-3.5-sonnet ▼]          │
├─────────────────────────────────────────────────────────┤
│  Test Name: [                    ]                       │
│  System Prompt: [                                    ]   │
│  User Prompt: [                                      ]   │
│  [Reset] [Submit]                                        │
├─────────────────────────────────────────────────────────┤
│  Results (side-by-side)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ OpenAI       │  │ Anthropic    │  │ Gemini       │  │
│  │ gpt-4o       │  │ claude-3.5   │  │ gemini-1.5   │  │
│  │              │  │              │  │              │  │
│  │ Response...  │  │ Response...  │  │ Response...  │  │
│  │              │  │              │  │              │  │
│  │ ⏱ 1.2s      │  │ ⏱ 0.8s      │  │ ⏱ 1.5s      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (<640px)

- Stack panels vertically instead of side-by-side
- Make selectors collapsible
- Full-width panels

## Performance Considerations

### Parallel API Calls
- All requests sent simultaneously using `Promise.all()`
- Each request tracked independently
- Partial success/failure handled gracefully

### Response Size
- Max height for response panels with scrolling
- Consider truncating very long responses (with "show more" button)

### Error Handling
- Network errors: Show error message in panel
- API errors: Display API error message
- Timeout: Consider adding request timeout (30s default)

## Alternative Approaches Considered

### Alternative 1: Sequential API calls
**Pros**: Simpler error handling, less resource intensive
**Cons**: Much slower user experience
**Decision**: Use parallel calls for better UX

### Alternative 2: Single provider/model at a time
**Pros**: Simpler UI, easier to implement
**Cons**: Defeats the purpose of "racing" models
**Decision**: Support multiple selections from the start

### Alternative 3: Use WebSockets for real-time updates
**Pros**: Could support streaming, real-time progress
**Cons**: More complex, requires backend
**Decision**: Start with simple HTTP requests, add streaming later

## Security Considerations

- API keys stored in IndexedDB (already implemented)
- API calls made directly from browser (CORS limitations noted)
- No sensitive data logged to console
- Consider adding request/response size limits

## Testing Strategy

- **Unit Tests**: Test comparison service for each provider
- **Component Tests**: Test UI components in isolation
- **Integration Tests**: Test full flow from selection to results
- **Manual Tests**: Test with real API keys and various prompt lengths
