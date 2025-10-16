import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModelTag } from '@/components/config/ModelTag'
import { ModelTypeahead } from '@/components/config/ModelTypeahead'
import { SecurityWarning } from '@/components/SecurityWarning'
import { providerConfigsActions } from '@/state/atoms/providerConfigsAtom'
import type { ProviderConfig, TestResult, ProviderId } from '@/schemas/providerConfigSchema'
import { DEFAULT_BASE_URLS, DEFAULT_PROVIDERS } from '@/schemas/providerConfigSchema'
import { testOpenAIConnection } from '@/services/providers/openaiProvider'
import { testGeminiConnection } from '@/services/providers/geminiProvider'
import { testAnthropicConnection } from '@/services/providers/anthropicProvider'
import { testXAIConnection } from '@/services/providers/xaiProvider'
import { testOllamaConnection } from '@/services/providers/ollamaProvider'
import { testOpenRouterConnection } from '@/services/providers/openrouterProvider'
import { useConfigBackup } from '@/hooks/useConfigBackup'
import { clearAllConfigs, clearAllData } from '@/services/storage/configStorage'
import { useAlert, useConfirm } from '@/components/ui/alert-dialog'

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

  // Alert and Confirm hooks
  const { showAlert, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()

  // Use backup hook for export/import functionality
  const {
    isExporting,
    isImporting,
    exportMessage,
    fileInputRef,
    handleExport,
    handleImport,
    handleImportClick,
  } = useConfigBackup(setConfigs)

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
    <>
      <AlertComponent />
      <ConfirmComponent />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Provider Configuration</h1>
            <p className="text-gray-600">Configure your LLM API providers to start racing models</p>
          </div>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        {/* Security Warning for HTTP */}
        <SecurityWarning />

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

        {/* Backup & Restore Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Backup & Restore</h2>
          <p className="text-sm text-gray-600 mb-4">
            Export or import your configurations to backup or transfer between devices.
          </p>
          <p className="text-xs text-orange-600 mb-4">
            ⚠️ Warning: Exported files contain your API keys in readable format. Keep them secure!
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting || isImporting}
              variant="outline"
            >
              {isExporting ? 'Exporting...' : '📥 Export Configuration'}
            </Button>
            <Button
              onClick={handleImportClick}
              disabled={isExporting || isImporting}
              variant="outline"
            >
              {isImporting ? 'Importing...' : '📤 Import Configuration'}
            </Button>
          </div>

          {/* Status messages */}
          {exportMessage && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                exportMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {exportMessage.type === 'success' ? '✓' : '✗'} {exportMessage.text}
            </div>
          )}
        </div>

        {/* Danger Zone Section */}
        <div className="bg-white rounded-lg shadow p-6 mt-8 border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            <span className="text-red-600 text-lg">⚠️</span>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            These actions cannot be undone. Please proceed with caution.
          </p>

          <div className="space-y-4">
            {/* Clear Provider Configurations */}
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Clear All Provider Configurations</h3>
                <p className="text-sm text-gray-600">
                  Remove all API keys, endpoints, and selected models. Provider list will reset to defaults.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  showConfirm(
                    'Clear All Provider Configurations',
                    'Are you sure you want to clear all provider configurations?\n\n' +
                    'This will remove:\n' +
                    '• All API keys\n' +
                    '• All custom endpoints\n' +
                    '• All selected models\n\n' +
                    'This action cannot be undone!',
                    async () => {
                      try {
                        console.info('[ConfigPage] Clearing all provider configurations...')
                        await clearAllConfigs()
                        console.info('[ConfigPage] Provider configurations cleared successfully')
                        showAlert(
                          'Success',
                          'All provider configurations have been cleared.\n\nThe page will now reload.'
                        )
                        setTimeout(() => {
                          window.location.reload()
                        }, 2000)
                      } catch (error) {
                        console.error('[ConfigPage] Failed to clear configurations:', error)
                        showAlert(
                          'Error',
                          `Failed to clear configurations:\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
                          'destructive'
                        )
                      }
                    },
                    {
                      confirmText: 'Clear Providers',
                      variant: 'destructive',
                    }
                  )
                }}
                className="ml-4 flex-shrink-0"
              >
                Clear Providers
              </Button>
            </div>

            {/* Clear All Website Data */}
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Clear All Website Data</h3>
                <p className="text-sm text-gray-600">
                  Remove all data including provider configs, test history, prompts, and responses.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  showConfirm(
                    'WARNING: Delete ALL Data',
                    '🚨 This will delete ALL data from AI Racers!\n\n' +
                    'This includes:\n' +
                    '• All provider configurations and API keys\n' +
                    '• All test names and prompts\n' +
                    '• All response history\n' +
                    '• All saved preferences\n\n' +
                    'Are you absolutely sure? This action cannot be undone!',
                    () => {
                      // Second confirmation
                      showConfirm(
                        'FINAL WARNING',
                        '⚠️ This is your last chance to cancel.\n\n' +
                        'Click "Delete All Data" to permanently delete everything, or "Cancel" to keep your data safe.',
                        async () => {
                          try {
                            console.info('[ConfigPage] Clearing all website data...')
                            await clearAllData()
                            console.info('[ConfigPage] All website data cleared successfully')
                            showAlert(
                              'Success',
                              'All website data has been cleared.\n\nThe page will now reload.'
                            )
                            setTimeout(() => {
                              window.location.reload()
                            }, 2000)
                          } catch (error) {
                            console.error('[ConfigPage] Failed to clear all data:', error)
                            showAlert(
                              'Error',
                              `Failed to clear all data:\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
                              'destructive'
                            )
                          }
                        },
                        {
                          confirmText: 'Delete All Data',
                          variant: 'destructive',
                        }
                      )
                    },
                    {
                      confirmText: 'Continue',
                      variant: 'destructive',
                    }
                  )
                }}
                className="ml-4 flex-shrink-0"
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
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
  const isDisabled = config.id === 'anthropic'

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
    <div className={`bg-white rounded-lg shadow p-6 ${isDisabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{config.name}</h2>
          {isDisabled && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠ Cannot make requests from front-end UI directly. Please use OpenRouter.
            </p>
          )}
        </div>
        <Button
          onClick={handleTest}
          disabled={!canTest || testing || isDisabled}
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
                disabled={isDisabled}
              />
              <Button
                type="button"
                onClick={() => setShowKey(!showKey)}
                variant="outline"
                size="sm"
                disabled={isDisabled}
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
            disabled={isDisabled}
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
                          Available models (click to select as racing options):
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
                  <div className="text-xs text-gray-500 mt-3 text-right">
                    Latest test is at: {new Date(testResult.testedAt).toLocaleTimeString()}
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
