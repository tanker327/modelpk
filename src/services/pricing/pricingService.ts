import modelPricing from '@/data/modelPricing.json'
import type { ProviderId } from '@/schemas/providerConfigSchema'
import type { TokenUsage } from '@/schemas/comparisonSchema'

export interface ModelPrice {
  inputPrice: number
  outputPrice: number
  unit: string
  contextWindow?: number
  notes?: string
}

export interface CostEstimate {
  inputCost: number
  outputCost: number
  totalCost: number
  formattedCost: string
}

/**
 * Normalize model name by removing version suffixes and dates
 * Examples:
 *   gpt-4o-mini-2025-08-07 -> gpt-4o-mini
 *   grok-beta-fast-reasoning -> grok-beta
 *   claude-3-5-sonnet-20241022 -> claude-3-5-sonnet
 */
function normalizeModelName(modelName: string): string {
  // Remove date patterns (YYYY-MM-DD, YYYYMMDD, YYYYMM)
  let normalized = modelName.replace(/-?\d{4}-?\d{2}-?\d{2}$/, '')
  normalized = normalized.replace(/-?\d{4}-?\d{2}$/, '')
  normalized = normalized.replace(/-?\d{8}$/, '')

  // Remove version numbers at the end (e.g., -v2, -v1.5)
  normalized = normalized.replace(/-v?\d+(\.\d+)?$/, '')

  return normalized
}

/**
 * Find best matching model in pricing data
 * Returns the longest matching base name to prefer more specific matches
 */
function findBestMatch(modelId: string, pricingKeys: string[]): string | null {
  const normalizedModelId = normalizeModelName(modelId.toLowerCase())

  let bestMatch: string | null = null
  let bestMatchLength = 0

  for (const key of pricingKeys) {
    const normalizedKey = normalizeModelName(key.toLowerCase())

    // Check if the normalized model ID starts with the normalized key
    // or if the normalized key starts with the normalized model ID
    if (normalizedModelId.startsWith(normalizedKey) || normalizedKey.startsWith(normalizedModelId)) {
      // Prefer longer matches (more specific)
      if (normalizedKey.length > bestMatchLength) {
        bestMatch = key
        bestMatchLength = normalizedKey.length
      }
    }

    // Also check if model ID contains the key as a substring (for cases like grok-4-fast contains grok-beta)
    if (normalizedModelId.includes(normalizedKey) && normalizedKey.length > bestMatchLength) {
      bestMatch = key
      bestMatchLength = normalizedKey.length
    }
  }

  return bestMatch
}

/**
 * Get pricing information for a specific model
 */
export function getModelPrice(providerId: ProviderId, modelId: string): ModelPrice | null {
  const providerPricing = modelPricing.models[providerId as keyof typeof modelPricing.models]

  if (!providerPricing) {
    log.warn(`[Pricing] No pricing data for provider: ${providerId}`)
    return null
  }

  // Check for exact match first (fastest)
  if (modelId in providerPricing) {
    return providerPricing[modelId as keyof typeof providerPricing] as ModelPrice
  }

  // Check for wildcard (like ollama's "*")
  if ('*' in providerPricing) {
    return providerPricing['*' as keyof typeof providerPricing] as ModelPrice
  }

  // Try smart string matching for versioned models
  const pricingKeys = Object.keys(providerPricing)
  const bestMatch = findBestMatch(modelId, pricingKeys)

  if (bestMatch) {
    log.debug(`Using fuzzy match: "${bestMatch}" for "${modelId}"`)
    return providerPricing[bestMatch as keyof typeof providerPricing] as ModelPrice
  }

  log.warn(`No pricing data for model: ${providerId}/${modelId}`)
  return null
}

/**
 * Calculate cost based on token usage
 */
export function calculateCost(
  providerId: ProviderId,
  modelId: string,
  tokenUsage: TokenUsage
): CostEstimate | null {
  const pricing = getModelPrice(providerId, modelId)

  if (!pricing) {
    return null
  }

  // Calculate costs (prices are per 1M tokens)
  const inputCost = ((tokenUsage.promptTokens || 0) / 1_000_000) * pricing.inputPrice
  const outputCost = ((tokenUsage.completionTokens || 0) / 1_000_000) * pricing.outputPrice
  const totalCost = inputCost + outputCost

  // Format with appropriate precision
  let formattedCost: string
  if (totalCost === 0) {
    formattedCost = 'Free'
  } else if (totalCost < 0.0001) {
    formattedCost = '<$0.0001'
  } else if (totalCost < 0.01) {
    formattedCost = `$${totalCost.toFixed(4)}`
  } else {
    formattedCost = `$${totalCost.toFixed(3)}`
  }

  return {
    inputCost,
    outputCost,
    totalCost,
    formattedCost,
  }
}

/**
 * Get all available pricing data
 */
export function getAllPricing() {
  return modelPricing
}

/**
 * Format price for display
 */
export function formatPrice(price: number, includeUnit = true): string {
  const formatted = price.toFixed(2)
  return includeUnit ? `$${formatted}/1M tokens` : `$${formatted}`
}
