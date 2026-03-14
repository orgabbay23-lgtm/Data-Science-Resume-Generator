import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        'h-13 w-full rounded-[22px] border border-slate-200/85 bg-white/90 px-4 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_20px_42px_-32px_rgba(15,23,42,0.38)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
