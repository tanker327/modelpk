/**
 * Encryption service for API keys using Web Crypto API
 * Uses AES-GCM encryption with a master salt stored in IndexedDB
 * Falls back to base64 encoding for non-secure contexts (HTTP)
 *
 * SECURITY NOTE:
 * This encryption provides obfuscation but NOT true security against determined attackers.
 * - The master salt is stored in IndexedDB (accessible to anyone with device access)
 * - No user password is required, so decryption is automatic
 * - Browser storage is inherently insecure - encryption keys exist in browser memory
 * - Anyone with physical or remote access to the device can decrypt the API keys
 *
 * This is acceptable for a local-first app but users should be aware:
 * - API keys are NOT protected from malware or malicious browser extensions
 * - Shared/public computers should not be used to store sensitive API keys
 * - For production apps with high security requirements, use a backend proxy instead
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM

/**
 * Check if Web Crypto API is available
 */
function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.subtle.encrypt === 'function'
}

/**
 * Check if a value is encrypted (has salt prefix)
 */
export function hasEncryptionSalt(value: string | undefined): boolean {
  if (!value) return false
  // Check for encrypted format (salt:iv:ciphertext)
  const parts = value.split(':')
  if (parts.length === 3 && parts[0].length > 0) return true
  // Check for fallback format (PLAIN: prefix)
  if (value.startsWith('PLAIN:')) return true
  return false
}

/**
 * Generate a random salt for key derivation
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

/**
 * Generate a random IV for encryption
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH))
}

/**
 * Derive an encryption key from a master salt
 * The master salt itself is used as the key material, and a constant known value
 * is used as PBKDF2 salt for deterministic key derivation
 */
async function deriveKey(masterSalt: Uint8Array): Promise<CryptoKey> {
  // Import the master salt as raw key material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    masterSalt,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  // Use a constant salt for PBKDF2 (deterministic, but that's required for decryption)
  // The security comes from the random master salt stored in IndexedDB
  // Note: This provides obfuscation but not true security since anyone with
  // device access can decrypt. For true security, use a password-based approach.
  const pbkdf2Salt = new TextEncoder().encode('modelpk-encryption-v1')

  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: pbkdf2Salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Convert Uint8Array to base64
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  const binary = String.fromCharCode(...buffer)
  return btoa(binary)
}

/**
 * Convert base64 to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Encrypt a plaintext API key
 * Returns: salt:iv:ciphertext (all base64 encoded) or PLAIN:base64 for non-secure contexts
 */
export async function encryptApiKey(plaintext: string, salt: Uint8Array): Promise<string> {
  try {
    // Check if Web Crypto API is available (requires HTTPS or localhost)
    if (!isCryptoAvailable()) {
      console.warn('[Encryption] Web Crypto API not available (HTTP context). Using base64 encoding instead.')
      console.warn('[Encryption] ⚠️ For production, use HTTPS to enable proper encryption!')
      // Fallback: Just base64 encode with a marker
      const encoded = btoa(plaintext)
      return `PLAIN:${encoded}`
    }

    console.info('[Encryption] Encrypting API key')

    // Generate IV
    const iv = generateIV()

    // Derive encryption key from salt
    const key = await deriveKey(salt)

    // Encrypt the plaintext
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv,
      },
      key,
      data
    )

    // Format: salt:iv:ciphertext (all base64)
    const saltB64 = arrayBufferToBase64(salt)
    const ivB64 = arrayBufferToBase64(iv)
    const encryptedB64 = arrayBufferToBase64(new Uint8Array(encrypted))

    return `${saltB64}:${ivB64}:${encryptedB64}`
  } catch (error) {
    console.error('[Encryption] Failed to encrypt API key:', error)
    throw new Error('Failed to encrypt API key')
  }
}

/**
 * Decrypt an encrypted API key
 * Input format: salt:iv:ciphertext (all base64 encoded) or PLAIN:base64
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  try {
    // Check for fallback format (non-secure context)
    if (encrypted.startsWith('PLAIN:')) {
      const encoded = encrypted.substring(6) // Remove 'PLAIN:' prefix
      return atob(encoded)
    }

    // Parse the encrypted string
    const parts = encrypted.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format')
    }

    const [saltB64, ivB64, encryptedB64] = parts
    const salt = base64ToArrayBuffer(saltB64)
    const iv = base64ToArrayBuffer(ivB64)
    const ciphertext = base64ToArrayBuffer(encryptedB64)

    // Derive encryption key from salt
    const key = await deriveKey(salt)

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv,
      },
      key,
      ciphertext
    )

    // Convert to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('[Encryption] Failed to decrypt API key:', error)
    throw new Error('Failed to decrypt API key. The encryption may be corrupted.')
  }
}

/**
 * Generate a new master salt
 */
export function generateMasterSalt(): Uint8Array {
  console.info('[Encryption] Generating new master salt')
  return generateSalt()
}
