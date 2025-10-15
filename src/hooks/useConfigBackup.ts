import { useState, useRef } from 'react'
import { exportConfigs, importConfigs } from '@/services/storage/configStorage'
import { providerConfigsActions } from '@/state/atoms/providerConfigsAtom'
import type { ProviderConfig } from '@/schemas/providerConfigSchema'

interface BackupMessage {
  type: 'success' | 'error'
  text: string
}

interface UseConfigBackupReturn {
  isExporting: boolean
  isImporting: boolean
  exportMessage: BackupMessage | null
  fileInputRef: React.RefObject<HTMLInputElement>
  handleExport: () => Promise<void>
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleImportClick: () => void
}

/**
 * Hook for handling configuration export/import (backup & restore)
 */
export function useConfigBackup(
  setConfigs: (configs: ProviderConfig[]) => void
): UseConfigBackupReturn {
  const [exportMessage, setExportMessage] = useState<BackupMessage | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)
    setExportMessage(null)

    try {
      const jsonData = await exportConfigs()

      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-racers-config-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportMessage({ type: 'success', text: 'Configuration exported successfully!' })
      console.info('[useConfigBackup] Configuration exported')
    } catch (error) {
      console.error('[useConfigBackup] Export failed:', error)
      setExportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to export configuration',
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setExportMessage(null)

    try {
      const text = await file.text()
      const result = await importConfigs(text)

      if (result.errors.length > 0) {
        setExportMessage({
          type: 'error',
          text: `Imported ${result.imported} providers with ${result.errors.length} errors: ${result.errors.join(', ')}`,
        })
      } else {
        setExportMessage({
          type: 'success',
          text: `Successfully imported ${result.imported} provider configurations!`,
        })
      }

      // Reload configs
      await providerConfigsActions.init()
      const loadedConfigs = providerConfigsActions.getConfigs()
      setConfigs(loadedConfigs)

      console.info('[useConfigBackup] Configuration imported:', result)
    } catch (error) {
      console.error('[useConfigBackup] Import failed:', error)
      setExportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import configuration',
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  return {
    isExporting,
    isImporting,
    exportMessage,
    fileInputRef,
    handleExport,
    handleImport,
    handleImportClick,
  }
}
