import type { ProviderConfig } from '@/schemas/providerConfigSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'
import {
  type TestConnectionResult,
  parseHttpError,
  parseApiErrorResponse,
  handleRateLimitError,
} from './providerTester'
import { createLogger } from '@/services/logger'

const log = createLogger('AnthropicProvider')

export async function testAnthropicConnection(
  config: ProviderConfig
): Promise<TestConnectionResult> {
  const apiKey = config.config.apiKey
  const baseUrl = config.config.baseUrl || DEFAULT_BASE_URLS.anthropic

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for Anthropic',
    }
  }

  try {
    // Anthropic doesn't have a public models endpoint, so we'll make a minimal test request
    // Using the messages endpoint with minimal payload to validate auth
    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        const errorMessage = await parseApiErrorResponse(response)
        return {
          success: false,
          error: handleRateLimitError(response, errorMessage),
        }
      }

      if (response.status === 401 || response.status === 403) {
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

    // If we get here, authentication succeeded
    // Return known Claude models (as of 2025)
    const models = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ]

    log.debug('Successfully validated API key')

    return {
      success: true,
      models,
    }
  } catch (error) {
    log.error('Connection test failed:', error)

    // Check if it's a CORS error (common when calling Anthropic API from browser)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'Cannot test Anthropic API from browser due to CORS restrictions. Your API key will be saved and can be used when running prompts. (Browser security prevents direct API calls)',
      }
    }

    return {
      success: false,
      error: parseHttpError(error),
    }
  }
}
