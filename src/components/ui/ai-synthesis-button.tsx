import { startTransition, useState, type ReactNode } from 'react'
import { WandSparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'
import { useToast } from './toast-context'

interface AiSynthesisButtonProps {
  onGenerate: () => Promise<string>
  onApply: (value: string) => void
  disabled?: boolean
  className?: string
  children: ReactNode
  loadingLabel?: string
  errorTitle?: string
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'לא ניתן היה ליצור ניסוח אוטומטי בעזרת AI.'

export const AiSynthesisButton = ({
  children,
  className,
  disabled = false,
  errorTitle = 'יצירת ניסוח אוטומטי נכשלה',
  loadingLabel = 'AI עובד...',
  onApply,
  onGenerate,
}: AiSynthesisButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { pushToast } = useToast()

  const handleClick = async () => {
    if (disabled || isLoading) {
      return
    }

    try {
      setIsLoading(true)
      const generated = await onGenerate()

      if (!generated.trim()) {
        throw new Error('המודל החזיר תשובה ריקה.')
      }

      startTransition(() => onApply(generated))
    } catch (error) {
      pushToast({
        tone: 'error',
        title: errorTitle,
        message: getErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className={cn(
        'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[20px] border border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(254,243,199,0.92))] px-4 py-3 text-sm font-semibold text-amber-950 shadow-[0_24px_55px_-34px_rgba(217,119,6,0.34)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-[linear-gradient(135deg,rgba(255,247,237,1),rgba(253,230,138,0.96))] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 sm:w-auto',
        className,
      )}
      disabled={disabled || isLoading}
      onClick={handleClick}
      type="button"
    >
      <motion.span
        animate={
          isLoading
            ? {
                opacity: [0.6, 1, 0.6],
                rotate: [0, 12, -10, 0],
                scale: [0.94, 1.06, 0.94],
              }
            : { opacity: 1, rotate: 0, scale: 1 }
        }
        aria-hidden="true"
        transition={
          isLoading
            ? { duration: 0.9, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }
            : { duration: 0.2, ease: 'easeOut' }
        }
      >
        <WandSparkles className="size-4" />
      </motion.span>
      <span>{isLoading ? loadingLabel : children}</span>
    </button>
  )
}
