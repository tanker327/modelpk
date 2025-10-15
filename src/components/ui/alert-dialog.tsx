import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={variant === 'destructive' ? 'text-red-600' : ''}>
            {title}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={variant === 'destructive' ? 'text-red-600' : ''}>
            {title}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for using alerts
export function useAlert() {
  const [alertState, setAlertState] = useState<{
    open: boolean
    title: string
    description: string
    variant?: 'default' | 'destructive'
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'default',
  })

  const showAlert = (
    title: string,
    description: string,
    variant: 'default' | 'destructive' = 'default'
  ) => {
    setAlertState({ open: true, title, description, variant })
  }

  const AlertComponent = () => (
    <AlertDialog
      open={alertState.open}
      onOpenChange={(open) => setAlertState({ ...alertState, open })}
      title={alertState.title}
      description={alertState.description}
      variant={alertState.variant}
    />
  )

  return { showAlert, AlertComponent }
}

// Hook for using confirms
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void | Promise<void>
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  })

  const showConfirm = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string
      cancelText?: string
      variant?: 'default' | 'destructive'
    }
  ) => {
    setConfirmState({
      open: true,
      title,
      description,
      onConfirm,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      variant: options?.variant || 'default',
    })
  }

  const ConfirmComponent = () => (
    <ConfirmDialog
      open={confirmState.open}
      onOpenChange={(open) => setConfirmState({ ...confirmState, open })}
      title={confirmState.title}
      description={confirmState.description}
      onConfirm={confirmState.onConfirm}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      variant={confirmState.variant}
    />
  )

  return { showConfirm, ConfirmComponent }
}
