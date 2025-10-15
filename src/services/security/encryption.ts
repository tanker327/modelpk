/**
 * Encryption service for API keys using Web Crypto API
 * Uses AES-GCM encryption with a master salt stored in IndexedDB
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM

/**
 * Check if a value is encrypted (has salt prefix)
 */
export function hasEncryptionSalt(value: string | undefined): boolean {
  if (!value) return false
  const parts = value.split(':')
  return parts.length === 3 && parts[0].length > 0
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
 * Derive an encryption key from a salt
 */
async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  // Use the salt as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    salt,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(16), // Additional salt for PBKDF2
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
 * Returns: salt:iv:ciphertext (all base64 encoded)
 */
export async function encryptApiKey(plaintext: string, salt: Uint8Array): Promise<string> {
  try {
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
 * Input format: salt:iv:ciphertext (all base64 encoded)
 */
export async function decryptApiKey(encrypted: string): Promise<string> {
  try {
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
