import { atom } from '@zedux/react'
import type { TestResult, ProviderId } from '@/schemas/providerConfigSchema'

// Cache TTL: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000

export interface TestResultsState {
  results: Record<ProviderId, TestResult>
}

// Create a simple state store outside the atom
let testResultsState: TestResultsState = {
  results: {
    openai: { providerId: 'openai', status: 'idle' },
    gemini: { providerId: 'gemini', status: 'idle' },
    anthropic: { providerId: 'anthropic', status: 'idle' },
    xai: { providerId: 'xai', status: 'idle' },
    ollama: { providerId: 'ollama', status: 'idle' },
    openrouter: { providerId: 'openrouter', status: 'idle' },
  },
}

// Atom that returns current state
export const testResultsAtom = atom('testResults', () => {
  return testResultsState
})

// Helper functions to update state
export const testResultsActions = {
  /**
   * Start a test for a provider
   */
  startTest: (providerId: ProviderId) => {
    testResultsState = {
      results: {
        ...testResultsState.results,
        [providerId]: {
          providerId,
          status: 'testing',
          models: undefined,
          error: undefined,
          testedAt: undefined,
        },
      },
    }
    console.info(`[testResults] Started test for ${providerId}`)
  },

  /**
   * Set test success result
   */
  setTestSuccess: (providerId: ProviderId, models: string[]) => {
    testResultsState = {
      results: {
        ...testResultsState.results,
        [providerId]: {
          providerId,
          status: 'success',
          models,
          error: undefined,
          testedAt: new Date(),
        },
      },
    }
    console.info(`[testResults] Test succeeded for ${providerId} with ${models.length} models`)
  },

  /**
   * Set test error result
   */
  setTestError: (providerId: ProviderId, error: string) => {
    testResultsState = {
      results: {
        ...testResultsState.results,
        [providerId]: {
          providerId,
          status: 'error',
          models: undefined,
          error,
          testedAt: new Date(),
        },
      },
    }
    console.error(`[testResults] Test failed for ${providerId}:`, error)
  },

  /**
   * Check if cached result is still valid
   */
  isCacheValid: (providerId: ProviderId): boolean => {
    const result = testResultsState.results[providerId]

    if (!result?.testedAt || result.status === 'idle' || result.status === 'testing') {
      return false
    }

    const now = new Date().getTime()
    const testedAt = new Date(result.testedAt).getTime()
    const age = now - testedAt

    return age < CACHE_TTL_MS
  },

  /**
   * Clear test result for a provider
   */
  clearTest: (providerId: ProviderId) => {
    testResultsState = {
      results: {
        ...testResultsState.results,
        [providerId]: {
          providerId,
          status: 'idle',
          models: undefined,
          error: undefined,
          testedAt: undefined,
        },
      },
    }
    console.info(`[testResults] Cleared test result for ${providerId}`)
  },

  /**
   * Clear all test results
   */
  clearAllTests: () => {
    testResultsState = {
      results: {
        openai: { providerId: 'openai', status: 'idle' },
        gemini: { providerId: 'gemini', status: 'idle' },
        anthropic: { providerId: 'anthropic', status: 'idle' },
        xai: { providerId: 'xai', status: 'idle' },
        ollama: { providerId: 'ollama', status: 'idle' },
        openrouter: { providerId: 'openrouter', status: 'idle' },
      },
    }
    console.info('[testResults] Cleared all test results')
  },
}
