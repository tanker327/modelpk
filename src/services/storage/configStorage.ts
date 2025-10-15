import { openDB, type IDBPDatabase } from 'idb'
import type { ProviderConfig, ProviderId } from '@/schemas/providerConfigSchema'
import {
  encryptApiKey,
  decryptApiKey,
  hasEncryptionSalt,
  generateMasterSalt,
} from '@/services/security/encryption'

const DB_NAME = 'ai-racers-config'
const DB_VERSION = 2 // Incremented for new encryption store
const STORE_NAME = 'providers'
const ENCRYPTION_STORE = 'encryption'
const MASTER_SALT_KEY = 'master-salt'

let dbInstance: IDBPDatabase | null = null
let masterSalt: Uint8Array | null = null

/**
 * Initialize the IndexedDB database
 */
async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion) {
        // Create the providers object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          console.info('[ConfigStorage] Created providers object store')
        }

        // Create the encryption object store for storing master salt
        if (!db.objectStoreNames.contains(ENCRYPTION_STORE)) {
          db.createObjectStore(ENCRYPTION_STORE)
          console.info('[ConfigStorage] Created encryption object store')
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
 * Get or create the master encryption salt
 */
async function getMasterSalt(): Promise<Uint8Array> {
  if (masterSalt) {
    return masterSalt
  }

  try {
    const db = await initDB()

    // Try to load existing salt
    const stored = await db.get(ENCRYPTION_STORE, MASTER_SALT_KEY)

    if (stored && stored instanceof Uint8Array) {
      masterSalt = stored
      console.info('[ConfigStorage] Loaded existing master salt')
      return masterSalt
    }

    // Generate new salt
    masterSalt = generateMasterSalt()
    await db.put(ENCRYPTION_STORE, masterSalt, MASTER_SALT_KEY)
    console.info('[ConfigStorage] Generated and stored new master salt')

    return masterSalt
  } catch (error) {
    console.error('[ConfigStorage] Failed to get master salt:', error)
    throw new Error('Failed to initialize encryption')
  }
}

/**
 * Save a provider configuration
 * Encrypts API key if present and not already encrypted
 */
export async function saveConfig(config: ProviderConfig): Promise<void> {
  try {
    const db = await initDB()

    // Clone config to avoid mutating the original
    let configToSave = { ...config }

    // Encrypt API key if it exists and is not already encrypted
    if (config.config.apiKey && !hasEncryptionSalt(config.config.apiKey)) {
      console.info(`[ConfigStorage] Encrypting API key for provider: ${config.id}`)
      const salt = await getMasterSalt()
      const encryptedKey = await encryptApiKey(config.config.apiKey, salt)

      configToSave = {
        ...config,
        config: {
          ...config.config,
          apiKey: encryptedKey,
        },
      }
    }

    await db.put(STORE_NAME, configToSave)
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
 * Decrypts API key if encrypted
 */
export async function getConfig(providerId: ProviderId): Promise<ProviderConfig | undefined> {
  try {
    const db = await initDB()
    const config = await db.get(STORE_NAME, providerId)

    if (!config) {
      return undefined
    }

    // Decrypt API key if it's encrypted
    if (config.config.apiKey && hasEncryptionSalt(config.config.apiKey)) {
      try {
        const decryptedKey = await decryptApiKey(config.config.apiKey)
        return {
          ...config,
          config: {
            ...config.config,
            apiKey: decryptedKey,
          },
        }
      } catch (error) {
        console.error(`[ConfigStorage] Failed to decrypt API key for ${providerId}:`, error)
        // Return config without API key if decryption fails
        return {
          ...config,
          config: {
            ...config.config,
            apiKey: undefined,
          },
        }
      }
    }

    return config
  } catch (error) {
    console.error(`[ConfigStorage] Failed to get configuration for ${providerId}:`, error)
    return undefined
  }
}

/**
 * Get all provider configurations
 * Decrypts API keys if encrypted
 */
export async function getAllConfigs(): Promise<ProviderConfig[]> {
  try {
    const db = await initDB()
    const configs = await db.getAll(STORE_NAME)
    console.info(`[ConfigStorage] Retrieved ${configs.length} configurations`)

    // Decrypt API keys for all configs
    const decryptedConfigs = await Promise.all(
      configs.map(async (config) => {
        if (config.config.apiKey && hasEncryptionSalt(config.config.apiKey)) {
          try {
            const decryptedKey = await decryptApiKey(config.config.apiKey)
            return {
              ...config,
              config: {
                ...config.config,
                apiKey: decryptedKey,
              },
            }
          } catch (error) {
            console.error(`[ConfigStorage] Failed to decrypt API key for ${config.id}:`, error)
            // Return config without API key if decryption fails
            return {
              ...config,
              config: {
                ...config.config,
                apiKey: undefined,
              },
            }
          }
        }
        return config
      })
    )

    return decryptedConfigs
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
 * NOTE: Exported API keys are in plain text for portability.
 * They will be re-encrypted when imported.
 */
export async function exportConfigs(): Promise<string> {
  try {
    const configs = await getAllConfigs()
    console.info(`[ConfigStorage] Exporting ${configs.length} configurations with decrypted API keys`)
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

        // Encrypt API key if it exists and is not already encrypted
        let configToSave = { ...config }
        if (config.config?.apiKey && !hasEncryptionSalt(config.config.apiKey)) {
          console.info(`[ConfigStorage] Encrypting API key for imported provider: ${config.id}`)
          const salt = await getMasterSalt()
          const encryptedKey = await encryptApiKey(config.config.apiKey, salt)

          configToSave = {
            ...config,
            config: {
              ...config.config,
              apiKey: encryptedKey,
            },
          }
        }

        await db.put(STORE_NAME, configToSave)
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

/**
 * Clear all data from the website (IndexedDB + localStorage)
 */
export async function clearAllData(): Promise<void> {
  try {
    // Clear IndexedDB
    const db = await initDB()
    await db.clear(STORE_NAME)
    await db.clear(ENCRYPTION_STORE)
    console.info('[ConfigStorage] Cleared all IndexedDB data')

    // Clear localStorage items with 'airacers-' prefix
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('airacers-')) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.info(`[ConfigStorage] Cleared ${keysToRemove.length} localStorage items`)

    // Reset master salt
    masterSalt = null

    console.info('[ConfigStorage] Cleared all website data')
  } catch (error) {
    console.error('[ConfigStorage] Failed to clear all data:', error)
    throw new Error('Failed to clear all data.')
  }
}
