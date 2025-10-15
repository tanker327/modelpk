import type { ComparisonAPIRequest } from './comparisonService'
import type { TokenUsage } from '@/schemas/comparisonSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'

export async function sendAnthropicComparison(
  request: ComparisonAPIRequest
): Promise<{ success: boolean; response?: string; error?: string; tokenUsage?: TokenUsage }> {
  const apiKey = request.config.apiKey
  const baseUrl = request.config.baseUrl || DEFAULT_BASE_URLS.anthropic

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for Anthropic',
    }
  }

  try {
    const body: Record<string, unknown> = {
      model: request.modelId,
      max_tokens: 1024,
      messages: [{ role: 'user', content: request.userPrompt }],
    }

    if (request.systemPrompt) {
      body.system = request.systemPrompt
    }

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      return {
        success: false,
        error: 'No response content received from Anthropic',
      }
    }

    // Extract token usage (Anthropic format)
    const tokenUsage = data.usage
      ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
          cachedTokens: data.usage.cache_read_input_tokens,
        }
      : undefined

    return {
      success: true,
      response: content,
      tokenUsage,
    }
  } catch (error) {
    console.error('[Anthropic Comparison] Error:', error)

    // Check for CORS error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'Cannot access Anthropic API from browser due to CORS restrictions',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
