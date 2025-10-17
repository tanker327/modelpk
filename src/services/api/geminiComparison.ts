import type { ComparisonAPIRequest } from './comparisonService'
import type { TokenUsage } from '@/schemas/comparisonSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'
import { createLogger } from '@/services/logger'

const log = createLogger('Gemini')

export async function sendGeminiComparison(
  request: ComparisonAPIRequest
): Promise<{ success: boolean; response?: string; error?: string; tokenUsage?: TokenUsage }> {
  const apiKey = request.config.apiKey
  const baseUrl = request.config.baseUrl || DEFAULT_BASE_URLS.gemini

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for Gemini',
    }
  }

  try {
    log.debug('Sending API request')

    // Build request body with proper system instruction support
    // Reference: https://ai.google.dev/gemini-api/docs/text-generation
    // system_instruction.parts is an array of Part objects
    const requestBody: Record<string, unknown> = {
      contents: [
        {
          parts: [{ text: request.userPrompt }],
        },
      ],
    }

    // Add system instruction if provided
    if (request.systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: request.systemPrompt }],
      }
      log.debug('Using system instruction')
    }

    // Add generationConfig with advanced parameters if provided
    if (request.advancedParameters) {
      const params = request.advancedParameters
      const generationConfig: Record<string, unknown> = {}

      if (params.temperature !== undefined) generationConfig.temperature = params.temperature
      if (params.maxTokens !== undefined) generationConfig.maxOutputTokens = params.maxTokens
      if (params.topP !== undefined) generationConfig.topP = params.topP
      if (params.topK !== undefined) generationConfig.topK = params.topK
      if (params.stopSequences !== undefined && params.stopSequences.length > 0) {
        generationConfig.stopSequences = params.stopSequences
      }

      if (Object.keys(generationConfig).length > 0) {
        requestBody.generationConfig = generationConfig
      }
    }

    // Use x-goog-api-key header instead of URL parameter for better security
    // Reference: https://ai.google.dev/gemini-api/docs/api-key
    const response = await fetch(
      `${baseUrl}/models/${request.modelId}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return {
        success: false,
        error: 'No response content received from Gemini',
      }
    }

    log.debug('Received response')

    // Extract token usage (Gemini format)
    const tokenUsage = data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
          cachedTokens: data.usageMetadata.cachedContentTokenCount,
        }
      : undefined

    return {
      success: true,
      response: content,
      tokenUsage,
    }
  } catch (error) {
    log.error('API request failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
