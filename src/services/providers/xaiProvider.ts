import type { ProviderConfig } from '@/schemas/providerConfigSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'
import {
  type TestConnectionResult,
  parseHttpError,
  parseApiErrorResponse,
  handleRateLimitError,
} from './providerTester'
import { createLogger } from '@/services/logger'

const log = createLogger('xAIProvider')


export async function testXAIConnection(config: ProviderConfig): Promise<TestConnectionResult> {
  const apiKey = config.config.apiKey
  const baseUrl = config.config.baseUrl || DEFAULT_BASE_URLS.xai

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for xAI',
    }
  }

  try {
    // xAI uses OpenAI-compatible API
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        const errorMessage = await parseApiErrorResponse(response)
        return {
          success: false,
          error: handleRateLimitError(
            response,
            `${errorMessage} (Note: xAI has a 5 requests per minute limit)`
          ),
        }
      }

      if (response.status === 401) {
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

    // xAI returns OpenAI-compatible format: { data: [...models] }
    if (!data.data || !Array.isArray(data.data)) {
      return {
        success: false,
        error: 'Unexpected response format from xAI API',
      }
    }

    const models = data.data.map((model: any) => model.id).sort()

    log.debug(`Successfully fetched ${models.length} models`)

    return {
      success: true,
      models,
    }
  } catch (error) {
    log.error('Connection test failed:', error)
    return {
      success: false,
      error: parseHttpError(error),
    }
  }
}
