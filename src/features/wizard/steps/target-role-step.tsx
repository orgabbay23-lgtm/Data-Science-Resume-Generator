import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BriefcaseBusiness, Cpu, Database, FlaskConical } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ChoiceChip } from '../../../components/ui/choice-chip'
import { FieldShell } from '../../../components/ui/field-shell'
import { HelpPopover } from '../../../components/ui/help-popover'
import { InlineAiTextArea } from '../../../components/ui/inline-ai-textarea'
import { SearchableCombobox } from '../../../components/ui/searchable-combobox'
import {
  employerModeOptions,
  israeliFieldHints,
} from '../../../data/options/israel-resume-options'
import {
  getCareerTrackConfig,
  getRoleTitleSuggestions,
} from '../../../data/options/career-track-options'
import { buildProfessionalSummary } from '../../../lib/resume-helpers'
import {
  targetRoleSchema,
  type TargetRoleFormValues,
} from '../../../schemas/resume-schemas'
import { useResumeStore } from '../../../store/resume-store'
import type { TargetEmployerType, TargetTrack } from '../../../types/resume'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface TargetRoleStepProps {
  onNext: () => void
  onPrevious: () => void
}

const trackCards: Array<{
  value: TargetTrack
  icon: typeof FlaskConical
}> = [
  { value: 'ds', icon: FlaskConical },
  { value: 'mle', icon: Cpu },
  { value: 'de', icon: Database },
]

const employerCards: TargetEmployerType[] = ['startup', 'mnc']

export const TargetRoleStep = ({ onNext, onPrevious }: TargetRoleStepProps) => {
  const data = useResumeStore((state) => state.data)
  const updateTargetRole = useResumeStore((state) => state.updateTargetRole)
  const [showMore, setShowMore] = useState(false)

  const form = useForm<TargetRoleFormValues>({
    resolver: zodResolver(targetRoleSchema),
    defaultValues: data.targetRole,
  })

  const values = useWatch({ control: form.control })
  const track = useWatch({ control: form.control, name: 'targetTrack' }) ?? 'ds'
  const targetEmployer =
    useWatch({ control: form.control, name: 'targetEmployer' }) ?? 'startup'
  const summaryMode = useWatch({ control: form.control, name: 'summaryMode' }) ?? 'guided'
  const trackConfig = useMemo(() => getCareerTrackConfig(track), [track])
  const titleOptions = useMemo(() => getRoleTitleSuggestions(track), [track])
  const generatedSummary = useMemo(
    () =>
      buildProfessionalSummary({
        ...data,
        targetRole: {
          targetTrack: track,
          targetTitle: values.targetTitle ?? trackConfig.defaultTargetTitle,
          targetEmployer,
          summaryMode,
          summaryManualText: values.summaryManualText ?? '',
        },
      }),
    [
      data,
      summaryMode,
      targetEmployer,
      track,
      trackConfig.defaultTargetTitle,
      values.summaryManualText,
      values.targetTitle,
    ],
  )

  useEffect(() => {
    updateTargetRole({
      targetTrack: values.targetTrack ?? 'ds',
      targetTitle: values.targetTitle ?? trackConfig.defaultTargetTitle,
      targetEmployer: values.targetEmployer ?? 'startup',
      summaryMode: values.summaryMode ?? 'guided',
      summaryManualText: values.summaryManualText ?? '',
    })
  }, [trackConfig.defaultTargetTitle, updateTargetRole, values])

  useEffect(() => {
    if (!values.targetTitle?.trim()) {
      form.setValue('targetTitle', trackConfig.defaultTargetTitle, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }, [form, trackConfig.defaultTargetTitle, values.targetTitle])

  return (
    <form onSubmit={form.handleSubmit(() => onNext())}>
      <StepFrame
        description="מגדירים מסלול חד וברור. מכאן והלאה המערכת תדחוף את כל הניסוח לאנגלית של השוק הישראלי: קצר, ישיר, ועם מספרים."
        eyebrow="שלב 3"
        footer={
          <>
            <Button onClick={onPrevious} type="button" variant="secondary">
              חזרה
            </Button>
            <Button type="submit">המשך</Button>
          </>
        }
        stepIndex={3}
        title="תפקיד היעד"
      >
        <WizardSection title="המסלול שלכם">
          <div className="grid gap-3 lg:grid-cols-3">
            {trackCards.map((option) => {
              const currentTrack = getCareerTrackConfig(option.value)
              const Icon = option.icon

              return (
                <ChoiceChip
                  checked={track === option.value}
                  description={currentTrack.description}
                  icon={<Icon className="size-4" />}
                  key={option.value}
                  label={`${currentTrack.shortLabel} | ${currentTrack.label}`}
                  onToggle={() =>
                    form.setValue('targetTrack', option.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              )
            })}
          </div>
        </WizardSection>

        <WizardSection
          description="אותו מועמד ייראה אחרת בסטארטאפ לעומת מרכז פיתוח גלובלי. בוחרים את הנרטיב מראש."
          title="סוג החברה"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {employerCards.map((option) => (
              <ChoiceChip
                checked={targetEmployer === option}
                description={employerModeOptions[option].description}
                key={option}
                label={employerModeOptions[option].label}
                onToggle={() =>
                  form.setValue('targetEmployer', option, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            ))}
          </div>
          <div className="mt-4 rounded-[22px] border border-cyan-100 bg-cyan-50/80 px-4 py-4 text-sm leading-6 text-slate-700">
            <span className="font-semibold text-slate-900">טכלאס:</span>{' '}
            {employerModeOptions[targetEmployer].strategy}
          </div>
        </WizardSection>

        <WizardSection title="כותרת יעד">
          <FieldShell
            error={form.formState.errors.targetTitle?.message}
            label="איך יקראו לכם בקובץ?"
            labelSuffix={
              <HelpPopover title={israeliFieldHints.targetEmployer.title}>
                {israeliFieldHints.targetEmployer.body}
              </HelpPopover>
            }
            required
          >
            <SearchableCombobox
              customActionLabel="כתבו כותרת אחרת"
              dir="ltr"
              onOptionSelect={(option) =>
                form.setValue('targetTitle', option.label, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onValueChange={(nextValue) =>
                form.setValue('targetTitle', nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              options={titleOptions}
              placeholder="Junior Data Scientist / LLM Engineer / Analytics Engineer"
              value={values.targetTitle ?? ''}
            />
          </FieldShell>
        </WizardSection>

        <WizardSection
          action={
            <button
              className="text-sm font-semibold text-cyan-800 transition hover:text-cyan-950"
              onClick={() =>
                form.setValue('summaryMode', summaryMode === 'guided' ? 'manual' : 'guided', {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              type="button"
            >
              {summaryMode === 'guided' ? 'עריכה ידנית' : 'חזרה לניסוח אוטומטי'}
            </button>
          }
          title="תקציר"
        >
          {summaryMode === 'guided' ? (
            <div className="rounded-[26px] border border-slate-200/80 bg-white/88 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cyan-800">
                <BriefcaseBusiness className="size-4" />
                <span>ניסוח אוטומטי</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">{generatedSummary}</p>
            </div>
          ) : (
            <FieldShell
              error={form.formState.errors.summaryManualText?.message}
              label="תקציר מותאם"
              labelSuffix={
                <HelpPopover title={israeliFieldHints.summary.title}>
                  {israeliFieldHints.summary.body}
                </HelpPopover>
              }
            >
              <InlineAiTextArea
                employer={targetEmployer}
                kind="summary"
                label="תקציר מותאם"
                language={data.resumeLanguage}
                onApply={(nextValue) =>
                  form.setValue('summaryManualText', nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onChange={(nextValue) =>
                  form.setValue('summaryManualText', nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                placeholder="Write rough notes in Hebrew or English. The wand will rewrite them into sharp English."
                track={track}
                value={values.summaryManualText ?? ''}
              />
            </FieldShell>
          )}
        </WizardSection>

        <WizardSection
          action={
            <button
              className="text-sm font-semibold text-cyan-800 transition hover:text-cyan-950"
              onClick={() => setShowMore((current) => !current)}
              type="button"
            >
              {showMore ? 'הסתר' : 'הצג עוד'}
            </button>
          }
          description="מילות מפתח וכיוון אסטרטגי למסלול שבחרתם."
          title="עוד עוגנים למסלול"
        >
          {showMore ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {trackConfig.keywords.map((keyword) => (
                  <span
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950"
                    key={keyword}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-6 text-slate-600">{trackConfig.resumeStrategy}</p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              אפשר להמשיך בלי לגעת בזה. המסלול שבחרתם כבר מכוון את התקציר, המילים, והטון.
            </p>
          )}
        </WizardSection>
      </StepFrame>
    </form>
  )
}
