import { z } from 'zod'
import { ProviderIdSchema } from './providerConfigSchema'

// Provider and model selection
export const ProviderModelSelectionSchema = z.object({
  providerId: ProviderIdSchema,
  modelId: z.string().min(1),
})

export type ProviderModelSelection = z.infer<typeof ProviderModelSelectionSchema>

// Comparison request
export const ComparisonRequestSchema = z.object({
  testName: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, 'User prompt is required'),
  selections: z.array(ProviderModelSelectionSchema).min(1, 'At least one model must be selected'),
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
