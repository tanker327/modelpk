import { useState, useMemo, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MdRocket, MdAttachMoney, MdSettings } from 'react-icons/md'
import { FaGithub } from 'react-icons/fa'
import { SEO } from '@/components/SEO'
import modelPricingData from '@/data/modelPricing.json'

interface ModelPriceData {
  inputPrice: number
  outputPrice: number
  unit: string
  contextWindow?: number
  notes?: string
}

interface PricingData {
  lastUpdated: string
  currency: string
  models: {
    [providerId: string]: {
      [modelId: string]: ModelPriceData
    }
  }
  notes: {
    [providerId: string]: string
  }
}

const pricingData = modelPricingData as PricingData

// Provider display names
const providerNames: { [key: string]: string } = {
  openai: 'OpenAI',
  gemini: 'Google Gemini',
  anthropic: 'Anthropic Claude',
  xai: 'xAI Grok',
  ollama: 'Ollama',
  openrouter: 'OpenRouter',
}

// Memoized table row component to prevent unnecessary re-renders
const ModelRow = memo(({ model }: { model: {
  providerId: string
  providerName: string
  modelId: string
  data: ModelPriceData
} }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">
        {model.modelId === '*' ? 'All Models' : model.modelId}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {model.data.inputPrice === 0 ? (
          <span className="text-green-600 font-semibold">Free</span>
        ) : (
          `$${model.data.inputPrice.toFixed(2)}`
        )}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {model.data.outputPrice === 0 ? (
          <span className="text-green-600 font-semibold">Free</span>
        ) : (
          `$${model.data.outputPrice.toFixed(2)}`
        )}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {model.data.contextWindow
          ? `${(model.data.contextWindow / 1000).toLocaleString()}K`
          : '—'}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="text-sm text-gray-500 max-w-md">
        {model.data.notes || '—'}
      </div>
    </td>
  </tr>
))

ModelRow.displayName = 'ModelRow'

// Memoized provider table component
const ProviderTable = memo(({
  providerId,
  models
}: {
  providerId: string
  models: Array<{
    providerId: string
    providerName: string
    modelId: string
    data: ModelPriceData
  }>
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* Provider Header */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
      <h2 className="text-2xl font-bold text-white">
        {providerNames[providerId] || providerId}
      </h2>
      {pricingData.notes[providerId] && (
        <p className="text-blue-100 text-sm mt-1">{pricingData.notes[providerId]}</p>
      )}
    </div>

    {/* Pricing Table */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Model
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Input Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Output Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Context Window
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {models.map((model) => (
            <ModelRow key={model.modelId} model={model} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
))

ProviderTable.displayName = 'ProviderTable'

export function PricingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  // Get all providers
  const providers = useMemo(() => Object.keys(pricingData.models), [])

  // Filter and search models
  const filteredModels = useMemo(() => {
    const results: Array<{
      providerId: string
      providerName: string
      modelId: string
      data: ModelPriceData
    }> = []

    for (const [providerId, models] of Object.entries(pricingData.models)) {
      // Filter by selected provider
      if (selectedProvider !== 'all' && providerId !== selectedProvider) {
        continue
      }

      for (const [modelId, data] of Object.entries(models)) {
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesModel = modelId.toLowerCase().includes(query)
          const matchesProvider = providerId.toLowerCase().includes(query)
          const matchesProviderName = providerNames[providerId]?.toLowerCase().includes(query)
          const matchesNotes = data.notes?.toLowerCase().includes(query)

          if (!matchesModel && !matchesProvider && !matchesProviderName && !matchesNotes) {
            continue
          }
        }

        results.push({
          providerId,
          providerName: providerNames[providerId] || providerId,
          modelId,
          data,
        })
      }
    }

    return results
  }, [searchQuery, selectedProvider])

  // Group by provider for display
  const groupedModels = useMemo(() => {
    const grouped: { [key: string]: typeof filteredModels } = {}
    for (const item of filteredModels) {
      if (!grouped[item.providerId]) {
        grouped[item.providerId] = []
      }
      grouped[item.providerId].push(item)
    }
    return grouped
  }, [filteredModels])

  // Memoized handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleProviderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(e.target.value)
  }, [])

  return (
    <>
      <SEO
        title="AI Model Pricing - Compare Costs | OpenAI, Gemini, Claude Pricing"
        description="Compare AI model pricing from OpenAI, Google Gemini, Anthropic Claude, xAI, and more. Up-to-date pricing per 1M tokens, context windows, and cost comparison."
        canonical="https://modelpk.com/pricing"
        keywords="AI model pricing, LLM cost comparison, ChatGPT pricing, Claude pricing, Gemini pricing, AI API costs, token pricing"
      />
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
                    <p>View Latest Model Cost</p>
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

      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Model Pricing</h1>
          <p className="text-gray-600">
            Last Updated: <span className="font-semibold">{pricingData.lastUpdated}</span> • All
            prices in <span className="font-semibold">{pricingData.currency}</span> per 1 million
            tokens
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Models
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by model name, provider, or notes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Provider Filter */}
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Provider
              </label>
              <select
                id="provider"
                value={selectedProvider}
                onChange={handleProviderChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Providers</option>
                {providers.map((providerId) => (
                  <option key={providerId} value={providerId}>
                    {providerNames[providerId] || providerId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Pricing Tables by Provider */}
        {Object.keys(groupedModels).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedModels).map(([providerId, models]) => (
              <ProviderTable key={providerId} providerId={providerId} models={models} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No models found</h3>
            <p className="text-gray-500">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Note:</span> Prices are subject to change by providers.
            This information is for reference only. Always verify current pricing at official
            provider sources before making cost-sensitive decisions.
          </p>
        </div>
        </div>
      </div>
    </>
  )
}
