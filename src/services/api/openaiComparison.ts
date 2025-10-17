import type { ComparisonAPIRequest } from './comparisonService'
import type { TokenUsage } from '@/schemas/comparisonSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'

export async function sendOpenAIComparison(
  request: ComparisonAPIRequest
): Promise<{ success: boolean; response?: string; error?: string; tokenUsage?: TokenUsage }> {
  const apiKey = request.config.apiKey
  const baseUrl = request.config.baseUrl || DEFAULT_BASE_URLS.openai

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for OpenAI',
    }
  }

  try {
    const messages: Array<{ role: string; content: string }> = []

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt })
    }

    messages.push({ role: 'user', content: request.userPrompt })

    // Build request body with advanced parameters
    const requestBody: Record<string, unknown> = {
      model: request.modelId,
      messages,
    }

    // Add advanced parameters if provided
    if (request.advancedParameters) {
      const params = request.advancedParameters
      if (params.temperature !== undefined) requestBody.temperature = params.temperature
      if (params.maxTokens !== undefined) requestBody.max_tokens = params.maxTokens
      if (params.topP !== undefined) requestBody.top_p = params.topP
      if (params.frequencyPenalty !== undefined) requestBody.frequency_penalty = params.frequencyPenalty
      if (params.presencePenalty !== undefined) requestBody.presence_penalty = params.presencePenalty
      if (params.stopSequences !== undefined && params.stopSequences.length > 0) {
        requestBody.stop = params.stopSequences
      }
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return {
        success: false,
        error: 'No response content received from OpenAI',
      }
    }

    // Extract token usage
    const tokenUsage = data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
          cachedTokens: data.usage.prompt_tokens_details?.cached_tokens,
          reasoningTokens: data.usage.completion_tokens_details?.reasoning_tokens,
        }
      : undefined

    return {
      success: true,
      response: content,
      tokenUsage,
    }
  } catch (error) {
    console.error('[OpenAI Comparison] Error:', error)

    // Check for CORS error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'Cannot access OpenAI API from browser due to CORS restrictions. Consider using a local proxy or server-side implementation.',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
