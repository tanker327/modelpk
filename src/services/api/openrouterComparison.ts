import type { ComparisonAPIRequest } from './comparisonService'
import type { TokenUsage } from '@/schemas/comparisonSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'

export async function sendOpenRouterComparison(
  request: ComparisonAPIRequest
): Promise<{ success: boolean; response?: string; error?: string; tokenUsage?: TokenUsage }> {
  const apiKey = request.config.apiKey
  const baseUrl = request.config.baseUrl || DEFAULT_BASE_URLS.openrouter

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for OpenRouter',
    }
  }

  try {
    const messages: Array<{ role: string; content: string }> = []

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt })
    }

    messages.push({ role: 'user', content: request.userPrompt })

    console.info(`[OpenRouter] Sending request to model: ${request.modelId}`)

    // Build request body with advanced parameters
    const requestBody: Record<string, unknown> = {
      model: request.modelId,
      messages,
    }

    // Add advanced parameters if provided (OpenAI-compatible)
    if (request.advancedParameters) {
      const params = request.advancedParameters
      if (params.temperature !== undefined) requestBody.temperature = params.temperature
      if (params.maxTokens !== undefined) requestBody.max_tokens = params.maxTokens
      if (params.topP !== undefined) requestBody.top_p = params.topP
      if (params.topK !== undefined) requestBody.top_k = params.topK
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
        'HTTP-Referer': 'https://ai-racers.app', // Optional: identifies your app
        'X-Title': 'AI Racers', // Optional: sets app title
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Build comprehensive error message
      const parts: string[] = []

      // Add HTTP status code
      parts.push(`Status: ${response.status} (${response.statusText})`)

      // Add error message from response
      if (errorData.error?.message) {
        parts.push(`\n${errorData.error.message}`)
      }

      // Add error code if available
      if (errorData.error?.code) {
        parts.push(`\nError Code: ${errorData.error.code}`)
      }

      // Add detailed metadata if available (rate limits, upstream errors, etc.)
      if (errorData.error?.metadata?.raw) {
        parts.push(`\n\nDetails:\n${errorData.error.metadata.raw}`)
      }

      // Add provider name if available
      if (errorData.error?.metadata?.provider_name) {
        parts.push(`\nProvider: ${errorData.error.metadata.provider_name}`)
      }

      const errorMessage = parts.join('')

      console.error('[OpenRouter] API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })

      return {
        success: false,
        error: errorMessage,
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('[OpenRouter] No content in response:', data)
      return {
        success: false,
        error: 'No response content received from OpenRouter',
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

    console.info(`[OpenRouter] Successfully received response from ${request.modelId}`)

    return {
      success: true,
      response: content,
      tokenUsage,
    }
  } catch (error) {
    console.error('[OpenRouter Comparison] Error:', error)

    // Check for CORS error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'Cannot access OpenRouter API from browser due to CORS restrictions. Consider using a local proxy or server-side implementation.',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
