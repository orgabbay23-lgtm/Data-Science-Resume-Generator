import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AiSynthesisButton } from '../../../components/ui/ai-synthesis-button'
import { Button } from '../../../components/ui/button'
import { ChoiceChip } from '../../../components/ui/choice-chip'
import { FieldShell } from '../../../components/ui/field-shell'
import { HelpPopover } from '../../../components/ui/help-popover'
import { Input } from '../../../components/ui/input'
import { InlineAiTextArea } from '../../../components/ui/inline-ai-textarea'
import { SearchableCombobox } from '../../../components/ui/searchable-combobox'
import { Select } from '../../../components/ui/select'
import {
  courseworkOptions,
  degreeOptions,
  graduationYearOptions,
  institutionOptions,
} from '../../../data/options/resume-options'
import { israeliFieldHints } from '../../../data/options/israel-resume-options'
import { synthesizeResumeTextFromStructuredData } from '../../../lib/gemini-service'
import {
  getCourseworkText,
  getEducationDegreeText,
  getInstitutionText,
} from '../../../lib/resume-helpers'
import {
  educationSchema,
  type EducationFormValues,
} from '../../../schemas/resume-schemas'
import { useResumeStore } from '../../../store/resume-store'
import { getDefaultGraduationYear } from '../../../types/resume'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface EducationStepProps {
  onNext: () => void
  onPrevious: () => void
}

const mapToSearchOptions = (options: typeof degreeOptions) =>
  options.map((option) => ({
    value: option.value,
    label: option.labelHe,
    keywords: [option.labelEn, ...(option.keywords ?? [])],
  }))

const normalize = (value: string) => value.trim().toLowerCase()

const findSearchOptionMatch = (
  options: ReturnType<typeof mapToSearchOptions>,
  value: string,
) => {
  const normalizedValue = normalize(value)

  return options.find((option) =>
    [option.label, option.value, ...(option.keywords ?? [])].some(
      (candidate) => normalize(candidate) === normalizedValue,
    ),
  )
}

export const EducationStep = ({ onNext, onPrevious }: EducationStepProps) => {
  const data = useResumeStore((state) => state.data)
  const updateEducation = useResumeStore((state) => state.updateEducation)
  const [showMore, setShowMore] = useState(
    Boolean(
      data.education.includeGpa || data.education.includeCoursework || data.education.focus,
    ),
  )

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      ...data.education,
      graduationYear: data.education.graduationYear || getDefaultGraduationYear(),
    },
  })

  const values = useWatch({ control: form.control })
  const includeGpa = useWatch({ control: form.control, name: 'includeGpa' }) ?? false
  const includeCoursework =
    useWatch({ control: form.control, name: 'includeCoursework' }) ?? false
  const degreeSearchOptions = useMemo(() => mapToSearchOptions(degreeOptions), [])
  const institutionSearchOptions = useMemo(
    () => mapToSearchOptions(institutionOptions),
    [],
  )
  const currentGpa = Number(values.gpa ?? '')
  const hideGpaInFinalResume =
    includeGpa && (!Number.isFinite(currentGpa) || currentGpa < 85)

  useEffect(() => {
    updateEducation({
      degree: values.degree ?? '',
      degreeOther: values.degreeOther ?? '',
      institution: values.institution ?? '',
      institutionOther: values.institutionOther ?? '',
      graduationYear: values.graduationYear || getDefaultGraduationYear(),
      includeGpa: values.includeGpa ?? false,
      gpa: values.includeGpa ? values.gpa ?? '' : '',
      includeCoursework: values.includeCoursework ?? false,
      coursework: values.includeCoursework ? values.coursework ?? [] : [],
      courseworkOther: values.includeCoursework ? values.courseworkOther ?? '' : '',
      focus: values.focus ?? '',
    })
  }, [updateEducation, values])

  const canGenerateEducationFocus = Boolean(
    values.degree?.trim() ||
      values.degreeOther?.trim() ||
      values.institution?.trim() ||
      values.institutionOther?.trim() ||
      (values.coursework ?? []).length > 0 ||
      values.courseworkOther?.trim(),
  )

  const buildEducationSynthesisContext = () => {
    const educationDetails = {
      degree: values.degree ?? '',
      degreeOther: values.degreeOther ?? '',
      institution: values.institution ?? '',
      institutionOther: values.institutionOther ?? '',
      graduationYear: values.graduationYear || getDefaultGraduationYear(),
      includeGpa: values.includeGpa ?? false,
      gpa: values.gpa ?? '',
      includeCoursework: values.includeCoursework ?? false,
      coursework: values.coursework ?? [],
      courseworkOther: values.courseworkOther ?? '',
      focus: values.focus ?? '',
    }

    const degreeText = getEducationDegreeText(educationDetails, data.resumeLanguage)
    const institutionText = getInstitutionText(educationDetails, data.resumeLanguage)
    const courseworkText = getCourseworkText(educationDetails, data.resumeLanguage).join(', ')

    return [
      degreeText ? `Degree: ${degreeText}` : '',
      institutionText ? `Institution: ${institutionText}` : '',
      educationDetails.graduationYear
        ? `Expected graduation year: ${educationDetails.graduationYear}`
        : '',
      educationDetails.includeGpa && educationDetails.gpa
        ? `GPA: ${educationDetails.gpa}`
        : '',
      courseworkText ? `Relevant coursework or academic topics: ${courseworkText}` : '',
      data.targetRole.targetTitle ? `Target title: ${data.targetRole.targetTitle}` : '',
      values.focus?.trim() ? `Existing academic focus draft: ${values.focus}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <form onSubmit={form.handleSubmit(() => onNext())}>
      <StepFrame
        description="ההשכלה נשארת חדה ורזה. שם המוסד נשמר נקי ל-ATS, והממוצע נכנס רק אם הוא באמת מחזק אתכם."
        eyebrow="שלב 8"
        footer={
          <>
            <Button onClick={onPrevious} type="button" variant="secondary">
              חזרה
            </Button>
            <Button type="submit">המשך</Button>
          </>
        }
        stepIndex={8}
        title="השכלה"
      >
        <WizardSection title="עיקר ההשכלה">
          <div className="grid gap-4 md:grid-cols-2">
            <FieldShell error={form.formState.errors.degree?.message} label="תואר" required>
              <SearchableCombobox
                customActionLabel="כתבו תואר אחר"
                dir="rtl"
                onOptionSelect={(option) => {
                  form.setValue('degree', option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  form.setValue('degreeOther', '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
                onValueChange={(nextValue) => {
                  const exactMatch = findSearchOptionMatch(degreeSearchOptions, nextValue)

                  form.setValue('degree', exactMatch?.value ?? (nextValue.trim() ? 'other' : ''), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  form.setValue('degreeOther', exactMatch ? '' : nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
                options={degreeSearchOptions}
                placeholder="חפשו תואר או כתבו אחד משלכם"
                value={
                  values.degree === 'other'
                    ? values.degreeOther ?? ''
                    : degreeSearchOptions.find((option) => option.value === values.degree)?.label ??
                      ''
                }
              />
            </FieldShell>

            <FieldShell
              error={form.formState.errors.institution?.message}
              label="מוסד לימודים"
              labelSuffix={
                <HelpPopover title={israeliFieldHints.educationInstitution.title}>
                  {israeliFieldHints.educationInstitution.body}
                </HelpPopover>
              }
              required
            >
              <SearchableCombobox
                customActionLabel="כתבו מוסד אחר"
                dir="rtl"
                onOptionSelect={(option) => {
                  form.setValue('institution', option.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  form.setValue('institutionOther', '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
                onValueChange={(nextValue) => {
                  const exactMatch = findSearchOptionMatch(
                    institutionSearchOptions,
                    nextValue,
                  )

                  form.setValue(
                    'institution',
                    exactMatch?.value ?? (nextValue.trim() ? 'other' : ''),
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                  form.setValue('institutionOther', exactMatch ? '' : nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
                options={institutionSearchOptions}
                placeholder="טכניון / BGU / TAU / האוניברסיטה העברית"
                value={
                  values.institution === 'other'
                    ? values.institutionOther ?? ''
                    : institutionSearchOptions.find(
                        (option) => option.value === values.institution,
                      )?.label ?? ''
                }
              />
            </FieldShell>

            <FieldShell
              className="md:col-span-2"
              error={form.formState.errors.graduationYear?.message}
              label="שנת סיום צפויה"
              required
            >
              <Select {...form.register('graduationYear')}>
                <option value="">בחרו שנה</option>
                {graduationYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </FieldShell>
          </div>
        </WizardSection>

        <WizardSection
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AiSynthesisButton
                className="w-auto shrink-0 px-3"
                disabled={!canGenerateEducationFocus}
                onApply={(nextValue) =>
                  form.setValue('focus', nextValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onGenerate={() =>
                  synthesizeResumeTextFromStructuredData({
                    employer: data.targetRole.targetEmployer,
                    kind: 'education',
                    label: 'Education focus synthesis',
                    language: data.resumeLanguage,
                    track: data.targetRole.targetTrack,
                    context: buildEducationSynthesisContext(),
                  })
                }
              >
                ✨ צור ניסוח אוטומטי ב-AI
              </AiSynthesisButton>
              <button
                className="text-sm font-semibold text-cyan-800 transition hover:text-cyan-950"
                onClick={() => setShowMore((current) => !current)}
                type="button"
              >
                {showMore ? 'הסתר' : 'הצג עוד'}
              </button>
            </div>
          }
          description="ממוצע וקורסים הם תוספים. מכניסים רק אם הם דוחפים אתכם קדימה."
          title="חיזוקים אופציונליים"
        >
          {showMore ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldShell label="להציג ממוצע?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceChip
                      checked={includeGpa}
                      description="נכנס ל-PDF רק אם הוא עומד בכלל ה-85+."
                      label="כן"
                      onToggle={() =>
                        form.setValue('includeGpa', true, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                    <ChoiceChip
                      checked={!includeGpa}
                      description="בדיוק מה שמקובל כשזה לא מספר שמקדם אתכם."
                      label="לא"
                      onToggle={() =>
                        form.setValue('includeGpa', false, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </FieldShell>

                <FieldShell label="להציג קורסים?">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceChip
                      checked={includeCoursework}
                      description="3-4 קורסים חזקים בלבד, לא יותר."
                      label="כן"
                      onToggle={() =>
                        form.setValue('includeCoursework', true, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                    <ChoiceChip
                      checked={!includeCoursework}
                      description="מעולה אם הפרויקטים כבר מספרים את הסיפור."
                      label="לא"
                      onToggle={() =>
                        form.setValue('includeCoursework', false, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                </FieldShell>
              </div>

              {includeGpa ? (
                <div className="space-y-3">
                  <FieldShell
                    error={form.formState.errors.gpa?.message}
                    label="ממוצע"
                    labelSuffix={
                      <HelpPopover title={israeliFieldHints.educationGpa.title}>
                        {israeliFieldHints.educationGpa.body}
                      </HelpPopover>
                    }
                  >
                    <Input
                      inputMode="decimal"
                      max="100"
                      min="0"
                      placeholder="89"
                      type="number"
                      {...form.register('gpa')}
                    />
                  </FieldShell>

                  {hideGpaInFinalResume ? (
                    <div className="rounded-[20px] border border-amber-100 bg-amber-50/85 px-4 py-3 text-sm leading-6 text-amber-950">
                      המספר הזה נשמר אצלכם, אבל ה-PDF הסופי יסתיר אותו אם הוא מתחת ל-85.
                      בטכלאס הישראלי זה עדיף על פני למשוך תשומת לב לממוצע שלא עובד בשבילכם.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {includeCoursework ? (
                <Controller
                  control={form.control}
                  name="coursework"
                  render={({ field }) => (
                    <div className="space-y-4">
                      <FieldShell
                        label="קורסים"
                        labelSuffix={
                          <HelpPopover title={israeliFieldHints.coursework.title}>
                            {israeliFieldHints.coursework.body}
                          </HelpPopover>
                        }
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          {courseworkOptions.map((coursework) => (
                            <ChoiceChip
                              checked={field.value.includes(coursework.value)}
                              key={coursework.value}
                              label={coursework.labelHe}
                              onToggle={() => {
                                const nextValue = field.value.includes(coursework.value)
                                  ? field.value.filter((item) => item !== coursework.value)
                                  : [...field.value, coursework.value]
                                field.onChange(nextValue)
                              }}
                            />
                          ))}
                        </div>
                      </FieldShell>

                      <FieldShell label="קורסים נוספים">
                        <Input
                          dir="ltr"
                          placeholder="Deep Learning, Distributed Systems, Statistical Modeling"
                          {...form.register('courseworkOther')}
                        />
                      </FieldShell>
                    </div>
                  )}
                />
              ) : null}

              <div className="space-y-4 rounded-[24px] border border-cyan-100 bg-cyan-50/70 px-4 py-4">
                <div className="text-sm leading-6 text-slate-700">
                  AI יכול לזקק את ההשכלה לשורת מיקוד קצרה, ישירה, ומתאימה למסלול
                  שבחרתם בלי להמציא קורסים או הישגים.
                </div>

                <FieldShell label="מיקוד אקדמי (אופציונלי)">
                  <InlineAiTextArea
                    employer={data.targetRole.targetEmployer}
                    kind="phrase"
                    label="מיקוד אקדמי"
                    language={data.resumeLanguage}
                    onApply={(nextValue) =>
                      form.setValue('focus', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onChange={(nextValue) =>
                      form.setValue('focus', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    placeholder="Example: Applied machine learning, statistical modeling, and experimentation coursework aligned to product and predictive analytics roles."
                    rows={3}
                    textareaClassName="min-h-24"
                    track={data.targetRole.targetTrack}
                    value={values.focus ?? ''}
                  />
                </FieldShell>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              ברוב המקרים אפשר להמשיך בלי ממוצע ובלי רשימת קורסים ארוכה.
            </p>
          )}
        </WizardSection>
      </StepFrame>
    </form>
  )
}
