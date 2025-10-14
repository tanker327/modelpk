import type { ProviderConfig } from '@/schemas/providerConfigSchema'

export interface TestConnectionResult {
  success: boolean
  models?: string[]
  error?: string
}

export interface ProviderTester {
  testConnection(config: ProviderConfig): Promise<TestConnectionResult>
}

/**
 * Mask an API key for display purposes
 * Shows only the last 4-6 characters
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 6) {
    return '****'
  }

  const visibleChars = Math.min(6, Math.floor(apiKey.length / 4))
  const lastChars = apiKey.slice(-visibleChars)
  const masked = '*'.repeat(Math.max(12, apiKey.length - visibleChars))

  return `${masked}${lastChars}`
}

/**
 * Debounce helper to prevent rapid API calls
 */
export function createDebouncer(delayMs: number = 1000) {
  let lastCallTime = 0

  return {
    canProceed: (): boolean => {
      const now = Date.now()
      if (now - lastCallTime < delayMs) {
        return false
      }
      lastCallTime = now
      return true
    },
    reset: (): void => {
      lastCallTime = 0
    },
  }
}

/**
 * Parse common HTTP error responses
 */
export function parseHttpError(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return 'Network error: Unable to connect. Check your internet connection.'
  }

  if (error instanceof Error) {
    // CORS error
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      return 'CORS error: The API does not allow requests from this origin. For local Ollama, ensure CORS is configured.'
    }

    return error.message
  }

  return 'Unknown error occurred'
}

/**
 * Parse API error response body
 */
export async function parseApiErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const data = await response.json()

      // Common error message fields across different APIs
      const errorMessage =
        data.error?.message ||
        data.error?.error ||
        data.error ||
        data.message ||
        data.detail ||
        'Unknown API error'

      return typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage)
    }

    // Try to get text response
    const text = await response.text()
    return text || `HTTP ${response.status}: ${response.statusText}`
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`
  }
}

/**
 * Handle rate limit errors
 */
export function handleRateLimitError(response: Response, errorMessage: string): string {
  const retryAfter = response.headers.get('retry-after')

  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10)
    if (!isNaN(seconds)) {
      return `Rate limit exceeded. Please wait ${seconds} seconds before retrying.`
    }
  }

  return `Rate limit exceeded. ${errorMessage} Please wait before retrying.`
}
