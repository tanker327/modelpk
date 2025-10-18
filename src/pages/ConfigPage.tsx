import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MdRocket, MdAttachMoney, MdSettings } from 'react-icons/md'
import { FaGithub } from 'react-icons/fa'
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

import { createLogger } from '@/services/logger'

const log = createLogger('ConfigPage')

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

      {/* Floating Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <MdRocket className="text-blue-600" size={28} />
              <span className="text-2xl font-bold text-gray-900">ModelPK</span>
            </Link>
            <TooltipProvider>
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/pk">
                      <Button variant="outline" size="icon" className="font-semibold">
                        PK
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start Model Comparison</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/pricing">
                      <Button variant="outline" size="icon">
                        <MdAttachMoney size={20} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Model Pricing</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/config">
                      <Button variant="outline" size="icon">
                        <MdSettings size={20} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure Providers</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="https://github.com/tanker327/modelpk" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon">
                        <FaGithub size={20} />
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on GitHub</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Provider Configuration</h1>
            <p className="text-gray-600 text-lg">Configure your LLM API providers to start racing models</p>
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

        {/* CTA Button */}
        <div className="mt-8 flex justify-center">
          <Link to="/pk">
            <Button size="lg" className="text-2xl px-16 py-8 h-auto font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              Done with Config, Let's PK Now!
              <MdRocket className="ml-3 animate-bounce" size={32} />
            </Button>
          </Link>
        </div>

        {/* Backup & Restore Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>
              Export or import your configurations to backup or transfer between devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="warning" className="mb-4">
              <AlertDescription>
                <span className="font-semibold">⚠️ Warning:</span> Exported files contain your API keys in readable format. Keep them secure!
              </AlertDescription>
            </Alert>

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
          </CardContent>
        </Card>

        {/* Danger Zone Section */}
        <Card className="mt-8 border-2 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-red-900">Danger Zone</CardTitle>
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <CardDescription>
              These actions cannot be undone. Please proceed with caution.
            </CardDescription>
          </CardHeader>
          <CardContent>

          <div className="space-y-4">
            {/* Clear Provider Configurations */}
            <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <AlertDescription>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Clear All Provider Configurations</h3>
                  <p className="text-sm text-gray-600">
                    Remove all API keys, endpoints, and selected models. Provider list will reset to defaults.
                  </p>
                </AlertDescription>
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
                        log.debug('Clearing all provider configurations...')
                        await clearAllConfigs()
                        log.debug('Provider configurations cleared successfully')
                        showAlert(
                          'Success',
                          'All provider configurations have been cleared.\n\nThe page will now reload.'
                        )
                        setTimeout(() => {
                          window.location.reload()
                        }, 2000)
                      } catch (error) {
                        log.error('Failed to clear configurations:', error)
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
                className="flex-shrink-0 w-full sm:w-auto"
              >
                Clear Providers
              </Button>
            </Alert>

            {/* Clear All Website Data */}
            <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <AlertDescription>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Clear All Website Data</h3>
                  <p className="text-sm text-gray-600">
                    Remove all data including provider configs, test history, prompts, and responses.
                  </p>
                </AlertDescription>
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
                            log.debug('Clearing all website data...')
                            await clearAllData()
                            log.debug('All website data cleared successfully')
                            showAlert(
                              'Success',
                              'All website data has been cleared.\n\nThe page will now reload.'
                            )
                            setTimeout(() => {
                              window.location.reload()
                            }, 2000)
                          } catch (error) {
                            log.error('Failed to clear all data:', error)
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
                className="flex-shrink-0 w-full sm:w-auto"
              >
                Clear All Data
              </Button>
            </Alert>
          </div>
          </CardContent>
        </Card>
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
    <Card className={isDisabled ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>{config.name}</CardTitle>
            {isDisabled && (
              <CardDescription className="text-orange-600 mt-1">
                ⚠ Cannot make requests from front-end UI directly. Please use OpenRouter.
              </CardDescription>
            )}
          </div>
          <Button
            onClick={handleTest}
            disabled={!canTest || testing || isDisabled}
            size="sm"
            variant={testResult?.status === 'success' ? 'default' : 'outline'}
          >
            {testing ? 'Loading...' : testResult?.status === 'success' ? 'Reload Models' : 'Load All Models to Select'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  )
}
