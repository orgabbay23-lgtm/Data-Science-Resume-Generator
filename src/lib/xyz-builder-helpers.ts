import {
  getTrackActionOptions,
  getTrackOutcomeOptions,
  xyzOutcomeOptions,
  type XyzOutcomeOption,
} from '../data/options/career-track-options'
import type { ResumeLanguage, SentenceBuilderState, TargetTrack } from '../types/resume'

const joinWithConjunction = (items: string[], language: ResumeLanguage) => {
  if (items.length <= 1) {
    return items[0] ?? ''
  }

  if (language === 'he') {
    return items.join(', ')
  }

  const conjunction = 'and'

  if (items.length === 2) {
    return `${items[0]} ${conjunction} ${items[1]}`
  }

  const head = items.slice(0, -1).join(', ')
  const tail = items.at(-1)

  return `${head}, ${conjunction} ${tail}`
}

const appendSuffix = (value: string, suffix?: string) => {
  if (!suffix || value.endsWith(suffix)) {
    return value
  }

  return `${value}${suffix}`
}

export const getOutcomeTemplate = (
  track: TargetTrack,
  key: string,
): XyzOutcomeOption | undefined =>
  getTrackOutcomeOptions(track).find((option) => option.value === key) ??
  xyzOutcomeOptions.find((option) => option.value === key)

export const getOutcomeLabel = (
  option: XyzOutcomeOption,
  language: ResumeLanguage,
) => (language === 'he' ? option.measurementLabelHe : option.measurementLabelEn)

export const hasCompleteBuilder = (builder: SentenceBuilderState) =>
  builder.mode === 'manual'
    ? Boolean(builder.manualText.trim())
    : Boolean(
        builder.scope.trim() &&
          builder.actionVerb.trim() &&
          builder.technologies.length > 0 &&
          builder.outcomeKey.trim() &&
          builder.outcomeValue.trim(),
      )

export const buildXyzSentence = (
  builder: SentenceBuilderState,
  language: ResumeLanguage,
  track: TargetTrack,
) => {
  if (builder.mode === 'manual') {
    return builder.manualText.trim()
  }

  if (!hasCompleteBuilder(builder)) {
    return ''
  }

  const actionOption = getTrackActionOptions(track).find(
    (option) => option.value === builder.actionVerb,
  )
  const outcome = getOutcomeTemplate(track, builder.outcomeKey)
  const actionLabel =
    (language === 'he' ? actionOption?.labelHe : actionOption?.labelEn) ??
    builder.actionVerb
  const accomplishment =
    outcome
      ? language === 'he'
        ? outcome.accomplishmentHe
        : outcome.accomplishmentEn
      : `improve ${builder.outcomeKey.trim()}`
  const measurementLabel =
    outcome
      ? language === 'he'
        ? outcome.measurementLabelHe
        : outcome.measurementLabelEn
      : builder.outcomeKey.trim()
  const measurementValue = appendSuffix(builder.outcomeValue.trim(), outcome?.suffix)
  const baselineClause = builder.baseline.trim()
    ? language === 'he'
      ? ` עבור ${builder.baseline.trim()}`
      : ` for ${builder.baseline.trim()}`
    : ''
  const technologyText = joinWithConjunction(builder.technologies.slice(0, 5), language)

  const sentence =
    language === 'he'
      ? `${actionLabel} של ${builder.scope.trim()}${baselineClause} באמצעות ${technologyText}, כדי ${accomplishment}, והביא ל${measurementLabel} של ${measurementValue}.`
      : `${actionLabel} ${builder.scope.trim()}${baselineClause} to ${accomplishment}, as measured by ${measurementValue} ${measurementLabel}, using ${technologyText}.`

  return sentence.replace(/\s+/g, ' ').trim()
}
