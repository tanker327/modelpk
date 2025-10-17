import type { ProviderId } from '@/schemas/providerConfigSchema'
import type { ProviderConfigData } from '@/schemas/providerConfigSchema'
import type { TokenUsage, AdvancedParameters } from '@/schemas/comparisonSchema'

export interface ComparisonAPIRequest {
  providerId: ProviderId
  modelId: string
  systemPrompt?: string
  userPrompt: string
  config: ProviderConfigData
  advancedParameters?: AdvancedParameters
}

export interface ComparisonAPIResponse {
  success: boolean
  response?: string
  error?: string
  durationMs: number
  tokenUsage?: TokenUsage
}

/**
 * Send a comparison request to a specific provider/model
 * Tracks timing automatically
 */
export async function sendComparisonRequest(
  request: ComparisonAPIRequest
): Promise<ComparisonAPIResponse> {
  const startTime = performance.now()

  try {
    // Import the appropriate provider service dynamically
    let result: { success: boolean; response?: string; error?: string; tokenUsage?: TokenUsage }

    switch (request.providerId) {
      case 'openai': {
        const { sendOpenAIComparison } = await import('./openaiComparison')
        result = await sendOpenAIComparison(request)
        break
      }
      case 'gemini': {
        const { sendGeminiComparison } = await import('./geminiComparison')
        result = await sendGeminiComparison(request)
        break
      }
      case 'anthropic': {
        const { sendAnthropicComparison } = await import('./anthropicComparison')
        result = await sendAnthropicComparison(request)
        break
      }
      case 'xai': {
        const { sendXAIComparison } = await import('./xaiComparison')
        result = await sendXAIComparison(request)
        break
      }
      case 'ollama': {
        const { sendOllamaComparison } = await import('./ollamaComparison')
        result = await sendOllamaComparison(request)
        break
      }
      case 'openrouter': {
        const { sendOpenRouterComparison } = await import('./openrouterComparison')
        result = await sendOpenRouterComparison(request)
        break
      }
      default:
        throw new Error(`Unknown provider: ${request.providerId}`)
    }

    const endTime = performance.now()
    const durationMs = Math.round(endTime - startTime)

    return {
      ...result,
      durationMs,
    }
  } catch (error) {
    const endTime = performance.now()
    const durationMs = Math.round(endTime - startTime)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs,
    }
  }
}

/**
 * Format duration for display
 */
export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`
  }
  return `${(durationMs / 1000).toFixed(2)}s`
}
