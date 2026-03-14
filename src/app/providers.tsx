import type { PropsWithChildren } from 'react'
import { ToastProvider } from '../components/ui/toast-provider'

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ToastProvider>{children}</ToastProvider>
)
