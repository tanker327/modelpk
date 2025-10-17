import { atom } from '@zedux/react'
import type { ProviderConfig, ProviderId } from '@/schemas/providerConfigSchema'
import { DEFAULT_PROVIDERS } from '@/schemas/providerConfigSchema'
import * as configStorage from '@/services/storage/configStorage'
import { createLogger } from '@/services/logger'

const log = createLogger('ProviderConfigsAtom')

export interface ProviderConfigsState {
  configs: ProviderConfig[]
  loading: boolean
  error: string | null
}

// Create initial state
const initialState: ProviderConfigsState = {
  configs: DEFAULT_PROVIDERS.map((p) => ({ ...p, config: { selectedModels: [] } })),
  loading: false, // Changed to false by default
  error: null,
}

// Atom that returns current state
export const providerConfigsAtom = atom('providerConfigs', initialState)

// Helper to get current configs (used by actions, not for rendering)
let currentConfigs: ProviderConfig[] = initialState.configs

// Helper functions to update state
export const providerConfigsActions = {
  /**
   * Update a provider configuration
   */
  updateConfig: async (providerId: ProviderId, updates: Partial<ProviderConfig>) => {
    const configIndex = currentConfigs.findIndex((c) => c.id === providerId)

    if (configIndex === -1) {
      log.error('Provider not found')
      return
    }

    const updatedConfig = {
      ...currentConfigs[configIndex],
      ...updates,
      // Deep merge the config property
      config: {
        ...currentConfigs[configIndex].config,
        ...(updates.config || {}),
      },
    }

    const newConfigs = [...currentConfigs]
    newConfigs[configIndex] = updatedConfig
    currentConfigs = newConfigs

    // Persist to IndexedDB
    try {
      await configStorage.saveConfig(updatedConfig)
      log.debug('Updated configuration')
    } catch (error) {
      log.error('Failed to save configuration:', error)
      throw error
    }
  },

  /**
   * Toggle enabled state for a provider
   */
  toggleEnabled: async (providerId: ProviderId) => {
    const config = currentConfigs.find((c) => c.id === providerId)

    if (!config) {
      log.error('Provider not found')
      return
    }

    await providerConfigsActions.updateConfig(providerId, { enabled: !config.enabled })
  },

  /**
   * Delete a provider configuration
   */
  deleteConfig: async (providerId: ProviderId) => {
    const defaultConfig = DEFAULT_PROVIDERS.find((p) => p.id === providerId)

    if (!defaultConfig) {
      log.error('No default config found')
      return
    }

    const resetConfig: ProviderConfig = {
      ...defaultConfig,
      config: { selectedModels: [] },
    }

    currentConfigs = currentConfigs.map((c) => (c.id === providerId ? resetConfig : c))

    // Delete from IndexedDB
    try {
      await configStorage.deleteConfig(providerId)
      log.debug('Deleted configuration')
    } catch (error) {
      log.error('Failed to delete configuration:', error)
      throw error
    }
  },

  /**
   * Initialize configurations from storage
   * Also handles migration of unencrypted API keys
   */
  init: async () => {
    try {
      const savedConfigs = await configStorage.getAllConfigs()

      // Merge saved configs with defaults to ensure all providers are present
      const mergedConfigs = DEFAULT_PROVIDERS.map((defaultProvider) => {
        const savedConfig = savedConfigs.find((c) => c.id === defaultProvider.id)
        if (savedConfig) {
          // Use saved config but ensure it has the default structure
          return {
            ...defaultProvider,
            ...savedConfig,
            config: {
              ...savedConfig.config,
              selectedModels: savedConfig.config.selectedModels || [],
            },
          }
        }
        // Use default if no saved config exists
        return { ...defaultProvider, config: { selectedModels: [] } }
      })

      currentConfigs = mergedConfigs

      log.debug(
        `Loaded ${savedConfigs.length} saved configurations, merged with defaults`
      )

      // Migration: Encrypt any unencrypted API keys
      // This happens automatically when configs are saved next time via saveConfig
      // No need for explicit migration here as saveConfig handles it
    } catch (error) {
      log.error('Failed to load configurations:', error)
    }
  },

  /**
   * Get all current configurations
   */
  getConfigs: () => {
    return currentConfigs
  },
}
