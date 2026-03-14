import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { Card } from '../../../components/ui/card'
import { cn } from '../../../lib/utils'

interface WizardSectionProps
  extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  title?: string
  description?: string
  action?: ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning'
}

const toneStyles: Record<NonNullable<WizardSectionProps['tone']>, string> = {
  default: 'border-slate-200/75 bg-white/88',
  info: 'border-cyan-100 bg-cyan-50/82',
  success: 'border-emerald-100 bg-emerald-50/82',
  warning: 'border-amber-100 bg-amber-50/82',
}

export const WizardSection = ({
  action,
  children,
  className,
  description,
  title,
  tone = 'default',
  ...props
}: WizardSectionProps) => (
  <Card
    className={cn(
      'overflow-hidden rounded-[30px] border p-5 shadow-[0_28px_70px_-46px_rgba(15,23,42,0.28)] md:p-6',
      toneStyles[tone],
      className,
    )}
    {...props}
  >
    {title || description || action ? (
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          {title ? (
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
    ) : null}
    {children}
  </Card>
)
