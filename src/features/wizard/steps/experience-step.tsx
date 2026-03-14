import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { AiSynthesisButton } from '../../../components/ui/ai-synthesis-button'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { FieldShell } from '../../../components/ui/field-shell'
import { InlineAiTextArea } from '../../../components/ui/inline-ai-textarea'
import { Input } from '../../../components/ui/input'
import { SearchableChipMultiSelect } from '../../../components/ui/searchable-chip-multi-select'
import { TextArea } from '../../../components/ui/textarea'
import { synthesizeResumeTextFromStructuredData } from '../../../lib/gemini-service'
import { getProjectTechnologyChoices } from '../../../lib/resume-helpers'
import { splitCommaSeparated, splitMultilineText } from '../../../lib/utils'
import {
  defaultExperienceFormValues,
  experienceSchema,
  type ExperienceFormValues,
} from '../../../schemas/resume-schemas'
import { useResumeStore } from '../../../store/resume-store'
import {
  createEmptyExperience,
  ensureExperienceEntry,
} from '../../../types/resume'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface ExperienceStepProps {
  onNext: () => void
  onPrevious: () => void
}

export const ExperienceStep = ({ onNext, onPrevious }: ExperienceStepProps) => {
  const data = useResumeStore((state) => state.data)
  const updateExperienceSection = useResumeStore((state) => state.updateExperienceSection)
  const technologyChoices = getProjectTechnologyChoices(data)

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues:
      data.experiences.length > 0
        ? {
            experiences: data.experiences.map((experience) => ensureExperienceEntry(experience)),
          }
        : defaultExperienceFormValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'experiences',
  })

  const values = useWatch({ control: form.control })

  useEffect(() => {
    updateExperienceSection(
      (values.experiences ?? []).length > 0,
      (values.experiences ?? []).map((experience) => ensureExperienceEntry(experience)),
    )
  }, [updateExperienceSection, values.experiences])

  const syncExperienceSummary = (experienceIndex: number, nextSummary: string) => {
    form.setValue(`experiences.${experienceIndex}.summary`, nextSummary, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue(`experiences.${experienceIndex}.bullets.0`, nextSummary, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const syncExperienceSecondaryBullet = (experienceIndex: number, nextBullet: string) => {
    form.setValue(`experiences.${experienceIndex}.bullets.1`, nextBullet, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const applyStructuredExperienceSummary = (experienceIndex: number, nextSummary: string) => {
    const lines = splitMultilineText(nextSummary)

    if (lines.length === 0) {
      return
    }

    syncExperienceSummary(experienceIndex, lines[0])

    if (lines[1]) {
      syncExperienceSecondaryBullet(experienceIndex, lines[1])
    }
  }

  const setExperienceTechStack = (experienceIndex: number, nextSelection: string[]) => {
    form.setValue(`experiences.${experienceIndex}.techStack`, nextSelection, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue(`experiences.${experienceIndex}.techStackOther`, '', {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const buildExperienceSynthesisContext = (
    experience: ReturnType<typeof ensureExperienceEntry>,
  ) => {
    const techStack = Array.from(
      new Set([...experience.techStack, ...splitCommaSeparated(experience.techStackOther)]),
    ).filter(Boolean)

    return [
      experience.role ? `Role: ${experience.role}` : '',
      experience.company ? `Company or organization: ${experience.company}` : '',
      experience.startDate ? `Start date: ${experience.startDate}` : '',
      experience.isCurrent
        ? 'Current role: yes'
        : experience.endDate
          ? `End date: ${experience.endDate}`
          : '',
      experience.goal ? `Bottom line or ownership area: ${experience.goal}` : '',
      techStack.length > 0 ? `Tech stack: ${techStack.join(', ')}` : '',
      experience.summary ? `Existing summary draft: ${experience.summary}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <form onSubmit={form.handleSubmit(() => onNext())}>
      <StepFrame
        description="זה המקום לניסיון אזרחי, התמחות, מעבדה, סטודנט או עבודה קודמת. כותבים קצר, חד, ורק מה שמחזק את הסיפור."
        eyebrow="שלב 6"
        footer={
          <>
            <Button onClick={onPrevious} type="button" variant="secondary">
              חזרה
            </Button>
            <Button type="submit">המשך</Button>
          </>
        }
        stepIndex={6}
        title="ניסיון נוסף"
      >
        {fields.length === 0 ? (
          <WizardSection
            description="אם הפרויקטים והשירות כבר עושים את העבודה, אפשר להשאיר את החלק הזה ריק."
            title="אפשר גם לדלג"
            tone="info"
          >
            <Button onClick={() => append(createEmptyExperience())} type="button" variant="secondary">
              <Plus className="size-4" />
              הוסף ניסיון
            </Button>
          </WizardSection>
        ) : null}

        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {fields.map((field, index) => {
              const experience = ensureExperienceEntry(
                values.experiences?.[index] as Parameters<typeof ensureExperienceEntry>[0],
              )
              const fieldError = form.formState.errors.experiences?.[index]
              const techStack = Array.from(
                new Set([...experience.techStack, ...splitCommaSeparated(experience.techStackOther)]),
              )
              const canGenerateExperienceSummary = Boolean(
                experience.role.trim() ||
                  experience.company.trim() ||
                  experience.goal.trim() ||
                  techStack.length > 0,
              )

              return (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: 10 }}
                  key={field.id}
                  layout
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <WizardSection
                    action={
                      <Button
                        onClick={() => remove(index)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                        הסר
                      </Button>
                    }
                    title={`ניסיון ${index + 1}`}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 rounded-[22px] border border-amber-100 bg-amber-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm leading-6 text-slate-700">
                          AI לוקח תפקיד, סטאק ו-bottom line, ומחזיר ניסוח חד בלי פורמטים אמריקאיים ובלי fluff.
                        </div>
                        <AiSynthesisButton
                          disabled={!canGenerateExperienceSummary}
                          onApply={(nextValue) => applyStructuredExperienceSummary(index, nextValue)}
                          onGenerate={() =>
                            synthesizeResumeTextFromStructuredData({
                              employer: data.targetRole.targetEmployer,
                              kind: 'experience',
                              label: 'Experience synthesis',
                              language: data.resumeLanguage,
                              track: data.targetRole.targetTrack,
                              context: buildExperienceSynthesisContext(experience),
                            })
                          }
                        >
                          ✨ צור ניסוח אוטומטי ב-AI
                        </AiSynthesisButton>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell error={fieldError?.role?.message} label="תפקיד" required>
                          <Input
                            dir="ltr"
                            onChange={(event) =>
                              form.setValue(`experiences.${index}.role`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            placeholder="Data Analyst / Research Assistant"
                            value={experience.role}
                          />
                        </FieldShell>

                        <FieldShell error={fieldError?.company?.message} label="חברה / ארגון" required>
                          <Input
                            dir="ltr"
                            onChange={(event) =>
                              form.setValue(`experiences.${index}.company`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            placeholder="Startup name / University lab"
                            value={experience.company}
                          />
                        </FieldShell>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell error={fieldError?.startDate?.message} label="תאריך התחלה" required>
                          <Input
                            dir="ltr"
                            max={!experience.isCurrent ? experience.endDate || undefined : undefined}
                            onChange={(event) =>
                              form.setValue(`experiences.${index}.startDate`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            type="month"
                            value={experience.startDate}
                          />
                        </FieldShell>

                        <FieldShell error={fieldError?.endDate?.message} label="תאריך סיום">
                          <Input
                            dir="ltr"
                            disabled={experience.isCurrent}
                            min={experience.startDate || undefined}
                            onChange={(event) =>
                              form.setValue(`experiences.${index}.endDate`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            type="month"
                            value={experience.endDate}
                          />
                        </FieldShell>
                      </div>

                      <Checkbox
                        checked={experience.isCurrent}
                        description="כשמסומן, ה-PDF יציג Present."
                        label="זה התפקיד הנוכחי שלי"
                        onChange={(event) => {
                          form.setValue(`experiences.${index}.isCurrent`, event.target.checked, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })

                          if (event.target.checked) {
                            form.setValue(`experiences.${index}.endDate`, '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                        }}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell label="Tech Stack">
                          <SearchableChipMultiSelect
                            allowCustom
                            dir="ltr"
                            onChange={(nextSelection) =>
                              setExperienceTechStack(index, nextSelection)
                            }
                            options={technologyChoices}
                            placeholder="Python, SQL, dbt, Airflow"
                            value={techStack}
                          />
                        </FieldShell>

                        <FieldShell label="Goal / ownership / מה החלק שלכם בתכלס?">
                          <TextArea
                            dir="ltr"
                            onChange={(event) =>
                              form.setValue(`experiences.${index}.goal`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            placeholder="What did you own, improve, automate, or support?"
                            rows={3}
                            value={experience.goal}
                          />
                        </FieldShell>
                      </div>

                      <FieldShell error={fieldError?.summary?.message} label="השורה המרכזית" required>
                        <InlineAiTextArea
                          employer={data.targetRole.targetEmployer}
                          kind="bullet"
                          label="תקציר ניסיון"
                          language={data.resumeLanguage}
                          onApply={(nextValue) => syncExperienceSummary(index, nextValue)}
                          onChange={(nextValue) => syncExperienceSummary(index, nextValue)}
                          placeholder="Write rough notes. Example: Automated weekly reporting in Python and cut manual work by 6 hours."
                          track={data.targetRole.targetTrack}
                          value={experience.summary}
                        />
                      </FieldShell>

                      <FieldShell label="בולט נוסף (אופציונלי)">
                        <InlineAiTextArea
                          employer={data.targetRole.targetEmployer}
                          kind="bullet"
                          label="בולט ניסיון נוסף"
                          language={data.resumeLanguage}
                          onApply={(nextValue) => syncExperienceSecondaryBullet(index, nextValue)}
                          onChange={(nextValue) => syncExperienceSecondaryBullet(index, nextValue)}
                          placeholder="Optional second line for scope, scale, or reliability."
                          rows={3}
                          textareaClassName="min-h-24"
                          track={data.targetRole.targetTrack}
                          value={experience.bullets[1] ?? ''}
                        />
                      </FieldShell>
                    </div>
                  </WizardSection>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => append(createEmptyExperience())} type="button" variant="secondary">
            <Plus className="size-4" />
            הוסף ניסיון
          </Button>
          <span className="text-sm text-slate-500">
            אין בעיה להשאיר כאן 0 פריטים אם שאר הסיפור כבר חזק.
          </span>
        </div>
      </StepFrame>
    </form>
  )
}
