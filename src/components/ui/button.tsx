import { forwardRef, type ButtonHTMLAttributes, type PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-slate-950 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.85)] hover:bg-slate-900 hover:shadow-[0_28px_70px_-30px_rgba(15,23,42,0.95)] focus-visible:ring-slate-950/10 disabled:bg-slate-300',
  secondary:
    'border border-slate-200/80 bg-white/88 text-slate-900 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.55)] hover:border-cyan-200 hover:bg-cyan-50/60 hover:text-cyan-950 focus-visible:ring-cyan-100 disabled:text-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-white/82 hover:text-slate-950 focus-visible:bg-white/82 focus-visible:ring-slate-200/80 disabled:text-slate-400',
  danger:
    'bg-rose-600 text-white shadow-[0_24px_55px_-30px_rgba(225,29,72,0.6)] hover:bg-rose-500 focus-visible:ring-rose-100 disabled:bg-rose-300',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-10 rounded-2xl px-4 text-sm',
  md: 'h-12 rounded-[20px] px-5 text-sm font-medium',
  lg: 'h-14 rounded-[22px] px-6 text-sm font-semibold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-normal text-center font-medium tracking-[-0.01em] outline-none transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:ring-4 disabled:cursor-not-allowed disabled:translate-y-0 disabled:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
