import { createContext, useContext } from 'react'

export type ToastTone = 'error' | 'success' | 'info'

export interface ToastPayload {
  title: string
  message?: string
  tone?: ToastTone
  durationMs?: number
}

export interface ToastContextValue {
  pushToast: (toast: ToastPayload) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider.')
  }

  return context
}
