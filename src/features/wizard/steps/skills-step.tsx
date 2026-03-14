import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AiSynthesisButton } from '../../../components/ui/ai-synthesis-button'
import { Button } from '../../../components/ui/button'
import { FieldShell } from '../../../components/ui/field-shell'
import { SearchableChipMultiSelect } from '../../../components/ui/searchable-chip-multi-select'
import { TextArea } from '../../../components/ui/textarea'
import {
  getCareerTrackConfig,
  getTrackRecommendedSkills,
  getTrackSkillQuickPacks,
} from '../../../data/options/career-track-options'
import { skillCategoryLabels, skillOptions } from '../../../data/options/resume-options'
import { synthesizeResumeTextFromStructuredData } from '../../../lib/gemini-service'
import { splitCommaSeparated } from '../../../lib/utils'
import { skillsSchema, type SkillsFormValues } from '../../../schemas/resume-schemas'
import { useResumeStore } from '../../../store/resume-store'
import type { SkillCategoryKey } from '../../../types/resume'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface SkillsStepProps {
  onNext: () => void
  onPrevious: () => void
}

const categories: {
  key: SkillCategoryKey
  otherField:
    | 'programmingLanguagesOther'
    | 'machineLearningAIOther'
    | 'dataEngineeringMLOpsOther'
    | 'mathematicsAnalyticsOther'
}[] = [
  { key: 'programmingLanguages', otherField: 'programmingLanguagesOther' },
  { key: 'machineLearningAI', otherField: 'machineLearningAIOther' },
  { key: 'dataEngineeringMLOps', otherField: 'dataEngineeringMLOpsOther' },
  { key: 'mathematicsAnalytics', otherField: 'mathematicsAnalyticsOther' },
]

const skillCategoryLookup = Object.entries(skillOptions).reduce<Record<string, SkillCategoryKey>>(
  (accumulator, [category, items]) => {
    items.forEach((item) => {
      accumulator[item] = category as SkillCategoryKey
    })
    return accumulator
  },
  {},
)

export const SkillsStep = ({ onNext, onPrevious }: SkillsStepProps) => {
  const data = useResumeStore((state) => state.data)
  const updateSkills = useResumeStore((state) => state.updateSkills)
  const track = data.targetRole.targetTrack
  const trackConfig = getCareerTrackConfig(track)
  const quickPacks = getTrackSkillQuickPacks(track)

  const form = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsSchema),
    defaultValues: data.skills,
  })

  const values = useWatch({ control: form.control })

  useEffect(() => {
    updateSkills({
      summary: values.summary ?? '',
      programmingLanguages: values.programmingLanguages ?? [],
      programmingLanguagesOther: values.programmingLanguagesOther ?? '',
      machineLearningAI: values.machineLearningAI ?? [],
      machineLearningAIOther: values.machineLearningAIOther ?? '',
      dataEngineeringMLOps: values.dataEngineeringMLOps ?? [],
      dataEngineeringMLOpsOther: values.dataEngineeringMLOpsOther ?? '',
      mathematicsAnalytics: values.mathematicsAnalytics ?? [],
      mathematicsAnalyticsOther: values.mathematicsAnalyticsOther ?? '',
    })
  }, [updateSkills, values])

  const canGenerateSkillsSummary = categories.some(({ key, otherField }) => {
    const combinedSelection = [
      ...(values[key] ?? []),
      ...splitCommaSeparated(values[otherField] ?? ''),
    ]

    return combinedSelection.length > 0
  })

  const buildSkillsSynthesisContext = () => {
    const selectedCategories = categories
      .map(({ key, otherField }) => {
        const combinedSelection = [
          ...(values[key] ?? []),
          ...splitCommaSeparated(values[otherField] ?? ''),
        ]

        if (combinedSelection.length === 0) {
          return null
        }

        return `${skillCategoryLabels.en[key]}: ${combinedSelection.join(', ')}`
      })
      .filter(Boolean)

    return [
      `Target role title: ${data.targetRole.targetTitle || trackConfig.defaultTargetTitle}`,
      `Target track: ${trackConfig.label}`,
      `Target company type: ${data.targetRole.targetEmployer}`,
      'Selected skills:',
      ...selectedCategories,
    ].join('\n')
  }

  const setCategorySelection = (
    category: SkillCategoryKey,
    otherField: (typeof categories)[number]['otherField'],
    nextSelection: string[],
  ) => {
    const knownOptions = skillOptions[category]
    const known = nextSelection.filter((item) => knownOptions.includes(item))
    const custom = nextSelection.filter((item) => !knownOptions.includes(item))

    form.setValue(category, known, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue(otherField, custom.join(', '), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const applySkillPack = (skillsToApply: string[]) => {
    skillsToApply.forEach((skill) => {
      const category = skillCategoryLookup[skill]

      if (!category) {
        return
      }

      const otherField = categories.find((item) => item.key === category)?.otherField

      if (!otherField) {
        return
      }

      const currentSelection = [
        ...(form.getValues(category) ?? []),
        ...splitCommaSeparated(form.getValues(otherField) ?? ''),
      ]

      if (currentSelection.includes(skill)) {
        return
      }

      setCategorySelection(category, otherField, [...currentSelection, skill])
    })
  }

  return (
    <form onSubmit={form.handleSubmit(() => onNext())}>
      <StepFrame
        description={`בחרו רק את מה שאתם באמת רוצים להבליט למסלול ${trackConfig.label}. אפשר לכתוב חופשי ולהוסיף בלי טפסים מיותרים.`}
        eyebrow="שלב 4"
        footer={
          <>
            <Button onClick={onPrevious} type="button" variant="secondary">
              חזרה
            </Button>
            <Button type="submit">המשך</Button>
          </>
        }
        stepIndex={4}
        title="כישורים"
      >
        <WizardSection
          description="חבילות מהירות שמוסיפות סט פתיחה למסלול שבחרתם."
          title="התחלה מהירה"
          tone="success"
        >
          <div className="flex flex-wrap gap-3">
            {quickPacks.map((pack) => (
              <button
                className="rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-950"
                key={pack.id}
                onClick={() => applySkillPack(pack.skills)}
                type="button"
              >
                {pack.label}
              </button>
            ))}
          </div>
        </WizardSection>

        <WizardSection
          action={
            <AiSynthesisButton
              disabled={!canGenerateSkillsSummary}
              onApply={(nextValue) =>
                form.setValue('summary', nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onGenerate={() =>
                synthesizeResumeTextFromStructuredData({
                  employer: data.targetRole.targetEmployer,
                  kind: 'skills',
                  label: 'Skills synthesis',
                  language: data.resumeLanguage,
                  track,
                  context: buildSkillsSynthesisContext(),
                })
              }
            >
              ✨ צור ניסוח אוטומטי ב-AI
            </AiSynthesisButton>
          }
          description="AI יוצר ניסוח באנגלית רק מהכישורים שבחרתם, בלי להמציא ניסיון או הישגים."
          title="ניסוח AI לכישורים"
          tone="info"
        >
          <FieldShell label="תקציר כישורים באנגלית">
            <TextArea
              dir={data.resumeLanguage === 'he' ? 'rtl' : 'ltr'}
              onChange={(event) =>
                form.setValue('summary', event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="כאן יופיע הניסוח האוטומטי באנגלית, ואפשר לערוך אותו ידנית."
              rows={4}
              value={values.summary ?? ''}
            />
          </FieldShell>
        </WizardSection>

        {form.formState.errors.programmingLanguages?.message ? (
          <WizardSection tone="warning">
            <p className="text-sm font-medium text-rose-700">
              {form.formState.errors.programmingLanguages.message}
            </p>
          </WizardSection>
        ) : null}

        <div className="space-y-4">
          {categories.map(({ key, otherField }) => {
            const combinedSelection = [
              ...(values[key] ?? []),
              ...splitCommaSeparated(values[otherField] ?? ''),
            ]
            const categoryLabel = skillCategoryLabels.he[key]
            const recommendedSkills = getTrackRecommendedSkills(track, key)

            return (
              <WizardSection key={key} title={categoryLabel}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {recommendedSkills.map((skill) => (
                      <button
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:border-emerald-300 hover:bg-emerald-100"
                        key={`${key}-${skill}`}
                        onClick={() => {
                          if (combinedSelection.includes(skill)) {
                            return
                          }

                          setCategorySelection(key, otherField, [...combinedSelection, skill])
                        }}
                        type="button"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>

                  <FieldShell label="בחרו או הוסיפו מה שחסר">
                    <SearchableChipMultiSelect
                      allowCustom
                      dir="ltr"
                      onChange={(nextSelection) =>
                        setCategorySelection(key, otherField, nextSelection)
                      }
                      options={skillOptions[key]}
                      placeholder="חפשו כישור או הקלידו חדש"
                      value={combinedSelection}
                    />
                  </FieldShell>
                </div>
              </WizardSection>
            )
          })}
        </div>
      </StepFrame>
    </form>
  )
}
