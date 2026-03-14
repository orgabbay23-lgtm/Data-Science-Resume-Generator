import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'

export const Card = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div
    className={cn('glass-panel rounded-[30px] p-6 md:p-7', className)}
    {...props}
  >
    {children}
  </div>
)
