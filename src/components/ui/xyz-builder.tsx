import { useMemo, useState } from 'react'
import { Gauge, Sparkles, WandSparkles } from 'lucide-react'
import {
  getTrackActionOptions,
  getTrackOutcomeOptions,
} from '../../data/options/career-track-options'
import {
  buildXyzSentence,
  getOutcomeLabel,
  getOutcomeTemplate,
} from '../../lib/xyz-builder-helpers'
import { splitCommaSeparated } from '../../lib/utils'
import type {
  BuilderMode,
  ResumeLanguage,
  SentenceBuilderState,
  TargetEmployerType,
  TargetTrack,
} from '../../types/resume'
import { FieldShell } from './field-shell'
import { Input } from './input'
import { InputModeToggle } from './input-mode-toggle'
import { SearchableChipMultiSelect } from './searchable-chip-multi-select'
import { SearchableCombobox } from './searchable-combobox'
import { TextArea } from './textarea'
import { AiFieldAction } from './ai-field-action'

interface XyzBuilderProps {
  language: ResumeLanguage
  track: TargetTrack
  employer: TargetEmployerType
  value: SentenceBuilderState
  technologyOptions: string[]
  variant: 'project' | 'experience'
  onChange: (value: SentenceBuilderState) => void
  fallbackSentence?: string
  labels?: {
    baseline?: string
    scope?: string
    action?: string
    technology?: string
    outcome?: string
    metric?: string
    preview?: string
  }
}

const getInitialMode = (
  knownValues: string[],
  value: string,
): BuilderMode =>
  value.trim() && !knownValues.includes(value) ? 'manual' : 'guided'

const getListMode = (knownValues: string[], values: string[]): BuilderMode =>
  values.some((item) => !knownValues.includes(item)) ? 'manual' : 'guided'

const getTrackedMode = (
  state: { key: string; value: BuilderMode },
  key: string,
  fallback: BuilderMode,
) => (state.key === key ? state.value : fallback)

export const XyzBuilder = ({
  employer,
  language,
  track,
  value,
  technologyOptions,
  variant,
  onChange,
  fallbackSentence,
  labels,
}: XyzBuilderProps) => {
  const actionOptions = useMemo(
    () =>
      getTrackActionOptions(track).map((option) => ({
        value: option.value,
        label: language === 'he' ? option.labelHe : option.labelEn,
      })),
    [language, track],
  )
  const outcomeOptions = useMemo(
    () =>
      getTrackOutcomeOptions(track).map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [track],
  )
  const previewSentence = useMemo(
    () => buildXyzSentence(value, language, track),
    [language, track, value],
  )
  const selectedOutcome = useMemo(
    () => getOutcomeTemplate(track, value.outcomeKey),
    [track, value.outcomeKey],
  )
  const actionKey = `${track}:${value.actionVerb}:${actionOptions
    .map((option) => option.value)
    .join('|')}`
  const technologyKey = `${track}:${technologyOptions.join('|')}:${value.technologies.join('|')}`
  const outcomeKey = `${track}:${value.outcomeKey}:${outcomeOptions
    .map((option) => option.value)
    .join('|')}`
  const derivedActionMode = getInitialMode(
    actionOptions.map((option) => option.value),
    value.actionVerb,
  )
  const derivedTechnologyMode = getListMode(technologyOptions, value.technologies)
  const derivedOutcomeMode = getInitialMode(
    outcomeOptions.map((option) => option.value),
    value.outcomeKey,
  )
  const [actionModeState, setActionModeState] = useState({
    key: actionKey,
    value: derivedActionMode,
  })
  const [technologyModeState, setTechnologyModeState] = useState({
    key: technologyKey,
    value: derivedTechnologyMode,
  })
  const [outcomeModeState, setOutcomeModeState] = useState({
    key: outcomeKey,
    value: derivedOutcomeMode,
  })
  const actionMode = getTrackedMode(actionModeState, actionKey, derivedActionMode)
  const technologyMode = getTrackedMode(
    technologyModeState,
    technologyKey,
    derivedTechnologyMode,
  )
  const outcomeMode = getTrackedMode(outcomeModeState, outcomeKey, derivedOutcomeMode)

  return (
    <div className="space-y-4 rounded-[30px] border border-cyan-100/80 bg-[linear-gradient(135deg,rgba(248,252,255,0.97),rgba(236,253,245,0.88))] p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-[24px] border border-white/80 bg-white/78 px-4 py-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">מבנה Google XYZ</div>
          <div className="mt-1 text-sm leading-6 text-slate-500">
            הגדירו את X, מדדו את Y, ופרטו בדיוק איך השגתם זאת ב-Z.
          </div>
        </div>
        <InputModeToggle
          guidedLabel="מודרך XYZ"
          manualLabel="אחר / מותאם"
          value={value.mode}
          onChange={(nextMode) =>
            onChange({
              ...value,
              mode: nextMode,
              manualText:
                nextMode === 'manual' && !value.manualText.trim()
                  ? previewSentence || fallbackSentence || ''
                  : value.manualText,
            })
          }
        />
      </div>

      {value.mode === 'manual' ? (
        <FieldShell label={labels?.preview ?? 'בולט מותאם אישית'}>
          <AiFieldAction
            employer={employer}
            kind="bullet"
            label={labels?.preview ?? 'בולט מותאם אישית'}
            language={language}
            onApply={(nextValue) =>
              onChange({
                ...value,
                manualText: nextValue,
              })
            }
            track={track}
            value={value.manualText}
          >
            <TextArea
              onChange={(event) =>
                onChange({
                  ...value,
                  manualText: event.target.value,
                })
              }
              placeholder="כתבו את הבולט ידנית."
              rows={5}
              value={value.manualText}
            />
          </AiFieldAction>
        </FieldShell>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <FieldShell
              description="האילוץ, הדאטה-סט או הרגע העסקי שממסגר את הבולט."
              label={labels?.baseline ?? 'סיטואציה / נקודת פתיחה'}
            >
              <AiFieldAction
                employer={employer}
                kind="phrase"
                label={labels?.baseline ?? 'סיטואציה / נקודת פתיחה'}
                language={language}
                onApply={(nextValue) =>
                  onChange({
                    ...value,
                    baseline: nextValue,
                  })
                }
                track={track}
                value={value.baseline}
              >
                <Input
                  onChange={(event) =>
                    onChange({
                      ...value,
                      baseline: event.target.value,
                    })
                  }
                  placeholder="לדוגמה: עבור 2.5M רשומות לקוחות ב-4 אזורים"
                  value={value.baseline}
                />
              </AiFieldAction>
            </FieldShell>

            <FieldShell
              description="מה בדיוק בניתם, הטמעתם, אופטימזתם או ניתחתם?"
              label={labels?.scope ?? 'מה היה באחריותכם'}
            >
              <AiFieldAction
                employer={employer}
                kind="phrase"
                label={labels?.scope ?? 'מה היה באחריותכם'}
                language={language}
                onApply={(nextValue) =>
                  onChange({
                    ...value,
                    scope: nextValue,
                  })
                }
                track={track}
                value={value.scope}
              >
                <Input
                  onChange={(event) =>
                    onChange({
                      ...value,
                      scope: event.target.value,
                    })
                  }
                  placeholder="לדוגמה: API לאינפרנס הונאות בזמן אמת"
                  value={value.scope}
                />
              </AiFieldAction>
            </FieldShell>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <FieldShell
              label={labels?.action ?? 'סוג הפעולה'}
              labelSuffix={
                <InputModeToggle
                  className="ms-auto"
                  manualLabel="אחר / מותאם"
                  value={actionMode}
                  onChange={(nextMode) =>
                    setActionModeState({ key: actionKey, value: nextMode })
                  }
                />
              }
            >
              {actionMode === 'manual' ? (
                <AiFieldAction
                  employer={employer}
                  kind="phrase"
                  label={labels?.action ?? 'סוג הפעולה'}
                  language={language}
                  onApply={(nextValue) =>
                    onChange({
                      ...value,
                      actionVerb: nextValue,
                    })
                  }
                  track={track}
                  value={value.actionVerb}
                >
                  <Input
                    onChange={(event) =>
                      onChange({
                        ...value,
                        actionVerb: event.target.value,
                      })
                    }
                    placeholder="לדוגמה: Instrumented"
                    value={value.actionVerb}
                  />
                </AiFieldAction>
              ) : (
                <SearchableCombobox
                  commitFreeText={false}
                  customActionLabel="פעולה אחרת / מותאמת"
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                  emptyMessage="עדיין אין התאמה לפעולה."
                  onCustomRequest={() =>
                    setActionModeState({ key: actionKey, value: 'manual' })
                  }
                  onOptionSelect={(option) =>
                    onChange({
                      ...value,
                      actionVerb: option.value,
                    })
                  }
                  onValueChange={(nextValue) => {
                    const exactMatch = actionOptions.find((option) => option.label === nextValue)

                    onChange({
                      ...value,
                      actionVerb: exactMatch?.value ?? value.actionVerb,
                    })
                  }}
                  options={actionOptions}
                  placeholder="חיפוש פעולות איכותיות"
                  value={
                    actionOptions.find((option) => option.value === value.actionVerb)?.label ?? ''
                  }
                />
              )}
            </FieldShell>

            <FieldShell
              label={labels?.outcome ?? 'תוצאה מדידה'}
              labelSuffix={
                <InputModeToggle
                  className="ms-auto"
                  manualLabel="אחר / מותאם"
                  value={outcomeMode}
                  onChange={(nextMode) =>
                    setOutcomeModeState({ key: outcomeKey, value: nextMode })
                  }
                />
              }
            >
              {outcomeMode === 'manual' ? (
                <AiFieldAction
                  employer={employer}
                  kind="phrase"
                  label={labels?.outcome ?? 'תוצאה מדידה'}
                  language={language}
                  onApply={(nextValue) =>
                    onChange({
                      ...value,
                      outcomeKey: nextValue,
                    })
                  }
                  track={track}
                  value={value.outcomeKey}
                >
                  <Input
                    onChange={(event) =>
                      onChange({
                        ...value,
                        outcomeKey: event.target.value,
                      })
                    }
                    placeholder="לדוגמה: ranking quality"
                    value={value.outcomeKey}
                  />
                </AiFieldAction>
              ) : (
                <SearchableCombobox
                  commitFreeText={false}
                  customActionLabel="מדד אחר / מותאם"
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                  emptyMessage="עדיין אין התאמה למדד."
                  onCustomRequest={() =>
                    setOutcomeModeState({ key: outcomeKey, value: 'manual' })
                  }
                  onOptionSelect={(option) =>
                    onChange({
                      ...value,
                      outcomeKey: option.value,
                    })
                  }
                  onValueChange={(nextValue) => {
                    const exactMatch = outcomeOptions.find((option) => option.label === nextValue)

                    onChange({
                      ...value,
                      outcomeKey: exactMatch?.value ?? value.outcomeKey,
                    })
                  }}
                  options={outcomeOptions}
                  placeholder="חיפוש מדדים כמו latency, ROI או accuracy"
                  value={
                    outcomeOptions.find((option) => option.value === value.outcomeKey)?.label ??
                    ''
                  }
                />
              )}
            </FieldShell>
          </div>

          <FieldShell
            label={labels?.technology ?? 'סטאק טכנולוגי'}
            labelSuffix={
              <InputModeToggle
                className="ms-auto"
                manualLabel="אחר / מותאם"
                value={technologyMode}
                onChange={(nextMode) =>
                  setTechnologyModeState({ key: technologyKey, value: nextMode })
                }
              />
            }
          >
            {technologyMode === 'manual' ? (
              <AiFieldAction
                employer={employer}
                kind="list"
                label={labels?.technology ?? 'סטאק טכנולוגי'}
                language={language}
                onApply={(nextValue) =>
                  onChange({
                    ...value,
                    technologies: splitCommaSeparated(nextValue),
                  })
                }
                track={track}
                value={value.technologies.join('\n')}
              >
                <TextArea
                  onChange={(event) =>
                    onChange({
                      ...value,
                      technologies: splitCommaSeparated(event.target.value),
                    })
                  }
                  placeholder="פריט בכל שורה או מופרד בפסיקים."
                  rows={4}
                  value={value.technologies.join('\n')}
                />
              </AiFieldAction>
            ) : (
              <SearchableChipMultiSelect
                allowCustom
                customActionLabel="טכנולוגיה אחרת / מותאמת"
                dir="ltr"
                onChange={(nextValue) =>
                  onChange({
                    ...value,
                    technologies: nextValue,
                  })
                }
                onCustomRequest={() =>
                  setTechnologyModeState({ key: technologyKey, value: 'manual' })
                }
                options={technologyOptions}
                placeholder="חיפוש הסטאק שמופיע בבולט"
                value={value.technologies}
              />
            )}
          </FieldShell>

          <FieldShell
            description={
              selectedOutcome
                ? `תבנית: ${getOutcomeLabel(selectedOutcome, language)}`
                : 'הזינו ערך מדיד, אחוז, סכום כספי או הוכחת סקייל.'
            }
            label={labels?.metric ?? 'ערך המדד'}
          >
            <div className="space-y-3">
              <Input
                onChange={(event) =>
                    onChange({
                      ...value,
                      outcomeValue: event.target.value,
                    })
                  }
                placeholder="לדוגמה: 40, 0.91, 10K qps, $150K"
                value={value.outcomeValue}
              />
              {selectedOutcome?.quickValues.length ? (
                <div className="flex flex-wrap gap-2">
                  {selectedOutcome.quickValues.map((quickValue) => (
                    <button
                      className="rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-950"
                      key={quickValue}
                      onClick={() =>
                        onChange({
                          ...value,
                          outcomeValue: quickValue,
                        })
                      }
                      type="button"
                    >
                      <Gauge className="me-1 inline size-3.5" />
                      {quickValue}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </FieldShell>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <div className="rounded-[24px] border border-white/80 bg-white/82 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
            <Sparkles className="size-4" />
            <span>{variant === 'project' ? 'פירוק XYZ של הפרויקט' : 'פירוק XYZ של התפקיד'}</span>
          </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div>
                  <div className="font-semibold text-slate-900">X: מה הושג</div>
                  <div>
                    {(language === 'he'
                      ? selectedOutcome?.accomplishmentHe
                      : selectedOutcome?.accomplishmentEn) ||
                      value.outcomeKey ||
                      'בחרו תוצאה מדידה.'}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Y: איך מודדים</div>
                  <div>{value.outcomeValue || 'הוסיפו את ערך המדד.'}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Z: איך בוצע</div>
                  <div>
                    {value.actionVerb || 'בחרו פעולה'}{' '}
                    {value.technologies.length > 0
                      ? `באמצעות ${value.technologies.join(', ')}`
                      : 'באמצעות הסטאק שלכם'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-cyan-200/80 bg-white/92 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                <WandSparkles className="size-4" />
                <span>{labels?.preview ?? 'תצוגה מקדימה אוטומטית'}</span>
              </div>
              <div className="mt-4 min-h-24 text-sm leading-7 text-slate-700">
                {previewSentence ||
                  fallbackSentence ||
                  'הגדירו את נקודת הפתיחה, הפעולה, המדד והסטאק כדי לייצר משפט XYZ שמתאים למחקר.'}
              </div>
              <div className="mt-4 rounded-[18px] border border-dashed border-slate-200 bg-slate-50/80 px-3 py-3 text-xs leading-6 text-slate-500">
                הימנעו מפעלים כלליים כמו "leveraged" או "worked on". המחולל מקדם רק פעולות חדות וברורות.
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/80 bg-white/76 px-4 py-4 text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-900">הערת STAR:</span> שדה נקודת
            הפתיחה לוכד את הסיטואציה או המשימה, והמשפט שנוצר מכניס את הפעולה והתוצאה
            המדידה לשורת XYZ קומפקטית.
          </div>
        </>
      )}
    </div>
  )
}
