import { cn } from '../../lib/utils'
import type { BuilderMode } from '../../types/resume'

interface InputModeToggleProps {
  value: BuilderMode
  onChange: (value: BuilderMode) => void
  guidedLabel?: string
  manualLabel?: string
  className?: string
}

export const InputModeToggle = ({
  value,
  onChange,
  guidedLabel = 'הצעות',
  manualLabel = 'אחר / מותאם',
  className,
}: InputModeToggleProps) => (
  <div
    className={cn(
      'inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-slate-50/90 p-1',
      className,
    )}
  >
    {[
      { key: 'guided', label: guidedLabel },
      { key: 'manual', label: manualLabel },
    ].map((option) => {
      const selected = value === option.key

      return (
        <button
          className={cn(
            'rounded-full px-3 py-1.5 text-[0.72rem] font-semibold transition',
            selected
              ? 'bg-white text-cyan-950 shadow-[0_12px_24px_-18px_rgba(6,182,212,0.5)]'
              : 'text-slate-500 hover:text-slate-700',
          )}
          key={option.key}
          onClick={() => onChange(option.key as BuilderMode)}
          type="button"
        >
          {option.label}
        </button>
      )
    })}
  </div>
)
