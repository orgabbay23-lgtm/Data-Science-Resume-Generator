import { useEffect, type PropsWithChildren } from 'react'
import { ToastProvider } from '../components/ui/toast-provider'
import { useAuthStore } from '../store/auth-store'

export const AppProviders = ({ children }: PropsWithChildren) => {
  const initializeAuth = useAuthStore((state) => state.initialize)

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => unsubscribe()
  }, [initializeAuth])

  return <ToastProvider>{children}</ToastProvider>
}
