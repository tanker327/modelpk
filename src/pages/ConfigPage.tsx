import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModelTag } from '@/components/config/ModelTag'
import { ModelTypeahead } from '@/components/config/ModelTypeahead'
import { providerConfigsActions } from '@/state/atoms/providerConfigsAtom'
import type { ProviderConfig, TestResult, ProviderId } from '@/schemas/providerConfigSchema'
import { DEFAULT_BASE_URLS, DEFAULT_PROVIDERS } from '@/schemas/providerConfigSchema'
import { testOpenAIConnection } from '@/services/providers/openaiProvider'
import { testGeminiConnection } from '@/services/providers/geminiProvider'
import { testAnthropicConnection } from '@/services/providers/anthropicProvider'
import { testXAIConnection } from '@/services/providers/xaiProvider'
import { testOllamaConnection } from '@/services/providers/ollamaProvider'
import { testOpenRouterConnection } from '@/services/providers/openrouterProvider'

interface TestResultsState {
  results: Record<ProviderId, TestResult>
}

export default function ConfigPage() {
  // Use local state for configs instead of atom (simpler for now)
  const [configs, setConfigs] = useState<ProviderConfig[]>(
    DEFAULT_PROVIDERS.map((p) => ({ ...p, config: { selectedModels: [] } }))
  )
  const [testResults, setTestResults] = useState<TestResultsState>({
    results: {
      openai: { providerId: 'openai', status: 'idle' },
      gemini: { providerId: 'gemini', status: 'idle' },
      anthropic: { providerId: 'anthropic', status: 'idle' },
      xai: { providerId: 'xai', status: 'idle' },
      ollama: { providerId: 'ollama', status: 'idle' },
      openrouter: { providerId: 'openrouter', status: 'idle' },
    },
  })
  const [loading, setLoading] = useState(true)

  // Load saved configs on mount
  useEffect(() => {
    const loadConfigs = async () => {
      await providerConfigsActions.init()
      // Get the loaded configs (either from IndexedDB or defaults)
      const loadedConfigs = providerConfigsActions.getConfigs()
      setConfigs(loadedConfigs)
      setLoading(false)
    }
    loadConfigs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading configurations...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Configuration</h1>
            <p className="text-gray-600">Configure your LLM API providers to start racing models</p>
          </div>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {configs.map((config) => (
            <ProviderCard
              key={config.id}
              config={config}
              testResult={testResults.results[config.id]}
              onTestUpdate={(result: TestResult) => {
                setTestResults((prev: TestResultsState) => ({
                  results: {
                    ...prev.results,
                    [config.id]: result,
                  },
                }))
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ProviderCardProps {
  config: ProviderConfig
  testResult: TestResult
  onTestUpdate: (result: TestResult) => void
}

function ProviderCard({ config, testResult, onTestUpdate }: ProviderCardProps) {
  const [apiKey, setApiKey] = useState(config.config.apiKey || '')
  const [endpoint, setEndpoint] = useState(
    config.config.endpoint || config.config.baseUrl || DEFAULT_BASE_URLS[config.id]
  )
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [selectedModels, setSelectedModels] = useState<string[]>(
    config.config.selectedModels || []
  )

  const needsApiKey = config.id !== 'ollama'
  const needsEndpoint = config.id === 'ollama'

  // Sync selectedModels when config changes (on page load/refresh)
  useEffect(() => {
    setSelectedModels(config.config.selectedModels || [])
  }, [config.config.selectedModels])

  const handleModelToggle = async (modelName: string) => {
    const newSelectedModels = selectedModels.includes(modelName)
      ? selectedModels.filter((m) => m !== modelName)
      : [...selectedModels, modelName]

    setSelectedModels(newSelectedModels)

    // Save to IndexedDB immediately
    await providerConfigsActions.updateConfig(config.id, {
      config: {
        selectedModels: newSelectedModels,
      },
    })
  }

  const handleSave = async () => {
    const updates: Partial<ProviderConfig> = {
      config: {
        selectedModels,
        ...(needsApiKey && { apiKey }),
        ...(needsEndpoint ? { endpoint } : { baseUrl: endpoint }),
      },
    }

    await providerConfigsActions.updateConfig(config.id, updates)
  }

  const handleTest = async () => {
    if (testing) return

    setTesting(true)
    onTestUpdate({ providerId: config.id, status: 'testing' })

    try {
      const testConfig: ProviderConfig = {
        ...config,
        config: {
          selectedModels,
          ...(needsApiKey && { apiKey }),
          ...(needsEndpoint ? { endpoint } : { baseUrl: endpoint }),
        },
      }

      let result
      switch (config.id) {
        case 'openai':
          result = await testOpenAIConnection(testConfig)
          break
        case 'gemini':
          result = await testGeminiConnection(testConfig)
          break
        case 'anthropic':
          result = await testAnthropicConnection(testConfig)
          break
        case 'xai':
          result = await testXAIConnection(testConfig)
          break
        case 'ollama':
          result = await testOllamaConnection(testConfig)
          break
        case 'openrouter':
          result = await testOpenRouterConnection(testConfig)
          break
        default:
          result = { success: false, error: 'Unknown provider' }
      }

      if (result.success) {
        onTestUpdate({
          providerId: config.id,
          status: 'success',
          models: result.models || [],
          testedAt: new Date(),
        })
      } else {
        onTestUpdate({
          providerId: config.id,
          status: 'error',
          error: result.error || 'Unknown error',
          testedAt: new Date(),
        })
      }
    } catch (error) {
      onTestUpdate({
        providerId: config.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        testedAt: new Date(),
      })
    } finally {
      setTesting(false)
    }
  }

  const canTest = needsApiKey ? apiKey.length > 0 : endpoint.length > 0

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{config.name}</h2>
        <Button
          onClick={handleTest}
          disabled={!canTest || testing}
          size="sm"
          variant={testResult?.status === 'success' ? 'default' : 'outline'}
        >
          {testing ? 'Testing...' : testResult?.status === 'success' ? 'Retest' : 'Test'}
        </Button>
      </div>

      <div className="space-y-4">
        {needsApiKey && (
          <div className="space-y-2">
            <Label htmlFor={`${config.id}-api-key`}>API Key</Label>
            <div className="flex gap-2">
              <Input
                id={`${config.id}-api-key`}
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={handleSave}
                placeholder="Enter API key"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => setShowKey(!showKey)}
                variant="outline"
                size="sm"
              >
                {showKey ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`${config.id}-endpoint`}>
            {needsEndpoint ? 'Endpoint URL' : 'Base URL (optional)'}
          </Label>
          <Input
            id={`${config.id}-endpoint`}
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            onBlur={handleSave}
            placeholder={DEFAULT_BASE_URLS[config.id]}
          />
        </div>

        {/* Show selected models even when no test has been run */}
        {selectedModels.length > 0 && (!testResult || testResult.status === 'idle') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">
              Selected models ({selectedModels.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedModels.map((model: string) => (
                <ModelTag
                  key={model}
                  modelName={model}
                  isSelected={true}
                  onToggle={() => handleModelToggle(model)}
                />
              ))}
            </div>
          </div>
        )}

        {testResult && testResult.status !== 'idle' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {testResult.status === 'testing' && (
              <div className="text-blue-600">Testing connection...</div>
            )}

            {testResult.status === 'success' && (
              <div>
                <div className="text-green-600 font-medium mb-2">
                  ✓ Connected - {testResult.models?.length || 0} models available
                </div>
                {testResult.models && testResult.models.length > 0 && (
                  <div className="mt-2">
                    {config.id === 'openrouter' ? (
                      // Use typeahead for OpenRouter (too many models)
                      <ModelTypeahead
                        availableModels={testResult.models}
                        selectedModels={selectedModels}
                        onModelToggle={handleModelToggle}
                        placeholder="Type to search OpenRouter models..."
                      />
                    ) : (
                      // Use tag list for other providers
                      <>
                        <div className="text-sm text-gray-600 mb-1">
                          Available models (click to select for racing):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {testResult.models.map((model: string) => (
                            <ModelTag
                              key={model}
                              modelName={model}
                              isSelected={selectedModels.includes(model)}
                              onToggle={() => handleModelToggle(model)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {testResult.testedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Tested {new Date(testResult.testedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {testResult.status === 'error' && (
              <div className="text-red-600">
                <div className="font-medium">✗ Connection failed</div>
                <div className="text-sm mt-1">{testResult.error}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
