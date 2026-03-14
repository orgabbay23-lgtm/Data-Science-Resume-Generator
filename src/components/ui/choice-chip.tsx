import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ChoiceChipProps {
  checked: boolean
  label: string
  description?: string
  icon?: ReactNode
  onToggle: () => void
}

export const ChoiceChip = ({
  checked,
  description,
  icon,
  label,
  onToggle,
}: ChoiceChipProps) => (
  <motion.button
    className={cn(
      'group flex min-h-[82px] w-full items-start justify-between gap-3 rounded-[24px] border px-4 py-4 text-start outline-none transition duration-200',
      checked
        ? 'border-cyan-400/90 bg-[linear-gradient(135deg,rgba(236,254,255,0.92),rgba(224,242,254,0.94))] text-cyan-950 shadow-[0_24px_60px_-36px_rgba(6,182,212,0.62)]'
        : 'border-slate-200/80 bg-white/82 text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.4)] hover:border-cyan-200 hover:bg-white hover:shadow-[0_22px_48px_-34px_rgba(15,23,42,0.48)]',
    )}
    layout
    onClick={onToggle}
    type="button"
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.99 }}
  >
    <span className="flex items-start gap-3">
      <span
        className={cn(
          'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border text-sm transition',
          checked
            ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
            : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-cyan-200 group-hover:text-cyan-600',
        )}
      >
        {checked ? (
          <Check className="size-4" />
        ) : icon ? (
          icon
        ) : (
          <span className="size-2 rounded-full bg-current/80" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold tracking-[-0.01em]">{label}</span>
        {description ? (
          <span className="mt-1 text-xs leading-5 text-slate-500">{description}</span>
        ) : null}
      </span>
    </span>
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition',
        checked
          ? 'bg-white/75 text-cyan-700'
          : 'bg-slate-100/80 text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600',
      )}
    >
      {checked ? 'נבחר' : 'בחרו'}
    </span>
  </motion.button>
)
