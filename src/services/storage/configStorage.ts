import { openDB, type IDBPDatabase } from 'idb'
import type { ProviderConfig, ProviderId } from '@/schemas/providerConfigSchema'

const DB_NAME = 'ai-racers-config'
const DB_VERSION = 1
const STORE_NAME = 'providers'

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize the IndexedDB database
 */
async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create the providers object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          console.info('[ConfigStorage] Created providers object store')
        }
      },
    })

    console.info('[ConfigStorage] Database initialized successfully')
    return dbInstance
  } catch (error) {
    console.error('[ConfigStorage] Failed to initialize database:', error)
    throw new Error('Failed to initialize IndexedDB. Please check browser storage permissions.')
  }
}

/**
 * Save a provider configuration
 */
export async function saveConfig(config: ProviderConfig): Promise<void> {
  try {
    const db = await initDB()
    await db.put(STORE_NAME, config)
    console.info(`[ConfigStorage] Saved configuration for provider: ${config.id}`)
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please clear some browser data and try again.')
    }
    console.error('[ConfigStorage] Failed to save configuration:', error)
    throw new Error('Failed to save configuration. Please try again.')
  }
}

/**
 * Get a single provider configuration by ID
 */
export async function getConfig(providerId: ProviderId): Promise<ProviderConfig | undefined> {
  try {
    const db = await initDB()
    const config = await db.get(STORE_NAME, providerId)
    return config
  } catch (error) {
    console.error(`[ConfigStorage] Failed to get configuration for ${providerId}:`, error)
    return undefined
  }
}

/**
 * Get all provider configurations
 */
export async function getAllConfigs(): Promise<ProviderConfig[]> {
  try {
    const db = await initDB()
    const configs = await db.getAll(STORE_NAME)
    console.info(`[ConfigStorage] Retrieved ${configs.length} configurations`)
    return configs
  } catch (error) {
    console.error('[ConfigStorage] Failed to get all configurations:', error)
    return []
  }
}

/**
 * Delete a provider configuration
 */
export async function deleteConfig(providerId: ProviderId): Promise<void> {
  try {
    const db = await initDB()
    await db.delete(STORE_NAME, providerId)
    console.info(`[ConfigStorage] Deleted configuration for provider: ${providerId}`)
  } catch (error) {
    console.error(`[ConfigStorage] Failed to delete configuration for ${providerId}:`, error)
    throw new Error('Failed to delete configuration. Please try again.')
  }
}

/**
 * Export all configurations as JSON
 */
export async function exportConfigs(): Promise<string> {
  try {
    const configs = await getAllConfigs()
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      configs,
    }
    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('[ConfigStorage] Failed to export configurations:', error)
    throw new Error('Failed to export configurations. Please try again.')
  }
}

/**
 * Import configurations from JSON
 */
export async function importConfigs(jsonData: string): Promise<{
  imported: number
  errors: string[]
}> {
  const errors: string[] = []
  let imported = 0

  try {
    const data = JSON.parse(jsonData)

    if (!data.configs || !Array.isArray(data.configs)) {
      throw new Error('Invalid configuration file format')
    }

    const db = await initDB()

    // Import each configuration
    for (const config of data.configs) {
      try {
        // Basic validation
        if (!config.id || !config.name) {
          errors.push(`Invalid configuration: missing required fields`)
          continue
        }

        await db.put(STORE_NAME, config)
        imported++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed to import ${config.id}: ${errorMsg}`)
      }
    }

    console.info(`[ConfigStorage] Import complete: ${imported} imported, ${errors.length} errors`)
    return { imported, errors }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format')
    }
    throw new Error('Failed to import configurations. Please check the file format.')
  }
}

/**
 * Clear all configurations (for testing/debugging)
 */
export async function clearAllConfigs(): Promise<void> {
  try {
    const db = await initDB()
    await db.clear(STORE_NAME)
    console.info('[ConfigStorage] Cleared all configurations')
  } catch (error) {
    console.error('[ConfigStorage] Failed to clear configurations:', error)
    throw new Error('Failed to clear configurations.')
  }
}
