import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ children, className, ...props }, ref) => (
    <div className="relative">
      <select
        className={cn(
          'peer h-13 w-full appearance-none rounded-[22px] border border-slate-200/85 bg-white/90 px-4 pe-14 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_20px_42px_-32px_rgba(15,23,42,0.38)] outline-none transition duration-200 hover:border-slate-300 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-2 start-2.5 flex w-9 items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-50/90 text-slate-400 transition peer-focus:border-cyan-200 peer-focus:bg-cyan-50 peer-focus:text-cyan-600">
        <ChevronDown className="size-4" />
      </span>
    </div>
  ),
)

Select.displayName = 'Select'
