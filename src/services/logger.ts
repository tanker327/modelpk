/**
 * Centralized logging service using loglevel
 *
 * Provides consistent logging across the application with environment-based
 * log level control. In production, only warnings and errors are shown.
 * In development, all log levels are visible.
 *
 * Usage:
 *   import { logger } from '@/services/logger'
 *   logger.info('User logged in')
 *   logger.warn('API rate limit approaching')
 *   logger.error('Failed to save config', error)
 *
 * Log Levels (in order of severity):
 *   - trace: Very detailed debugging (not used in production)
 *   - debug: Detailed debugging information
 *   - info: General informational messages
 *   - warn: Warning messages (potential issues)
 *   - error: Error messages (failures)
 *   - silent: No logging
 */

import log from 'loglevel'

// Configure log level based on environment
const LOG_LEVEL = import.meta.env.PROD ? 'warn' : 'info'

// Set the log level
log.setLevel(LOG_LEVEL as log.LogLevelDesc)

// Add custom prefix to make logs easier to identify
const originalFactory = log.methodFactory
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)

  return function (...args) {
    const prefix = `[ModelPK]`
    rawMethod(prefix, ...args)
  }
}

// Apply the custom method factory
log.setLevel(log.getLevel())

/**
 * Main application logger
 *
 * Available methods:
 * - logger.trace(...args) - Very detailed debugging
 * - logger.debug(...args) - Debug information
 * - logger.info(...args)  - Info messages (hidden in production)
 * - logger.warn(...args)  - Warnings (shown in production)
 * - logger.error(...args) - Errors (shown in production)
 */
export const logger = log

/**
 * Create a namespaced logger for a specific module
 * This helps identify which part of the app generated a log message
 *
 * @param namespace - The module name (e.g., 'Encryption', 'ConfigStorage')
 * @returns A logger instance with the namespace prefix
 *
 * @example
 * const log = createLogger('Encryption')
 * log.info('Encrypting API key') // Output: [ModelPK][Encryption] Encrypting API key
 */
export function createLogger(namespace: string) {
  return {
    trace: (...args: unknown[]) => logger.trace(`[${namespace}]`, ...args),
    debug: (...args: unknown[]) => logger.debug(`[${namespace}]`, ...args),
    info: (...args: unknown[]) => logger.info(`[${namespace}]`, ...args),
    warn: (...args: unknown[]) => logger.warn(`[${namespace}]`, ...args),
    error: (...args: unknown[]) => logger.error(`[${namespace}]`, ...args),
  }
}

/**
 * Set the log level dynamically at runtime
 * Useful for debugging in production
 *
 * @example
 * // Enable debug logs in production console
 * import { setLogLevel } from '@/services/logger'
 * setLogLevel('debug')
 */
export function setLogLevel(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent') {
  logger.setLevel(level)
}

// Log the current log level on startup (only in development)
if (import.meta.env.DEV) {
  logger.info(`Log level set to: ${LOG_LEVEL}`)
}
