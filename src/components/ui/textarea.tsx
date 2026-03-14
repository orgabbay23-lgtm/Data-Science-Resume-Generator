import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea
    className={cn(
      'min-h-32 w-full rounded-[24px] border border-slate-200/85 bg-white/90 px-4 py-3.5 text-sm leading-6 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_20px_42px_-32px_rgba(15,23,42,0.38)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400',
      className,
    )}
    ref={ref}
    rows={rows}
    {...props}
  />
))

TextArea.displayName = 'TextArea'
