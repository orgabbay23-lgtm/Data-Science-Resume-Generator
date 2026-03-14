import { startTransition, useState } from 'react'
import { WandSparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'
import {
  improveResumeText,
  type GeminiFieldKind,
} from '../../lib/gemini-service'
import { useToast } from './toast-context'
import type {
  ResumeLanguage,
  TargetEmployerType,
  TargetTrack,
} from '../../types/resume'

interface AiImproveButtonProps {
  value: string
  onApply: (value: string) => void
  kind: GeminiFieldKind
  track: TargetTrack
  employer: TargetEmployerType
  language: ResumeLanguage
  label?: string
  className?: string
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'לא ניתן היה להשלים את השכתוב בעזרת AI.'

export const AiImproveButton = ({
  className,
  employer,
  kind,
  label,
  language,
  onApply,
  track,
  value,
}: AiImproveButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { pushToast } = useToast()

  const handleImprove = async () => {
    if (!value.trim() || isLoading) {
      return
    }

    try {
      setIsLoading(true)
      const improved = await improveResumeText({
        employer,
        kind,
        label,
        language,
        text: value,
        track,
      })

      if (!improved) {
        throw new Error('המודל החזיר תשובה ריקה.')
      }

      startTransition(() => onApply(improved))
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'שכתוב בעזרת AI נכשל',
        message: getErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className={cn(
        'group inline-flex h-12 w-12 items-center justify-center rounded-[20px] border border-slate-200/85 bg-white/92 text-lg shadow-[0_18px_40px_-28px_rgba(15,23,42,0.42)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0',
      className,
      )}
      disabled={!value.trim() || isLoading}
      onClick={handleImprove}
      title="חדדו לאנגלית של מגייס/ת בתל אביב"
      type="button"
    >
      <motion.span
        animate={
          isLoading
            ? {
                opacity: [0.6, 1, 0.6],
                rotate: [0, 14, -12, 0],
                scale: [0.92, 1.08, 0.92],
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
        <WandSparkles className="size-5" />
      </motion.span>
      <span className="sr-only">חדדו לאנגלית של מגייס/ת בתל אביב</span>
    </button>
  )
}
