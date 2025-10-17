import { useState } from 'react'
import type { ResponseStatus, TokenUsage } from '@/schemas/comparisonSchema'
import type { ProviderId } from '@/schemas/providerConfigSchema'
import { formatDuration } from '@/services/api/comparisonService'
import { calculateCost } from '@/services/pricing/pricingService'
import MarkdownPreview from '@uiw/react-markdown-preview'
import ReactJson from '@microlink/react-json-view'
import { Toggle } from '@/components/ui/toggle'

interface ResponsePanelProps {
  providerId: ProviderId
  providerName: string
  modelName: string
  status: ResponseStatus
  response?: string
  error?: string
  durationMs?: number
  tokenUsage?: TokenUsage
  isFastest?: boolean
  isSlowest?: boolean
  isCheapest?: boolean
  isMostExpensive?: boolean
  showThinking?: boolean
  onRefresh?: () => void
}

export function ResponsePanel({
  providerId,
  providerName,
  modelName,
  status,
  response,
  error,
  durationMs,
  tokenUsage,
  isFastest,
  isSlowest,
  isCheapest,
  isMostExpensive,
  showThinking = false,
  onRefresh,
}: ResponsePanelProps) {
  const [isMarkdownView, setIsMarkdownView] = useState(true)
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  const handleCopy = async () => {
    if (!response) return

    try {
      await navigator.clipboard.writeText(response)
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Check if a string is valid JSON
  const isValidJSON = (str: string): boolean => {
    try {
      const parsed = JSON.parse(str)
      return typeof parsed === 'object' && parsed !== null
    } catch {
      return false
    }
  }

  // Parse response to separate thinking and main content
  const parseResponse = (text: string) => {
    // Try to match full <think>...</think> tags
    const fullThinkingRegex = /<think>([\s\S]*?)<\/think>/
    const fullMatch = text.match(fullThinkingRegex)

    if (fullMatch) {
      const thinkingContent = fullMatch[1].trim()
      const mainContent = text.replace(fullThinkingRegex, '').trim()
      return { thinkingContent, mainContent, hasThinking: true }
    }

    // Handle case where only </think> exists (thinking content before it)
    const closeTagIndex = text.indexOf('</think>')
    if (closeTagIndex !== -1) {
      const thinkingContent = text.substring(0, closeTagIndex).trim()
      const mainContent = text.substring(closeTagIndex + 8).trim() // 8 = length of '</think>'
      return { thinkingContent, mainContent, hasThinking: true }
    }

    return { thinkingContent: '', mainContent: text, hasThinking: false }
  }

  const { thinkingContent, mainContent, hasThinking } = response
    ? parseResponse(response)
    : { thinkingContent: '', mainContent: '', hasThinking: false }

  // Calculate cost if token usage is available
  const costEstimate = tokenUsage ? calculateCost(providerId, modelName, tokenUsage) : null

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col relative">
      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-2 rounded shadow-lg text-sm flex items-center gap-2 animate-fade-in">
          ✓ Content copied to clipboard
        </div>
      )}

      {/* Header */}
      <div className="border-b pb-3 mb-3 flex items-start justify-between">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0 flex-1">
          <h3 className={`text-lg font-semibold px-2 py-1 rounded inline-flex items-center gap-1 ${
            isFastest ? 'bg-green-100 text-green-800' :
            isSlowest ? 'bg-red-100 text-red-800' :
            'text-gray-900'
          }`}>
            {isFastest && '🏆 '}
            {isSlowest && '🐢 '}
            {providerName}
          </h3>
          <p className="text-sm text-gray-600" title={modelName}>{modelName}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRefresh && (status === 'pending' || status === 'success' || status === 'error') && (
            <button
              onClick={onRefresh}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
              title={status === 'pending' ? 'Fetch this result' : 'Refresh this result'}
            >
              🔄
            </button>
          )}
          {status === 'success' && response && (
            <>
              <button
                onClick={handleCopy}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                title="Copy raw output to clipboard"
              >
                📋
              </button>
              <div className="flex items-center gap-1">
                <Toggle
                  pressed={isMarkdownView}
                  onPressedChange={setIsMarkdownView}
                  variant="outline"
                  size="sm"
                  aria-label="Toggle markdown view"
                >
                  MD
                </Toggle>
                <Toggle
                  pressed={!isMarkdownView}
                  onPressedChange={(pressed) => setIsMarkdownView(!pressed)}
                  variant="outline"
                  size="sm"
                  aria-label="Toggle raw view"
                >
                  Raw
                </Toggle>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {status === 'pending' && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <div className="text-gray-400 text-4xl">⏳</div>
            <div className="text-gray-600 font-medium">Not fetched yet</div>
            <div className="text-gray-500 text-sm">Click the refresh button to fetch this result</div>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <div className="mt-2 text-sm text-gray-600">Loading...</div>
            </div>
          </div>
        )}

        {status === 'success' && response && (
          <div className="space-y-3">
            {/* Content - Toggle between thinking and main content based on global state */}
            {showThinking ? (
              // Show Thinking Content (or message if no thinking)
              hasThinking ? (
                <div className="prose prose-sm max-w-none">
                  <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                    {isMarkdownView ? (
                      <div className="text-amber-900">
                        <MarkdownPreview
                          source={thinkingContent}
                          wrapperElement={{ 'data-color-mode': 'light' }}
                        />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-amber-900 font-mono text-xs">
                        {thinkingContent}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // No thinking content available
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  No thinking content available
                </div>
              )
            ) : (
              // Show Main Content (default)
              <div className="prose prose-sm max-w-none">
                {isValidJSON(mainContent) ? (
                  // Render JSON with react-json-view
                  <ReactJson
                    src={JSON.parse(mainContent)}
                    theme="rjv-default"
                    collapsed={1}
                    displayDataTypes={false}
                    displayObjectSize={true}
                    enableClipboard={true}
                    name={false}
                    style={{ fontSize: '13px' }}
                  />
                ) : isMarkdownView ? (
                  // Render as Markdown
                  <MarkdownPreview
                    source={mainContent}
                    wrapperElement={{ 'data-color-mode': 'light' }}
                  />
                ) : (
                  // Render as raw text
                  <div className="whitespace-pre-wrap text-gray-800 font-mono text-xs">
                    {mainContent}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600">
            <div className="font-medium mb-1">✗ Error</div>
            <div className="text-sm">{error || 'Unknown error occurred'}</div>
          </div>
        )}
      </div>

      {/* Footer with timing and token usage - clickable to toggle between summary and detailed view */}
      {(durationMs !== undefined || tokenUsage) && (status === 'success' || status === 'error') && (
        <button
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          className="border-t pt-3 mt-3 w-full text-left hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {isStatsExpanded ? (
            // Expanded view - detailed stats
            <div>
              {durationMs !== undefined && (
                <div className={`text-xs mb-2 font-semibold ${
                  isFastest ? 'text-green-600' : isSlowest ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {isFastest && '🏆 '}
                  {isSlowest && '🐢 '}
                  {!isFastest && !isSlowest && '⏱ '}
                  {formatDuration(durationMs)}
                  {isFastest && ' (Fastest)'}
                  {isSlowest && ' (Slowest)'}
                </div>
              )}
              {tokenUsage && (
                <div className="text-xs text-gray-500 space-y-1">
                  {tokenUsage.promptTokens !== undefined && (
                    <div>📥 Prompt: {tokenUsage.promptTokens.toLocaleString()} tokens</div>
                  )}
                  {tokenUsage.completionTokens !== undefined && (
                    <div>📤 Completion: {tokenUsage.completionTokens.toLocaleString()} tokens</div>
                  )}
                  {tokenUsage.totalTokens !== undefined && (
                    <div>📊 Total: {tokenUsage.totalTokens.toLocaleString()} tokens</div>
                  )}
                  {tokenUsage.cachedTokens !== undefined && tokenUsage.cachedTokens > 0 && (
                    <div>💾 Cached: {tokenUsage.cachedTokens.toLocaleString()} tokens</div>
                  )}
                  {tokenUsage.reasoningTokens !== undefined && tokenUsage.reasoningTokens > 0 && (
                    <div>🧠 Reasoning: {tokenUsage.reasoningTokens.toLocaleString()} tokens</div>
                  )}
                  {costEstimate && (
                    <div className={`pt-1 mt-1 border-t border-gray-200 font-semibold ${
                      isCheapest ? 'text-green-600' : isMostExpensive ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      💵 Cost: {costEstimate.formattedCost}
                      {isCheapest && ' (Cheapest)'}
                      {isMostExpensive && ' (Most Expensive)'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Collapsed view - one line summary
            <div className="text-xs text-gray-600 flex items-center gap-3">
              {durationMs !== undefined && (
                <span className={`font-semibold ${
                  isFastest ? 'text-green-600' : isSlowest ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {isFastest && '🏆 '}
                  {isSlowest && '🐢 '}
                  {!isFastest && !isSlowest && '⏱ '}
                  {formatDuration(durationMs)}
                </span>
              )}
              {tokenUsage?.totalTokens !== undefined && (
                <span>📊 {tokenUsage.totalTokens.toLocaleString()} tokens</span>
              )}
              {costEstimate && (
                <span className={`font-semibold ${
                  isCheapest ? 'text-green-600' : isMostExpensive ? 'text-red-600' : 'text-gray-600'
                }`}>
                  💵 {costEstimate.formattedCost}
                </span>
              )}
              {tokenUsage?.cachedTokens !== undefined && tokenUsage.cachedTokens > 0 && (
                <span>💾 {tokenUsage.cachedTokens.toLocaleString()}</span>
              )}
              {tokenUsage?.reasoningTokens !== undefined && tokenUsage.reasoningTokens > 0 && (
                <span>🧠 {tokenUsage.reasoningTokens.toLocaleString()}</span>
              )}
            </div>
          )}
        </button>
      )}
    </div>
  )
}
