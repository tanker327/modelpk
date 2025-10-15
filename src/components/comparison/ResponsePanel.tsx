import { useState } from 'react'
import type { ResponseStatus, TokenUsage } from '@/schemas/comparisonSchema'
import { formatDuration } from '@/services/api/comparisonService'
import MarkdownPreview from '@uiw/react-markdown-preview'
import ReactJson from '@microlink/react-json-view'

interface ResponsePanelProps {
  providerName: string
  modelName: string
  status: ResponseStatus
  response?: string
  error?: string
  durationMs?: number
  tokenUsage?: TokenUsage
  isFastest?: boolean
  isSlowest?: boolean
  showThinking?: boolean
  onRefresh?: () => void
}

export function ResponsePanel({
  providerName,
  modelName,
  status,
  response,
  error,
  durationMs,
  tokenUsage,
  isFastest,
  isSlowest,
  showThinking = false,
  onRefresh,
}: ResponsePanelProps) {
  const [isMarkdownView, setIsMarkdownView] = useState(true)

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

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 flex flex-col h-full min-h-[300px] ${
      isFastest ? 'ring-2 ring-green-500' : isSlowest ? 'ring-2 ring-orange-500' : ''
    }`}>
      {/* Header */}
      <div className="border-b pb-3 mb-3 flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{providerName}</h3>
          <p className="text-sm text-gray-600">{modelName}</p>
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
            <button
              onClick={() => setIsMarkdownView(!isMarkdownView)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
              title={isMarkdownView ? 'Switch to raw text' : 'Switch to markdown view'}
            >
              {isMarkdownView ? '📝 Raw' : '🎨 MD'}
            </button>
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

      {/* Footer with timing and token usage */}
      {(durationMs !== undefined || tokenUsage) && (status === 'success' || status === 'error') && (
        <div className="border-t pt-3 mt-3">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
