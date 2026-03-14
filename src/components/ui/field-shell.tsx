import type { PropsWithChildren, ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FieldShellProps extends PropsWithChildren {
  label: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  labelSuffix?: ReactNode
}

export const FieldShell = ({
  children,
  className,
  description,
  error,
  label,
  labelSuffix,
  required,
}: FieldShellProps) => (
  <label className={cn('flex flex-col gap-3', className)}>
    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-[-0.01em] text-slate-900">
      <span>{label}</span>
      {required ? <span className="text-rose-500">*</span> : null}
      {labelSuffix}
    </span>
    {description ? (
      <span className="text-sm leading-6 text-slate-500">{description}</span>
    ) : null}
    {children}
    {error ? (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-rose-600">
        <CircleAlert className="size-4 shrink-0" />
        <span>{error}</span>
      </span>
    ) : null}
  </label>
)
