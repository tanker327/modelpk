import type { ComparisonAPIRequest } from './comparisonService'
import type { TokenUsage } from '@/schemas/comparisonSchema'
import { DEFAULT_BASE_URLS } from '@/schemas/providerConfigSchema'

export async function sendGeminiComparison(
  request: ComparisonAPIRequest
): Promise<{ success: boolean; response?: string; error?: string; tokenUsage?: TokenUsage }> {
  const apiKey = request.config.apiKey
  const baseUrl = request.config.baseUrl || DEFAULT_BASE_URLS.gemini

  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required for Gemini',
    }
  }

  try {
    console.info(`[Gemini] Sending request to ${baseUrl} for model ${request.modelId}`)

    // Build request body with proper system instruction support
    // Reference: https://ai.google.dev/gemini-api/docs/text-generation
    // system_instruction.parts is an array of Part objects
    const requestBody: {
      contents: Array<{ parts: Array<{ text: string }> }>
      systemInstruction?: { parts: Array<{ text: string }> }
    } = {
      contents: [
        {
          parts: [{ text: request.userPrompt }],
        },
      ],
    }

    // Add system instruction if provided
    if (request.systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: request.systemPrompt }],
      }
      console.debug(`[Gemini] Using system instruction: ${request.systemPrompt.substring(0, 50)}...`)
    }

    // Use x-goog-api-key header instead of URL parameter for better security
    // Reference: https://ai.google.dev/gemini-api/docs/api-key
    const response = await fetch(
      `${baseUrl}/models/${request.modelId}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      return {
        success: false,
        error: 'No response content received from Gemini',
      }
    }

    console.debug(`[Gemini] Received response: ${content.substring(0, 100)}...`)

    // Extract token usage (Gemini format)
    const tokenUsage = data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
          cachedTokens: data.usageMetadata.cachedContentTokenCount,
        }
      : undefined

    return {
      success: true,
      response: content,
      tokenUsage,
    }
  } catch (error) {
    console.error('[Gemini Comparison] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
