import { z } from 'zod'

// Provider ID enum
export const ProviderIdSchema = z.enum([
  'openai',
  'gemini',
  'anthropic',
  'xai',
  'ollama',
  'openrouter',
  'deepseek',
])

export type ProviderId = z.infer<typeof ProviderIdSchema>

// Provider-specific configuration
export const ProviderConfigDataSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().url().optional(),
  baseUrl: z.string().url().optional(),
  selectedModels: z.array(z.string()).optional().default([]),
})

export type ProviderConfigData = z.infer<typeof ProviderConfigDataSchema>

// Main provider configuration
export const ProviderConfigSchema = z.object({
  id: ProviderIdSchema,
  name: z.string().min(1),
  enabled: z.boolean().default(false),
  config: ProviderConfigDataSchema,
})

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>

// Test result status
export const TestStatusSchema = z.enum(['idle', 'testing', 'success', 'error'])

export type TestStatus = z.infer<typeof TestStatusSchema>

// Test result
export const TestResultSchema = z.object({
  providerId: ProviderIdSchema,
  status: TestStatusSchema,
  models: z.array(z.string()).optional(),
  error: z.string().optional(),
  testedAt: z.date().optional(),
})

export type TestResult = z.infer<typeof TestResultSchema>

// Default provider configurations
export const DEFAULT_PROVIDERS: Omit<ProviderConfig, 'config'>[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    enabled: false,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    enabled: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    enabled: false,
  },
  {
    id: 'xai',
    name: 'xAI',
    enabled: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    enabled: false,
  },
  {
    id: 'ollama',
    name: 'Ollama',
    enabled: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    enabled: false,
  },
]

// Default base URLs for providers
export const DEFAULT_BASE_URLS: Record<ProviderId, string> = {
  openai: 'https://api.openai.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  anthropic: 'https://api.anthropic.com/v1',
  xai: 'https://api.x.ai/v1',
  ollama: 'http://localhost:11434',
  openrouter: 'https://openrouter.ai/api/v1',
  deepseek: 'https://api.deepseek.com/v1',
}

// Validation helpers
export const validateProviderConfig = (data: unknown): ProviderConfig => {
  return ProviderConfigSchema.parse(data)
}

export const validateTestResult = (data: unknown): TestResult => {
  return TestResultSchema.parse(data)
}
