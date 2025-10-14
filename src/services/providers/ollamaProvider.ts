import type { ProviderConfig } from '@/schemas/providerConfigSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'
import { type TestConnectionResult, parseHttpError, parseApiErrorResponse } from './providerTester'

export async function testOllamaConnection(config: ProviderConfig): Promise<TestConnectionResult> {
  const endpoint = config.config.endpoint || DEFAULT_BASE_URLS.ollama

  try {
    const response = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorMessage = await parseApiErrorResponse(response)
      return {
        success: false,
        error: `Failed to connect to Ollama: ${errorMessage}`,
      }
    }

    const data = await response.json()

    // Ollama returns { models: [...] }
    if (!data.models || !Array.isArray(data.models)) {
      return {
        success: false,
        error: 'Unexpected response format from Ollama API',
      }
    }

    const models = data.models.map((model: any) => model.name || model.model).sort()

    if (models.length === 0) {
      return {
        success: true,
        models: [],
        error: 'Ollama is running but no models are installed. Run "ollama pull <model>" to download a model.',
      }
    }

    console.info(`[Ollama] Successfully fetched ${models.length} models`)

    return {
      success: true,
      models,
    }
  } catch (error) {
    console.error('[Ollama] Connection test failed:', error)

    // Special handling for Ollama connection errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Unable to connect to Ollama. Make sure Ollama is running with "ollama serve".',
      }
    }

    return {
      success: false,
      error: parseHttpError(error),
    }
  }
}
