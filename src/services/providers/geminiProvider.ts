import type { ProviderConfig } from '@/schemas/providerConfigSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'
import {
  type TestConnectionResult,
  parseHttpError,
  parseApiErrorResponse,
  handleRateLimitError,
} from './providerTester'

export async function testGeminiConnection(config: ProviderConfig): Promise<TestConnectionResult> {
  const apiKey = config.config.apiKey
  const baseUrl = config.config.baseUrl || DEFAULT_BASE_URLS.gemini

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for Gemini',
    }
  }

  try {
    // Gemini uses API key as query parameter
    const url = `${baseUrl}/models?key=${encodeURIComponent(apiKey)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        const errorMessage = await parseApiErrorResponse(response)
        return {
          success: false,
          error: handleRateLimitError(response, errorMessage),
        }
      }

      if (response.status === 400 || response.status === 403) {
        return {
          success: false,
          error: 'Authentication failed. Please check your API key.',
        }
      }

      const errorMessage = await parseApiErrorResponse(response)
      return {
        success: false,
        error: `Failed to connect: ${errorMessage}`,
      }
    }

    const data = await response.json()

    // Gemini returns { models: [...] }
    if (!data.models || !Array.isArray(data.models)) {
      return {
        success: false,
        error: 'Unexpected response format from Gemini API',
      }
    }

    const models = data.models
      .map((model: any) => {
        // Extract model ID from full name (e.g., "models/gemini-pro" -> "gemini-pro")
        const name = model.name || model.displayName || ''
        return name.replace('models/', '')
      })
      .filter((name: string) => name.includes('gemini'))
      .sort()

    console.info(`[Gemini] Successfully fetched ${models.length} models`)

    return {
      success: true,
      models,
    }
  } catch (error) {
    console.error('[Gemini] Connection test failed:', error)
    return {
      success: false,
      error: parseHttpError(error),
    }
  }
}
