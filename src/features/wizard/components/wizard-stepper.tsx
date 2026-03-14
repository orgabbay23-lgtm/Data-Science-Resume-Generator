import { motion } from 'motion/react'
import { cn } from '../../../lib/utils'
import { wizardSteps } from '../config/steps'

interface WizardStepperProps {
  currentStep: number
  onStepSelect?: (step: number) => void
}

export const WizardStepper = ({ currentStep, onStepSelect }: WizardStepperProps) => {
  const progress = `${Math.min(((currentStep + 1) / wizardSteps.length) * 100, 100)}%`

  return (
    <div className="rounded-[34px] border border-white/75 bg-white/72 p-4 shadow-[0_26px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur-sm md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            מסלול ההתקדמות
          </div>
          <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            שלב {currentStep + 1} מתוך {wizardSteps.length}
          </div>
        </div>
        <div className="text-sm text-slate-500">
          אפשר לחזור לכל שלב פתוח בלי לאבד את מצב התצוגה המקדימה החיה.
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <motion.div
          animate={{ width: progress }}
          className="h-full rounded-full bg-gradient-to-l from-cyan-500 via-sky-500 to-emerald-400"
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7">
        {wizardSteps.map((step, index) => {
          const Icon = step.icon
          const state =
            index === currentStep ? 'active' : index < currentStep ? 'complete' : 'idle'
          const canSelect = Boolean(onStepSelect) && index <= currentStep

          return (
            <motion.button
              className={cn(
                'rounded-[28px] border px-4 py-4 text-start transition duration-200',
                state === 'active' &&
                  'border-cyan-300 bg-[linear-gradient(135deg,rgba(236,254,255,0.95),rgba(224,242,254,0.92))] text-cyan-950 shadow-[0_24px_48px_-34px_rgba(6,182,212,0.58)]',
                state === 'complete' &&
                  'border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(220,252,231,0.9))] text-emerald-900',
                state === 'idle' &&
                  'border-white/80 bg-white/78 text-slate-500 hover:border-slate-200 hover:bg-white',
                !canSelect && 'cursor-not-allowed opacity-75',
              )}
              disabled={!canSelect}
              initial={false}
              key={step.title}
              layout
              onClick={() => onStepSelect?.(index)}
              type="button"
              whileHover={canSelect ? { y: -2 } : undefined}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-2xl border text-sm transition',
                    state === 'active' &&
                      'border-cyan-500 bg-cyan-500 text-white shadow-sm shadow-cyan-500/30',
                    state === 'complete' &&
                      'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
                    state === 'idle' && 'border-slate-200 bg-slate-50 text-slate-500',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </div>
                  <div className="truncate text-sm font-semibold tracking-[-0.01em]">
                    {step.title}
                  </div>
                  <div className="mt-1 text-xs text-current/70">
                    {state === 'complete'
                      ? 'נפתח'
                      : state === 'active'
                        ? 'נוכחי'
                        : 'ממתין'}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
