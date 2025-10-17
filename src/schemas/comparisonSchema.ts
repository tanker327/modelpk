import { z } from 'zod'
import { ProviderIdSchema } from './providerConfigSchema'

// Provider and model selection
export const ProviderModelSelectionSchema = z.object({
  providerId: ProviderIdSchema,
  modelId: z.string().min(1),
})

export type ProviderModelSelection = z.infer<typeof ProviderModelSelectionSchema>

// Advanced parameters for model generation
export const AdvancedParametersSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().min(0).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stopSequences: z.array(z.string()).optional(),
})

export type AdvancedParameters = z.infer<typeof AdvancedParametersSchema>

// Comparison request
export const ComparisonRequestSchema = z.object({
  testName: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, 'User prompt is required'),
  selections: z.array(ProviderModelSelectionSchema).min(1, 'At least one model must be selected'),
  advancedParameters: AdvancedParametersSchema.optional(),
})

export type ComparisonRequest = z.infer<typeof ComparisonRequestSchema>

// Response status
export const ResponseStatusSchema = z.enum(['pending', 'loading', 'success', 'error'])

export type ResponseStatus = z.infer<typeof ResponseStatusSchema>

// Token usage information
export const TokenUsageSchema = z.object({
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  cachedTokens: z.number().optional(),
  reasoningTokens: z.number().optional(),
})

export type TokenUsage = z.infer<typeof TokenUsageSchema>

// Comparison response for a single provider/model
export const ComparisonResponseSchema = z.object({
  providerId: ProviderIdSchema,
  modelId: z.string(),
  status: ResponseStatusSchema,
  response: z.string().optional(),
  error: z.string().optional(),
  startTime: z.number().optional(), // timestamp in ms
  endTime: z.number().optional(), // timestamp in ms
  durationMs: z.number().optional(), // calculated duration
  tokenUsage: TokenUsageSchema.optional(), // token usage stats
})

export type ComparisonResponse = z.infer<typeof ComparisonResponseSchema>

// Validation helpers
export const validateComparisonRequest = (data: unknown): ComparisonRequest => {
  return ComparisonRequestSchema.parse(data)
}

export const validateComparisonResponse = (data: unknown): ComparisonResponse => {
  return ComparisonResponseSchema.parse(data)
}
