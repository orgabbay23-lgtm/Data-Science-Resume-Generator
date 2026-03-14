import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ToastContext,
  type ToastContextValue,
  type ToastPayload,
  type ToastTone,
} from './toast-context'

interface ToastRecord extends ToastPayload {
  id: string
}

const toneStyles: Record<ToastTone, string> = {
  error:
    'border-rose-200 bg-[linear-gradient(135deg,rgba(255,241,242,0.96),rgba(255,247,237,0.96))] text-rose-950',
  success:
    'border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(240,253,250,0.96))] text-emerald-950',
  info:
    'border-cyan-200 bg-[linear-gradient(135deg,rgba(236,254,255,0.96),rgba(240,249,255,0.96))] text-cyan-950',
}

const toneIcons = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
} as const

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), toast.durationMs ?? 4200),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [removeToast, toasts])

  const value = useMemo<ToastContextValue>(
    () => ({
      pushToast: (toast) =>
        setToasts((current) => [
          ...current,
          { ...toast, id: crypto.randomUUID(), tone: toast.tone ?? 'info' },
        ]),
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-3 sm:start-auto sm:w-[360px]"
        dir="rtl"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = toneIcons[toast.tone ?? 'info']

            return (
              <motion.div
                animate={{ opacity: 1, x: 0, y: 0 }}
                className={`pointer-events-auto rounded-[24px] border p-4 shadow-[0_28px_70px_-34px_rgba(15,23,42,0.42)] backdrop-blur ${toneStyles[toast.tone ?? 'info']}`}
                exit={{ opacity: 0, x: 18, y: -10 }}
                initial={{ opacity: 0, x: 18, y: -10 }}
                key={toast.id}
                layout
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70">
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-[-0.02em]">
                      {toast.title}
                    </div>
                    {toast.message ? (
                      <div className="mt-1 text-sm leading-6 opacity-80">{toast.message}</div>
                    ) : null}
                  </div>
                  <button
                    className="flex size-8 shrink-0 items-center justify-center rounded-2xl text-current/60 transition hover:bg-white/60 hover:text-current"
                    onClick={() => removeToast(toast.id)}
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
