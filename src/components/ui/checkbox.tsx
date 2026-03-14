import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, description, disabled, label, ...props }, ref) => (
    <label
      className={cn(
        'group flex cursor-pointer items-start gap-3 rounded-[24px] border border-slate-200/80 bg-white/85 px-4 py-3.5 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white',
        disabled && 'cursor-not-allowed opacity-60 hover:translate-y-0',
        className,
      )}
    >
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
        <input
          className="peer sr-only"
          disabled={disabled}
          ref={ref}
          type="checkbox"
          {...props}
        />
        <span className="flex size-5 items-center justify-center rounded-md border border-slate-300 bg-white shadow-sm transition peer-checked:border-cyan-500 peer-checked:bg-cyan-500 peer-focus-visible:ring-4 peer-focus-visible:ring-cyan-100 peer-disabled:border-slate-200 peer-disabled:bg-slate-100">
          <Check className="size-3.5 scale-0 text-white transition peer-checked:scale-100" />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold tracking-[-0.01em] text-slate-900">
          {label}
        </span>
        {description ? (
          <span className="mt-1 block text-sm leading-6 text-slate-500">{description}</span>
        ) : null}
      </span>
    </label>
  ),
)

Checkbox.displayName = 'Checkbox'
