import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AiSynthesisButton } from '../../../components/ui/ai-synthesis-button'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import { ChoiceChip } from '../../../components/ui/choice-chip'
import { FieldShell } from '../../../components/ui/field-shell'
import { HelpPopover } from '../../../components/ui/help-popover'
import { InlineAiTextArea } from '../../../components/ui/inline-ai-textarea'
import { Input } from '../../../components/ui/input'
import { SearchableCombobox } from '../../../components/ui/searchable-combobox'
import {
  employerModeOptions,
  israeliFieldHints,
  militaryBranchOptions,
  militaryProfileCards,
  militaryUnitOptions,
  serviceYearOptions,
} from '../../../data/options/israel-resume-options'
import { synthesizeResumeTextFromStructuredData } from '../../../lib/gemini-service'
import { getMilitaryBranchText, getMilitaryUnitText } from '../../../lib/resume-helpers'
import { splitMultilineText } from '../../../lib/utils'
import {
  defaultMilitaryServiceFormValues,
  militaryServiceSchema,
  type MilitaryServiceFormValues,
} from '../../../schemas/resume-schemas'
import { useResumeStore } from '../../../store/resume-store'
import { ensureMilitaryServiceDetails } from '../../../types/resume'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface MilitaryServiceStepProps {
  onNext: () => void
  onPrevious: () => void
}

const mapToSearchOptions = (options: typeof militaryBranchOptions) =>
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

export const MilitaryServiceStep = ({
  onNext,
  onPrevious,
}: MilitaryServiceStepProps) => {
  const data = useResumeStore((state) => state.data)
  const updateMilitaryService = useResumeStore((state) => state.updateMilitaryService)
  const branchOptions = useMemo(() => mapToSearchOptions(militaryBranchOptions), [])
  const unitOptions = useMemo(() => mapToSearchOptions(militaryUnitOptions), [])

  const form = useForm<MilitaryServiceFormValues>({
    resolver: zodResolver(militaryServiceSchema),
    defaultValues: data.militaryService.enabled
      ? ensureMilitaryServiceDetails(data.militaryService)
      : defaultMilitaryServiceFormValues(),
  })

  const values = useWatch({ control: form.control })
  const enabled = useWatch({ control: form.control, name: 'enabled' }) ?? false
  const profile = useWatch({ control: form.control, name: 'profile' }) ?? 'tech'
  const serviceType =
    useWatch({ control: form.control, name: 'serviceType' }) ?? 'military'
  const includeReserveDuty =
    useWatch({ control: form.control, name: 'includeReserveDuty' }) ?? false
  const currentProfileCard = militaryProfileCards[profile]

  useEffect(() => {
    updateMilitaryService(ensureMilitaryServiceDetails(values))
  }, [updateMilitaryService, values])

  useEffect(() => {
    if (serviceType === 'national' && profile !== 'national') {
      form.setValue('profile', 'national', {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }, [form, profile, serviceType])

  const canGenerateMilitarySummary = Boolean(
    values.roleTitle?.trim() &&
      (values.startYear?.trim() ||
        values.endYear?.trim() ||
        values.branch?.trim() ||
        values.unit?.trim()),
  )

  const buildMilitarySynthesisContext = () => {
    const currentService = ensureMilitaryServiceDetails(values)
    const branchText = getMilitaryBranchText(currentService, data.resumeLanguage)
    const unitText = getMilitaryUnitText(currentService, data.resumeLanguage)

    return [
      `Service type: ${currentService.serviceType}`,
      `Profile focus: ${currentService.profile}`,
      currentService.roleTitle ? `Role title: ${currentService.roleTitle}` : '',
      currentService.rank ? `Rank or context: ${currentService.rank}` : '',
      branchText ? `Branch or service domain: ${branchText}` : '',
      unitText ? `Unit: ${unitText}` : '',
      currentService.startYear ? `Start year: ${currentService.startYear}` : '',
      currentService.endYear ? `End year: ${currentService.endYear}` : '',
      currentService.activeSecurityClearance ? 'Active security clearance: yes' : '',
      currentService.includeReserveDuty && currentService.reserveDutyNote
        ? `Reserve duty note: ${currentService.reserveDutyNote}`
        : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  const applyStructuredMilitarySummary = (nextSummary: string) => {
    const lines = splitMultilineText(nextSummary)

    if (lines.length === 0) {
      return
    }

    form.setValue('summary', lines[0], {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('bullets', [lines[0], lines[1] ?? values.bullets?.[1] ?? ''], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <form onSubmit={form.handleSubmit(() => onNext())}>
      <StepFrame
        description="בישראל זה חלק מהסיפור. אם השירות מחזק אתכם, מתרגמים אותו לאנגלית עסקית בלי מונחים מסווגים ובלי ז׳רגון צבאי."
        eyebrow="שלב 7"
        footer={
          <>
            <Button onClick={onPrevious} type="button" variant="secondary">
              חזרה
            </Button>
            <Button type="submit">המשך</Button>
          </>
        }
        stepIndex={7}
        title="שירות צבאי / לאומי"
      >
        <WizardSection
          description="אין חובה למלא. אבל אם יש 8200, ממר״ם, 9900, פיקוד, לוגיסטיקה, או אחריות אמיתית, זה שווה מקום."
          title="האם להציג שירות?"
          tone="info"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <ChoiceChip
              checked={enabled}
              description="למי שיש סיפור חזק משירות - עדיף לתרגם אותו נכון מאשר להשאיר חור."
              label="כן, להוסיף"
              onToggle={() =>
                form.setValue('enabled', true, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <ChoiceChip
              checked={!enabled}
              description="אם זה לא מוסיף ערך עסקי או סתם יאריך את הקובץ, מדלגים."
              label="לא, לדלג"
              onToggle={() =>
                form.setValue('enabled', false, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>
        </WizardSection>

        {enabled ? (
          <>
            <WizardSection
              description="הכיוון קובע איך ה-AI יתרגם את השירות לאנגלית של מגייס/ת בתל אביב."
              title="איך לתרגם את השירות?"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <ChoiceChip
                  checked={serviceType === 'military'}
                  description="שירות צבאי, מילואים, יחידה, תפקיד, אחריות."
                  label="שירות צבאי"
                  onToggle={() => {
                    form.setValue('serviceType', 'military', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                    if (profile === 'national') {
                      form.setValue('profile', 'tech', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  }}
                />
                <ChoiceChip
                  checked={serviceType === 'national'}
                  description="שירות לאומי או אזרחי. עדיין מתרגמים לאופרציה, דאטה, ותהליכים."
                  label="שירות לאומי"
                  onToggle={() =>
                    form.setValue('serviceType', 'national', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {(serviceType === 'national'
                  ? (['national'] as const)
                  : (['tech', 'combat', 'operations'] as const)
                ).map((option) => (
                  <ChoiceChip
                    checked={profile === option}
                    description={militaryProfileCards[option].description}
                    key={option}
                    label={militaryProfileCards[option].label}
                    onToggle={() =>
                      form.setValue('profile', option, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                ))}
              </div>

              <div className="mt-4 rounded-[22px] border border-cyan-100 bg-cyan-50/80 px-4 py-4 text-sm leading-6 text-slate-700">
                <div className="font-semibold text-slate-900">דוגמה לכותרת:</div>
                <div className="mt-1" dir="ltr">
                  {currentProfileCard.roleExample}
                </div>
                <div className="mt-3 font-semibold text-slate-900">דוגמה לשורה טובה:</div>
                <div className="mt-1" dir="ltr">
                  {currentProfileCard.bulletExample}
                </div>
              </div>
            </WizardSection>

            <WizardSection
              description="שומרים רק את מה שעובר ל-corporate English. אם זה מסווג - כותבים סקייל, כלים, וערך, לא מטרה מבצעית."
              title="פרטי השירות"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FieldShell label="חיל / תחום שירות">
                  <SearchableCombobox
                    customActionLabel="כתבו תחום אחר"
                    dir="rtl"
                    onOptionSelect={(option) => {
                      form.setValue('branch', option.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      form.setValue('branchOther', '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                    onValueChange={(nextValue) => {
                      const exactMatch = findSearchOptionMatch(branchOptions, nextValue)
                      form.setValue('branch', exactMatch?.value ?? (nextValue.trim() ? 'other' : ''), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      form.setValue('branchOther', exactMatch ? '' : nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                    options={branchOptions}
                    placeholder="מודיעין / חיל האוויר / שירות לאומי"
                    value={
                      values.branch === 'other'
                        ? values.branchOther ?? ''
                        : branchOptions.find((option) => option.value === values.branch)?.label ??
                          ''
                    }
                  />
                </FieldShell>

                <FieldShell label="יחידה (אופציונלי)">
                  <SearchableCombobox
                    customActionLabel="כתבו יחידה אחרת"
                    dir="rtl"
                    onOptionSelect={(option) => {
                      form.setValue('unit', option.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      form.setValue('unitOther', '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                    onValueChange={(nextValue) => {
                      const exactMatch = findSearchOptionMatch(unitOptions, nextValue)
                      form.setValue('unit', exactMatch?.value ?? (nextValue.trim() ? 'other' : ''), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      form.setValue('unitOther', exactMatch ? '' : nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                    options={unitOptions}
                    placeholder="8200 / 9900 / ממר״ם"
                    value={
                      values.unit === 'other'
                        ? values.unitOther ?? ''
                        : unitOptions.find((option) => option.value === values.unit)?.label ?? ''
                    }
                  />
                </FieldShell>

                <FieldShell
                  error={form.formState.errors.roleTitle?.message}
                  label="כותרת תפקיד באנגלית"
                  labelSuffix={
                    <HelpPopover title={israeliFieldHints.militaryRole.title}>
                      {israeliFieldHints.militaryRole.body}
                    </HelpPopover>
                  }
                  required
                >
                  <Input
                    dir="ltr"
                    placeholder={currentProfileCard.roleExample}
                    {...form.register('roleTitle')}
                  />
                </FieldShell>

                <FieldShell label="דרגה / הערת הקשר">
                  <Input
                    dir="ltr"
                    placeholder="Lieutenant / Team Commander / Volunteer Coordinator"
                    {...form.register('rank')}
                  />
                </FieldShell>

                <FieldShell error={form.formState.errors.startYear?.message} label="שנת התחלה" required>
                  <SearchableCombobox
                    customActionLabel="כתבו שנה"
                    dir="ltr"
                    onOptionSelect={(option) =>
                      form.setValue('startYear', option.label, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onValueChange={(nextValue) =>
                      form.setValue('startYear', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    options={serviceYearOptions.map((year) => ({ value: year, label: year }))}
                    placeholder="2020"
                    value={values.startYear ?? ''}
                  />
                </FieldShell>

                <FieldShell error={form.formState.errors.endYear?.message} label="שנת סיום" required>
                  <SearchableCombobox
                    customActionLabel="כתבו שנה"
                    dir="ltr"
                    onOptionSelect={(option) =>
                      form.setValue('endYear', option.label, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onValueChange={(nextValue) =>
                      form.setValue('endYear', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    options={serviceYearOptions.map((year) => ({ value: year, label: year }))}
                    placeholder="2023"
                    value={values.endYear ?? ''}
                  />
                </FieldShell>
              </div>

              <div className="mt-5 space-y-4">
                <Checkbox
                  checked={values.activeSecurityClearance ?? false}
                  description="רק אם זה מותר ורלוונטי. זה יתרון משמעותי בדיפנס-טק, דאטה וסייבר."
                  label="יש לי סיווג ביטחוני פעיל"
                  onChange={(event) =>
                    form.setValue('activeSecurityClearance', event.target.checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />

                <Checkbox
                  checked={includeReserveDuty}
                  description="שימושי אם מילואים מסבירים פער בלימודים או בעבודה. כותבים קצר, נקי, ולא דרמטי."
                  label="להוסיף הערת מילואים"
                  onChange={(event) =>
                    form.setValue('includeReserveDuty', event.target.checked, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />

                {includeReserveDuty ? (
                  <FieldShell label="איך לנסח את המילואים?">
                    <Input
                      dir="ltr"
                      placeholder="Military Reserve Duty during 2024-2025 while completing studies"
                      {...form.register('reserveDutyNote')}
                    />
                  </FieldShell>
                ) : null}
              </div>
            </WizardSection>

            <WizardSection
              description="כאן עושים את התרגום האמיתי. טכני = data scale + tools + impact. קרבי/פיקודי = leadership + logistics + execution."
              title="ניסוח עסקי"
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-[22px] border border-amber-100 bg-amber-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm leading-6 text-slate-700">
                    AI משתמש ביחידה, בתפקיד ובשנים שבחרתם כדי לנסח אנגלית עסקית שמרגישה מדויקת למגייס/ת בתל אביב.
                  </div>
                  <AiSynthesisButton
                    disabled={!canGenerateMilitarySummary}
                    onApply={applyStructuredMilitarySummary}
                    onGenerate={() =>
                      synthesizeResumeTextFromStructuredData({
                        employer: data.targetRole.targetEmployer,
                        kind: 'military',
                        label: 'Military service synthesis',
                        language: data.resumeLanguage,
                        track: data.targetRole.targetTrack,
                        context: buildMilitarySynthesisContext(),
                      })
                    }
                  >
                    ✨ צור ניסוח אוטומטי ב-AI
                  </AiSynthesisButton>
                </div>

                <FieldShell
                  error={form.formState.errors.summary?.message}
                  label="השורה המרכזית"
                  labelSuffix={
                    <HelpPopover title={israeliFieldHints.militaryStep.title}>
                      {israeliFieldHints.militaryStep.body}
                    </HelpPopover>
                  }
                  required
                >
                  <InlineAiTextArea
                    employer={data.targetRole.targetEmployer}
                    kind="bullet"
                    label="תרגום השירות"
                    language={data.resumeLanguage}
                    onApply={(nextValue) =>
                      form.setValue('summary', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onChange={(nextValue) =>
                      form.setValue('summary', nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    placeholder={currentProfileCard.bulletExample}
                    track={data.targetRole.targetTrack}
                    value={values.summary ?? ''}
                  />
                </FieldShell>

                <FieldShell label="בולט נוסף (אופציונלי)">
                  <InlineAiTextArea
                    employer={data.targetRole.targetEmployer}
                    kind="bullet"
                    label="בולט שירות נוסף"
                    language={data.resumeLanguage}
                    onApply={(nextValue) =>
                      form.setValue('bullets', [values.bullets?.[0] ?? '', nextValue], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    onChange={(nextValue) =>
                      form.setValue('bullets', [values.bullets?.[0] ?? '', nextValue], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    placeholder="Optimized supply and resource allocation for a 40-person unit, maintaining full readiness under severe time constraints."
                    track={data.targetRole.targetTrack}
                    value={values.bullets?.[1] ?? ''}
                  />
                </FieldShell>

                <div className="rounded-[20px] border border-slate-200/90 bg-white/88 px-4 py-4 text-sm leading-6 text-slate-700">
                  <span className="font-semibold text-slate-900">החברה שבחרתם:</span>{' '}
                  {employerModeOptions[data.targetRole.targetEmployer].label}. אם זה סטארטאפ, תדגישו ownership
                  ותוצאה. אם זה מרכז פיתוח גלובלי, תדגישו reliability, process, ויכולת לעבוד ב-scale.
                </div>
              </div>
            </WizardSection>
          </>
        ) : (
          <WizardSection tone="info">
            <p className="text-sm leading-6 text-slate-600">
              אם השירות לא תורם לנרטיב הטכנולוגי או מאריך את המסמך מעבר לעמוד אחד, עדיף להמשיך הלאה.
            </p>
          </WizardSection>
        )}
      </StepFrame>
    </form>
  )
}
