import type { ComparisonAPIRequest } from './comparisonService'
import type { TokenUsage } from '@/schemas/comparisonSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'

export async function sendOllamaComparison(
  request: ComparisonAPIRequest
): Promise<{ success: boolean; response?: string; error?: string; tokenUsage?: TokenUsage }> {
  const endpoint = request.config.endpoint || DEFAULT_BASE_URLS.ollama

  try {
    console.info(`[Ollama] Sending request to ${endpoint}/api/chat for model ${request.modelId}`)

    // Build messages array with proper role-based structure
    // Reference: https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion
    const messages: Array<{ role: string; content: string }> = []

    // Add system message first if provided
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      })
      console.debug(`[Ollama] Using system prompt: ${request.systemPrompt.substring(0, 50)}...`)
    }

    // Add user message
    messages.push({
      role: 'user',
      content: request.userPrompt,
    })

    const requestBody: Record<string, unknown> = {
      model: request.modelId,
      messages,
      stream: false,
    }

    // Add options with advanced parameters if provided
    if (request.advancedParameters) {
      const params = request.advancedParameters
      const options: Record<string, unknown> = {}

      if (params.temperature !== undefined) options.temperature = params.temperature
      if (params.topP !== undefined) options.top_p = params.topP
      if (params.topK !== undefined) options.top_k = params.topK
      if (params.frequencyPenalty !== undefined) options.frequency_penalty = params.frequencyPenalty
      if (params.presencePenalty !== undefined) options.presence_penalty = params.presencePenalty
      if (params.stopSequences !== undefined && params.stopSequences.length > 0) {
        options.stop = params.stopSequences
      }

      // Ollama uses num_predict for max tokens
      if (params.maxTokens !== undefined) options.num_predict = params.maxTokens

      if (Object.keys(options).length > 0) {
        requestBody.options = options
      }
    }

    const response = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()

    // /api/chat returns { message: { role: "assistant", content: "..." }, ... }
    // /api/generate returns { response: "..." }
    const content = data.message?.content

    if (!content) {
      return {
        success: false,
        error: 'No response content received from Ollama',
      }
    }

    console.debug(`[Ollama] Received response: ${content.substring(0, 100)}...`)

    // Extract token usage (Ollama chat format)
    const tokenUsage = data.prompt_eval_count || data.eval_count
      ? {
          promptTokens: data.prompt_eval_count,
          completionTokens: data.eval_count,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        }
      : undefined

    return {
      success: true,
      response: content,
      tokenUsage,
    }
  } catch (error) {
    console.error('[Ollama Comparison] Error:', error)

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        success: false,
        error: 'Cannot connect to Ollama. Make sure Ollama is running locally (ollama serve)',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
