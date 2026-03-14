import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'
import type {
  ResumeLanguage,
  TargetEmployerType,
  TargetTrack,
} from '../../types/resume'
import type { GeminiFieldKind } from '../../lib/gemini-service'
import { AiImproveButton } from './ai-improve-button'

interface AiFieldActionProps extends PropsWithChildren {
  value: string
  onApply: (value: string) => void
  kind: GeminiFieldKind
  track: TargetTrack
  employer: TargetEmployerType
  language: ResumeLanguage
  label?: string
  className?: string
}

export const AiFieldAction = ({
  children,
  className,
  employer,
  kind,
  label,
  language,
  onApply,
  track,
  value,
}: AiFieldActionProps) => (
  <div
    className={cn(
      'grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start',
      className,
    )}
  >
    <div className="min-w-0">{children}</div>
    <div className="flex justify-end md:pt-1">
      <AiImproveButton
        employer={employer}
        kind={kind}
        label={label}
        language={language}
        onApply={onApply}
        track={track}
        value={value}
      />
    </div>
  </div>
)
