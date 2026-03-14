import type { TextareaHTMLAttributes } from 'react'
import type { GeminiFieldKind } from '../../lib/gemini-service'
import type {
  ResumeLanguage,
  TargetEmployerType,
  TargetTrack,
} from '../../types/resume'
import { cn } from '../../lib/utils'
import { AiImproveButton } from './ai-improve-button'
import { TextArea } from './textarea'

interface InlineAiTextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  onApply: (value: string) => void
  kind: GeminiFieldKind
  track: TargetTrack
  employer: TargetEmployerType
  language: ResumeLanguage
  label?: string
  textareaClassName?: string
}

export const InlineAiTextArea = ({
  className,
  employer,
  kind,
  label,
  language,
  onApply,
  onChange,
  rows = 5,
  textareaClassName,
  track,
  value,
  ...props
}: InlineAiTextAreaProps) => (
  <div className={cn('relative', className)}>
    <TextArea
      className={cn('min-h-36 ps-16', textareaClassName)}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      value={value}
      {...props}
    />
    <AiImproveButton
      className="absolute start-3 top-3 h-11 w-11 rounded-[18px]"
      employer={employer}
      kind={kind}
      label={label}
      language={language}
      onApply={onApply}
      track={track}
      value={value}
    />
  </div>
)
