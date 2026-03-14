import type { PropsWithChildren, ReactNode } from 'react'
import { motion } from 'motion/react'
import { WIZARD_STEP_COUNT } from '../config/steps'

interface StepFrameProps extends PropsWithChildren {
  eyebrow?: string
  title: string
  description?: string
  footer: ReactNode
  stepIndex: number
  totalSteps?: number
}

export const StepFrame = ({
  children,
  description,
  eyebrow,
  footer,
  stepIndex,
  totalSteps = WIZARD_STEP_COUNT,
  title,
}: StepFrameProps) => {
  const progress = `${Math.min((stepIndex / totalSteps) * 100, 100)}%`

  return (
    <div className="flex min-h-[calc(100vh-10rem)] md:min-h-[min(780px,calc(100vh-6rem))] flex-col justify-between">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center space-y-8">
        <div className="space-y-5 text-center">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-500">
            <span>{eyebrow ?? `שלב ${stepIndex}`}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            <span>
              {stepIndex}/{totalSteps}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 md:text-[2.6rem]">
              {title}
            </h2>
            {description ? (
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                {description}
              </p>
            ) : null}
          </div>

          <div className="mx-auto h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-200/70">
            <motion.div
              animate={{ width: progress }}
              className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#0891b2_48%,#34d399_100%)]"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="space-y-4">{children}</div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between [&>*]:w-full sm:[&>*]:w-auto">
        {footer}
      </div>
    </div>
  )
}
