import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ResponsePanel } from '@/components/comparison/ResponsePanel'
import { providerConfigsActions } from '@/state/atoms/providerConfigsAtom'
import type { ProviderConfig, ProviderId } from '@/schemas/providerConfigSchema'
import type { ComparisonResponse } from '@/schemas/comparisonSchema'
import { sendComparisonRequest } from '@/services/api/comparisonService'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface ProviderSelection {
  providerId: ProviderId
  modelIds: string[]
}

export default function ComparisonPage() {
  const [configs, setConfigs] = useState<ProviderConfig[]>([])
  const [loading, setLoading] = useState(true)

  // Form state - cached in localStorage
  const [testName, setTestName] = useLocalStorage('airacers-testName', '')
  const [systemPrompt, setSystemPrompt] = useLocalStorage('airacers-systemPrompt', 'You are a helpful assistant.')
  const [userPrompt, setUserPrompt] = useLocalStorage('airacers-userPrompt', '')

  // Selection state - cached in localStorage
  const [providerSelections, setProviderSelections] = useLocalStorage<ProviderSelection[]>('airacers-providerSelections', [])
  const [isSelectionExpanded, setIsSelectionExpanded] = useLocalStorage('airacers-isSelectionExpanded', true)
  const [isPromptsExpanded, setIsPromptsExpanded] = useLocalStorage('airacers-isPromptsExpanded', true)

  // Response state - cached in localStorage
  const [responses, setResponses] = useLocalStorage<Record<string, ComparisonResponse>>('airacers-responses', {})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load configs on mount
  useEffect(() => {
    const loadConfigs = async () => {
      await providerConfigsActions.init()
      const loadedConfigs = providerConfigsActions.getConfigs()
      // Filter to only providers with API keys
      const configuredProviders = loadedConfigs.filter((c) =>
        c.id === 'ollama' ? !!c.config.endpoint : !!c.config.apiKey
      )
      setConfigs(configuredProviders)
      setLoading(false)
    }
    loadConfigs()
  }, [])

  const handleModelToggle = (providerId: ProviderId, modelId: string) => {
    setProviderSelections((prev) => {
      const existingSelection = prev.find((s) => s.providerId === providerId)

      if (existingSelection) {
        // Provider already exists in selections
        const hasModel = existingSelection.modelIds.includes(modelId)
        const newModelIds = hasModel
          ? existingSelection.modelIds.filter((m) => m !== modelId)
          : [...existingSelection.modelIds, modelId]

        // When adding a model (not removing), check if results exist
        // If so, create a pending result box for the new model
        if (!hasModel && Object.keys(responses).length > 0) {
          const key = `${providerId}-${modelId}`
          setResponses((prevResponses) => ({
            ...prevResponses,
            [key]: {
              providerId,
              modelId,
              status: 'pending',
            },
          }))
          console.info(`[ComparisonPage] Added pending result for ${key}`)
        }

        // When removing a model, remove its result box
        if (hasModel) {
          const key = `${providerId}-${modelId}`
          setResponses((prevResponses) => {
            const newResponses = { ...prevResponses }
            delete newResponses[key]
            return newResponses
          })
          console.info(`[ComparisonPage] Removed result for ${key}`)
        }

        // If no models left, remove the provider selection entirely
        if (newModelIds.length === 0) {
          return prev.filter((s) => s.providerId !== providerId)
        }

        // Update the provider's model list
        return prev.map((selection) =>
          selection.providerId === providerId
            ? { ...selection, modelIds: newModelIds }
            : selection
        )
      } else {
        // Provider doesn't exist, add it with this model
        const key = `${providerId}-${modelId}`

        // If results exist, create a pending result box
        if (Object.keys(responses).length > 0) {
          setResponses((prevResponses) => ({
            ...prevResponses,
            [key]: {
              providerId,
              modelId,
              status: 'pending',
            },
          }))
          console.info(`[ComparisonPage] Added pending result for ${key}`)
        }

        return [...prev, { providerId, modelIds: [modelId] }]
      }
    })
  }

  const handleReset = () => {
    setTestName('')
    setSystemPrompt('You are a helpful assistant.')
    setUserPrompt('')
    setIsPromptsExpanded(true)
    setResponses({})
  }

  const handleRefresh = async (providerId: ProviderId, modelId: string) => {
    const key = `${providerId}-${modelId}`
    const config = configs.find((c) => c.id === providerId)

    if (!config) {
      console.error('Config not found for refresh')
      return
    }

    // Set to loading state
    setResponses((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: 'loading',
        startTime: performance.now(),
      },
    }))

    try {
      const result = await sendComparisonRequest({
        providerId,
        modelId,
        systemPrompt: systemPrompt || undefined,
        userPrompt,
        config: config.config,
      })

      setResponses((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: result.success ? 'success' : 'error',
          response: result.response,
          error: result.error,
          endTime: performance.now(),
          durationMs: result.durationMs,
          tokenUsage: result.tokenUsage,
        },
      }))
    } catch (error) {
      setResponses((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          endTime: performance.now(),
        },
      }))
    }
  }

  const handleSubmit = async () => {
    if (!userPrompt.trim()) {
      alert('User prompt is required')
      return
    }

    // Get all selected combinations
    const combinations: Array<{ providerId: ProviderId; modelId: string }> = []
    providerSelections.forEach((selection) => {
      selection.modelIds.forEach((modelId) => {
        combinations.push({ providerId: selection.providerId, modelId })
      })
    })

    if (combinations.length === 0) {
      alert('Please select at least one model')
      return
    }

    // Collapse both sections when submitting
    setIsSelectionExpanded(false)
    setIsPromptsExpanded(false)
    setIsSubmitting(true)

    // Initialize responses
    const initialResponses: Record<string, ComparisonResponse> = {}
    combinations.forEach(({ providerId, modelId }) => {
      const key = `${providerId}-${modelId}`
      initialResponses[key] = {
        providerId,
        modelId,
        status: 'loading',
        startTime: performance.now(),
      }
    })
    setResponses(initialResponses)

    // Send all requests in parallel
    const promises = combinations.map(async ({ providerId, modelId }) => {
      const key = `${providerId}-${modelId}`
      const config = configs.find((c) => c.id === providerId)

      if (!config) {
        setResponses((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: 'error',
            error: 'Provider configuration not found',
            endTime: performance.now(),
          },
        }))
        return
      }

      try {
        const result = await sendComparisonRequest({
          providerId,
          modelId,
          systemPrompt: systemPrompt || undefined,
          userPrompt,
          config: config.config,
        })

        setResponses((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: result.success ? 'success' : 'error',
            response: result.response,
            error: result.error,
            endTime: performance.now(),
            durationMs: result.durationMs,
            tokenUsage: result.tokenUsage,
          },
        }))
      } catch (error) {
        setResponses((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            endTime: performance.now(),
          },
        }))
      }
    })

    await Promise.all(promises)
    setIsSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (configs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">No Providers Configured</h2>
          <p className="text-gray-600">
            Please configure at least one provider before creating comparisons
          </p>
          <Link to="/config">
            <Button>Configure Providers</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Racers</h1>
          <Link to="/config">
            <Button variant="outline">Configure Providers</Button>
          </Link>
        </div>

        {/* Provider Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <button
            onClick={() => setIsSelectionExpanded(!isSelectionExpanded)}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <h2 className="text-lg font-semibold">Select Providers & Models</h2>
            <span className="text-gray-500 text-sm">
              {isSelectionExpanded ? '▼' : '▶'}
            </span>
          </button>

          {/* Collapsed view - show selected items */}
          {!isSelectionExpanded && (
            <div className="space-y-2">
              {providerSelections.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No selections yet</p>
              ) : (
                providerSelections.map((selection) => {
                  const config = configs.find((c) => c.id === selection.providerId)
                  if (!config || selection.modelIds.length === 0) return null
                  return (
                    <div key={selection.providerId} className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-gray-700 min-w-[80px]">
                        {config.name}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selection.modelIds.map((modelId) => (
                          <span
                            key={modelId}
                            className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                          >
                            {modelId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Expanded view - full selection UI */}
          {isSelectionExpanded && (
            <div className="space-y-2">
              {configs.map((config) => {
                const selection = providerSelections.find((s) => s.providerId === config.id)
                const availableModels = config.config.selectedModels || []

                return (
                  <div key={config.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                    <div className="font-medium text-sm min-w-[120px] flex-shrink-0">{config.name}</div>
                    <div className="flex-1 min-w-0">
                      {availableModels.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          No models. <Link to="/config" className="text-blue-500 underline">Configure</Link>
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {availableModels.map((model) => (
                            <button
                              key={model}
                              onClick={() => handleModelToggle(config.id, model)}
                              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                                selection?.modelIds.includes(model)
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <button
            onClick={() => setIsPromptsExpanded(!isPromptsExpanded)}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Prompts</h2>
              {!isPromptsExpanded && Object.keys(responses).length > 0 && (() => {
                const responseValues = Object.values(responses)
                const allCompleted = responseValues.every(r => r.status === 'success' || r.status === 'error')
                const hasErrors = responseValues.some(r => r.status === 'error')
                const allSuccess = allCompleted && !hasErrors

                if (isSubmitting) {
                  return (
                    <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></span>
                      Running...
                    </span>
                  )
                } else if (allSuccess) {
                  return (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <span className="text-base">✓</span>
                      Completed
                    </span>
                  )
                } else if (hasErrors) {
                  return (
                    <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                      <span className="text-base">⚠</span>
                      Failed
                    </span>
                  )
                }
                return null
              })()}
            </div>
            <span className="text-gray-500 text-sm">
              {isPromptsExpanded ? '▼' : '▶'}
            </span>
          </button>

          {/* Collapsed view - show prompts summary */}
          {!isPromptsExpanded && (
            <div className="space-y-2 text-sm">
              {testName && (
                <div>
                  <span className="font-semibold text-gray-700">Test:</span>{' '}
                  <span className="text-gray-600">{testName}</span>
                </div>
              )}
              {systemPrompt && (
                <div>
                  <span className="font-semibold text-gray-700">System:</span>{' '}
                  <span className="text-gray-600">
                    {systemPrompt.length > 100 ? `${systemPrompt.slice(0, 100)}...` : systemPrompt}
                  </span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">User:</span>{' '}
                <span className="text-gray-600">
                  {userPrompt.length > 100 ? `${userPrompt.slice(0, 100)}...` : userPrompt || <em className="text-gray-400">Not set</em>}
                </span>
              </div>
            </div>
          )}

          {/* Expanded view - full prompt inputs */}
          {isPromptsExpanded && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="testName">Test Name (optional)</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Creative Writing Test"
                />
              </div>

              <div>
                <Label htmlFor="systemPrompt">System Prompt (optional)</Label>
                <textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="e.g., You are a helpful assistant..."
                  className="w-full px-3 py-2 border border-input rounded-md min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="userPrompt">User Prompt (required)</Label>
                <textarea
                  id="userPrompt"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g., Write a short poem about AI..."
                  className="w-full px-3 py-2 border border-input rounded-md min-h-[120px]"
                />
              </div>

              {/* Actions - inside expanded view */}
              <div className="flex gap-4 pt-2">
                <Button onClick={handleReset} variant="outline" disabled={isSubmitting}>
                  Reset
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !userPrompt.trim() ||
                    !providerSelections.some(s => s.modelIds.length > 0)
                  }
                >
                  {isSubmitting ? 'Running...' : 'Submit'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {Object.keys(responses).length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div
              className={`grid gap-4 ${
                Object.keys(responses).length === 1
                  ? 'grid-cols-1'
                  : Object.keys(responses).length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {(() => {
                // Calculate min/max durations from successful responses
                const successfulDurations = Object.values(responses)
                  .filter((r) => r.status === 'success' && r.durationMs !== undefined)
                  .map((r) => r.durationMs!)

                const minDuration = successfulDurations.length > 0 ? Math.min(...successfulDurations) : undefined
                const maxDuration = successfulDurations.length > 0 ? Math.max(...successfulDurations) : undefined
                const hasMultipleSuccesses = successfulDurations.length > 1

                return Object.entries(responses).map(([key, response]) => {
                  const config = configs.find((c) => c.id === response.providerId)
                  const isFastest = hasMultipleSuccesses &&
                                   response.status === 'success' &&
                                   response.durationMs !== undefined &&
                                   response.durationMs === minDuration
                  const isSlowest = hasMultipleSuccesses &&
                                   response.status === 'success' &&
                                   response.durationMs !== undefined &&
                                   response.durationMs === maxDuration &&
                                   minDuration !== maxDuration // Don't mark as slowest if all have same duration

                  return (
                    <ResponsePanel
                      key={key}
                      providerName={config?.name || response.providerId}
                      modelName={response.modelId}
                      status={response.status}
                      response={response.response}
                      error={response.error}
                      durationMs={response.durationMs}
                      tokenUsage={response.tokenUsage}
                      isFastest={isFastest}
                      isSlowest={isSlowest}
                      onRefresh={() => handleRefresh(response.providerId, response.modelId)}
                    />
                  )
                })
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
