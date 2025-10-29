import type { ProviderConfig } from '@/schemas/providerConfigSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'
import {
  type TestConnectionResult,
  parseHttpError,
  parseApiErrorResponse,
  handleRateLimitError,
} from './providerTester'
import { createLogger } from '@/services/logger'

const log = createLogger('DeepSeekProvider')

export async function testDeepSeekConnection(config: ProviderConfig): Promise<TestConnectionResult> {
  const apiKey = config.config.apiKey
  const baseUrl = config.config.baseUrl || DEFAULT_BASE_URLS.deepseek

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for DeepSeek',
    }
  }

  try {
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
          error: handleRateLimitError(response, errorMessage),
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

    // DeepSeek returns { data: [...models] } (OpenAI-compatible format)
    if (!data.data || !Array.isArray(data.data)) {
      return {
        success: false,
        error: 'Unexpected response format from DeepSeek API',
      }
    }

    const models = data.data
      .map((model: any) => model.id)
      .filter((id: string) => id.startsWith('deepseek')) // Filter for DeepSeek models
      .sort()

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
