import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ResponsePanel } from '@/components/comparison/ResponsePanel'
import { providerConfigsActions } from '@/state/atoms/providerConfigsAtom'
import type { ProviderConfig, ProviderId } from '@/schemas/providerConfigSchema'
import type { ComparisonResponse, AdvancedParameters } from '@/schemas/comparisonSchema'
import { sendComparisonRequest } from '@/services/api/comparisonService'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAlert } from '@/components/ui/alert-dialog'
import { calculateCost } from '@/services/pricing/pricingService'
import { MdRefresh, MdInfoOutline, MdClose, MdSend } from 'react-icons/md'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProviderSelection {
  providerId: ProviderId
  modelIds: string[]
}

// Parameter info data
const PARAMETER_INFO: Record<string, { title: string; description: string }> = {
  temperature: {
    title: 'Temperature',
    description: 'Controls randomness in the output. Lower values (0.0-0.5) make responses more focused and deterministic. Higher values (1.0-2.0) make responses more creative and varied. Default is usually 1.0.',
  },
  maxTokens: {
    title: 'Max Tokens',
    description: 'The maximum number of tokens (words/pieces) the model can generate in its response. Each model has its own maximum limit. Setting this helps control response length and costs.',
  },
  topP: {
    title: 'Top P (Nucleus Sampling)',
    description: 'An alternative to temperature. The model considers only the smallest set of tokens whose cumulative probability is at least P. Lower values (0.1-0.5) make output more focused, higher values (0.9-1.0) allow more diversity. Default is 1.0.',
  },
  topK: {
    title: 'Top K',
    description: 'Limits the model to consider only the K most likely next tokens at each step. Lower values make output more focused and predictable. Not all models support this parameter.',
  },
  frequencyPenalty: {
    title: 'Frequency Penalty',
    description: 'Reduces the likelihood of repeating tokens based on their frequency in the text so far. Positive values (0.1-2.0) discourage repetition. Negative values encourage it. Range: -2.0 to 2.0, default is 0.',
  },
  presencePenalty: {
    title: 'Presence Penalty',
    description: 'Reduces the likelihood of repeating any token that has appeared in the text so far, regardless of frequency. Positive values encourage the model to talk about new topics. Range: -2.0 to 2.0, default is 0.',
  },
  stopSequences: {
    title: 'Stop Sequences',
    description: 'Custom strings that will cause the model to stop generating when encountered. Useful for structured outputs or controlling response format. For example: "###", "END", "STOP".',
  },
}

export default function ComparisonPage() {
  const [configs, setConfigs] = useState<ProviderConfig[]>([])
  const [loading, setLoading] = useState(true)

  // Alert hook
  const { showAlert, AlertComponent } = useAlert()

  // Info dialog state
  const [infoDialog, setInfoDialog] = useState<{ open: boolean; paramKey: string }>({
    open: false,
    paramKey: '',
  })

  // Form state - cached in localStorage
  const [testName, setTestName] = useLocalStorage('airacers-testName', '')
  const [systemPrompt, setSystemPrompt] = useLocalStorage('airacers-systemPrompt', 'You are a helpful assistant.')
  const [userPrompt, setUserPrompt] = useLocalStorage('airacers-userPrompt', '')

  // Advanced parameters state - cached in localStorage
  const [advancedParams, setAdvancedParams] = useLocalStorage<AdvancedParameters>('airacers-advancedParams', {})
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useLocalStorage('airacers-isAdvancedExpanded', false)

  // Selection state - cached in localStorage
  const [providerSelections, setProviderSelections] = useLocalStorage<ProviderSelection[]>('airacers-providerSelections', [])
  const [isSelectionExpanded, setIsSelectionExpanded] = useLocalStorage('airacers-isSelectionExpanded', true)
  const [isPromptsExpanded, setIsPromptsExpanded] = useLocalStorage('airacers-isPromptsExpanded', true)

  // Response state - cached in localStorage
  const [responses, setResponses] = useLocalStorage<Record<string, ComparisonResponse>>('airacers-responses', {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThinking, setShowThinking] = useState(false) // Global toggle for thinking vs output

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
    setAdvancedParams({})
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
        advancedParameters: Object.keys(advancedParams).length > 0 ? advancedParams : undefined,
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
      showAlert('User Prompt Required', 'Please enter a user prompt before submitting.')
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
      showAlert('Model Selection Required', 'Please select at least one model before submitting.')
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
          advancedParameters: Object.keys(advancedParams).length > 0 ? advancedParams : undefined,
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
      <>
        <AlertComponent />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Welcome Header */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold text-gray-900">Welcome to AI Racers!</h1>
              <p className="text-lg text-gray-600">
                Compare multiple AI models side-by-side and see which one performs best for your needs
              </p>
            </div>

            {/* Getting Started Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Getting Started</h2>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">1.</span>
                  <span>Configure at least one AI provider (OpenAI, Gemini, Anthropic, xAI, Ollama, or OpenRouter)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">2.</span>
                  <span>Add your API keys and select which models you want to compare</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">3.</span>
                  <span>Start racing! Submit your prompts and compare responses in real-time</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/config" className="flex-1">
                <Button className="w-full" size="lg">
                  Configure Providers
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.json'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (!file) return

                    try {
                      console.info('[ComparisonPage] Importing configuration file...')
                      const text = await file.text()
                      const data = JSON.parse(text)

                      // Check if the data has the expected format
                      if (!data.configs || !Array.isArray(data.configs)) {
                        throw new Error('Invalid configuration file format. Expected a configs array.')
                      }

                      console.info(`[ComparisonPage] Found ${data.configs.length} configurations to import`)

                      // Import configs using the actions
                      for (const config of data.configs) {
                        console.info(`[ComparisonPage] Importing config for ${config.id}`)
                        await providerConfigsActions.updateConfig(config.id, config)
                      }

                      console.info('[ComparisonPage] Import completed successfully')
                      showAlert(
                        'Import Successful',
                        `Successfully imported ${data.configs.length} configurations!\n\nThe page will now reload.`
                      )

                      // Reload the page after a short delay to show the alert
                      setTimeout(() => {
                        window.location.reload()
                      }, 2000)
                    } catch (error) {
                      console.error('[ComparisonPage] Failed to import configuration:', error)
                      showAlert(
                        'Import Failed',
                        `Failed to import configuration:\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
                        'destructive'
                      )
                    }
                  }
                  input.click()
                }}
              >
                Import Configuration
              </Button>
            </div>

            {/* Quick Tips */}
            <div className="text-sm text-gray-500 space-y-2 pt-4 border-t border-gray-200">
              <p className="font-semibold text-gray-700">Quick Tips:</p>
              <ul className="space-y-1 list-disc list-inside pl-2">
                <li>You can export/import configurations from the Config page to backup or share settings</li>
                <li>Ollama is great for running models locally without API costs</li>
                <li>OpenRouter provides access to many models with a single API key</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </>
    )
  }

  // Helper component for info icons
  const InfoIcon = ({ paramKey }: { paramKey: string }) => (
    <button
      type="button"
      onClick={() => setInfoDialog({ open: true, paramKey })}
      className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      aria-label={`Info about ${paramKey}`}
    >
      <MdInfoOutline size={16} />
    </button>
  )

  return (
    <>
      <AlertComponent />

      {/* Info Dialog */}
      <Dialog open={infoDialog.open} onOpenChange={(open) => setInfoDialog({ ...infoDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{PARAMETER_INFO[infoDialog.paramKey]?.title || 'Parameter Info'}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              {PARAMETER_INFO[infoDialog.paramKey]?.description || 'No information available.'}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Racers</h1>
          <div className="flex gap-2">
            <Link to="/pricing">
              <Button variant="outline">View Pricing</Button>
            </Link>
            <Link to="/config">
              <Button variant="outline">Configure Providers</Button>
            </Link>
          </div>
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

              {/* Advanced Parameters Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                  >
                    <span className="text-gray-500 text-xs">{isAdvancedExpanded ? '▼' : '▶'}</span>
                    Advanced Parameters (optional)
                  </button>
                  {isAdvancedExpanded && (
                    <button
                      type="button"
                      onClick={() => setAdvancedParams({})}
                      className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      aria-label="Reset advanced parameters"
                      title="Reset advanced parameters"
                    >
                      <MdRefresh size={18} />
                    </button>
                  )}
                </div>

                {isAdvancedExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gray-50 p-6 rounded-lg">
                    {/* Temperature */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor="temperature" className="text-sm font-medium">
                            Temperature
                          </Label>
                          <InfoIcon paramKey="temperature" />
                        </div>
                        <span className="text-sm text-gray-700 font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                          {advancedParams.temperature?.toFixed(2) ?? '1.00'}
                        </span>
                      </div>
                      <Slider
                        id="temperature"
                        min={0}
                        max={2}
                        step={0.01}
                        value={[advancedParams.temperature ?? 1.0]}
                        onValueChange={(values) =>
                          setAdvancedParams({
                            ...advancedParams,
                            temperature: values[0],
                          })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Controls randomness. Higher = more creative.
                      </p>
                    </div>

                    {/* Max Tokens */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="maxTokens" className="text-sm font-medium">
                          Max Tokens
                        </Label>
                        <InfoIcon paramKey="maxTokens" />
                      </div>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="1"
                        value={advancedParams.maxTokens ?? ''}
                        onChange={(e) =>
                          setAdvancedParams({
                            ...advancedParams,
                            maxTokens: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 2000"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Maximum length of response.
                      </p>
                    </div>

                    {/* Top P */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor="topP" className="text-sm font-medium">
                            Top P
                          </Label>
                          <InfoIcon paramKey="topP" />
                        </div>
                        <span className="text-sm text-gray-700 font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                          {advancedParams.topP?.toFixed(2) ?? '1.00'}
                        </span>
                      </div>
                      <Slider
                        id="topP"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[advancedParams.topP ?? 1.0]}
                        onValueChange={(values) =>
                          setAdvancedParams({
                            ...advancedParams,
                            topP: values[0],
                          })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Nucleus sampling threshold.
                      </p>
                    </div>

                    {/* Top K */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="topK" className="text-sm font-medium">
                          Top K
                        </Label>
                        <InfoIcon paramKey="topK" />
                      </div>
                      <Input
                        id="topK"
                        type="number"
                        min="0"
                        value={advancedParams.topK ?? ''}
                        onChange={(e) =>
                          setAdvancedParams({
                            ...advancedParams,
                            topK: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        placeholder="e.g., 40"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Consider only top K tokens.
                      </p>
                    </div>

                    {/* Frequency Penalty */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor="frequencyPenalty" className="text-sm font-medium">
                            Frequency Penalty
                          </Label>
                          <InfoIcon paramKey="frequencyPenalty" />
                        </div>
                        <span className="text-sm text-gray-700 font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                          {advancedParams.frequencyPenalty?.toFixed(2) ?? '0.00'}
                        </span>
                      </div>
                      <Slider
                        id="frequencyPenalty"
                        min={-2}
                        max={2}
                        step={0.01}
                        value={[advancedParams.frequencyPenalty ?? 0]}
                        onValueChange={(values) =>
                          setAdvancedParams({
                            ...advancedParams,
                            frequencyPenalty: values[0],
                          })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Reduces repetition of tokens. Range: -2 to 2
                      </p>
                    </div>

                    {/* Presence Penalty */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Label htmlFor="presencePenalty" className="text-sm font-medium">
                            Presence Penalty
                          </Label>
                          <InfoIcon paramKey="presencePenalty" />
                        </div>
                        <span className="text-sm text-gray-700 font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                          {advancedParams.presencePenalty?.toFixed(2) ?? '0.00'}
                        </span>
                      </div>
                      <Slider
                        id="presencePenalty"
                        min={-2}
                        max={2}
                        step={0.01}
                        value={[advancedParams.presencePenalty ?? 0]}
                        onValueChange={(values) =>
                          setAdvancedParams({
                            ...advancedParams,
                            presencePenalty: values[0],
                          })
                        }
                      />
                      <p className="text-xs text-gray-500">
                        Encourages new topics. Range: -2 to 2
                      </p>
                    </div>

                    {/* Stop Sequences - Full width */}
                    <div className="md:col-span-2 space-y-4 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="stopSequences" className="text-sm font-medium">
                          Stop Sequences (comma-separated)
                        </Label>
                        <InfoIcon paramKey="stopSequences" />
                      </div>
                      <Input
                        id="stopSequences"
                        type="text"
                        value={advancedParams.stopSequences?.join(', ') ?? ''}
                        onChange={(e) =>
                          setAdvancedParams({
                            ...advancedParams,
                            stopSequences: e.target.value
                              ? e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                              : undefined,
                          })
                        }
                        placeholder="e.g., ###, END, STOP"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Sequences where the model will stop generating.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions - inside expanded view */}
              <div className="flex gap-4 pt-2 justify-end">
                <Button onClick={handleReset} variant="outline" disabled={isSubmitting}>
                  <MdClose className="mr-1.5" size={18} />
                  Reset
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={
                    isSubmitting ||
                    !userPrompt.trim() ||
                    !providerSelections.some(s => s.modelIds.length > 0)
                  }
                >
                  <MdSend className="mr-1.5" size={18} />
                  {isSubmitting ? 'Running...' : 'Submit'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {Object.keys(responses).length > 0 && (
          <div>
            {(() => {
              // Check if any response has thinking content
              const hasAnyThinking = Object.values(responses).some(r => {
                if (r.status !== 'success' || !r.response) return false
                const thinkingRegex = /<think>[\s\S]*?<\/think>|<\/think>/
                return thinkingRegex.test(r.response)
              })

              return (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Results</h2>
                  {hasAnyThinking && (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => setShowThinking(false)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          !showThinking
                            ? 'bg-white text-gray-900 shadow-sm font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Output
                      </button>
                      <button
                        onClick={() => setShowThinking(true)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          showThinking
                            ? 'bg-white text-gray-900 shadow-sm font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        💭 Thinking
                      </button>
                    </div>
                  )}
                </div>
              )
            })()}
            <div className="flex gap-4 overflow-x-auto pb-4">
              <style>{`
                .flex.gap-4.overflow-x-auto > * {
                  flex: 0 0 auto;
                  width: max(400px, calc((100vw - 8rem - 3rem) / ${Object.keys(responses).length}));
                  min-width: 400px;
                }
              `}</style>
              {(() => {
                // Calculate min/max durations from successful responses
                const successfulDurations = Object.values(responses)
                  .filter((r) => r.status === 'success' && r.durationMs !== undefined)
                  .map((r) => r.durationMs!)

                const minDuration = successfulDurations.length > 0 ? Math.min(...successfulDurations) : undefined
                const maxDuration = successfulDurations.length > 0 ? Math.max(...successfulDurations) : undefined
                const hasMultipleSuccesses = successfulDurations.length > 1

                // Calculate min/max costs from successful responses with token usage
                const successfulCosts = Object.values(responses)
                  .filter((r) => r.status === 'success' && r.tokenUsage)
                  .map((r) => {
                    const costEstimate = calculateCost(r.providerId, r.modelId, r.tokenUsage!)
                    return costEstimate?.totalCost
                  })
                  .filter((cost): cost is number => cost !== null && cost !== undefined && cost > 0)

                const minCost = successfulCosts.length > 0 ? Math.min(...successfulCosts) : undefined
                const maxCost = successfulCosts.length > 0 ? Math.max(...successfulCosts) : undefined
                const hasMultipleCosts = successfulCosts.length > 1

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

                  // Calculate cost for this response
                  let isCheapest = false
                  let isMostExpensive = false
                  if (response.status === 'success' && response.tokenUsage && hasMultipleCosts) {
                    const costEstimate = calculateCost(response.providerId, response.modelId, response.tokenUsage)
                    if (costEstimate && costEstimate.totalCost > 0) {
                      isCheapest = costEstimate.totalCost === minCost
                      isMostExpensive = costEstimate.totalCost === maxCost && minCost !== maxCost
                    }
                  }

                  return (
                    <ResponsePanel
                      key={key}
                      providerId={response.providerId}
                      providerName={config?.name || response.providerId}
                      modelName={response.modelId}
                      status={response.status}
                      response={response.response}
                      error={response.error}
                      durationMs={response.durationMs}
                      tokenUsage={response.tokenUsage}
                      isFastest={isFastest}
                      isSlowest={isSlowest}
                      isCheapest={isCheapest}
                      isMostExpensive={isMostExpensive}
                      showThinking={showThinking}
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
    </>
  )
}
