import { GoogleGenerativeAI } from '@google/generative-ai'
import israelResumeResearch from '../../Israel_DS_Resume_Research.md?raw'
import { resumeDataSchema } from '../schemas/resume-schemas'
import type {
  ResumeData,
  ResumeLanguage,
  TargetEmployerType,
  TargetTrack,
} from '../types/resume'
import { splitMultilineText } from './utils'

export type GeminiFieldKind =
  | 'summary'
  | 'bullet'
  | 'headline'
  | 'phrase'
  | 'list'

export type StructuredResumeSynthesisKind =
  | 'military'
  | 'skills'
  | 'project'
  | 'experience'
  | 'education'

type ResumeTransformationMode = 'optimize' | 'translateToHebrew'

interface ImproveResumeTextOptions {
  text: string
  kind: GeminiFieldKind
  track: TargetTrack
  employer: TargetEmployerType
  language: ResumeLanguage
  label?: string
}

interface StructuredResumeSynthesisOptions {
  kind: StructuredResumeSynthesisKind
  context: string
  track: TargetTrack
  employer: TargetEmployerType
  language: ResumeLanguage
  label?: string
}

interface TransformResumeDataOptions {
  data: ResumeData
  mode: ResumeTransformationMode
}

const GEMINI_MODEL = 'gemini-3-flash-preview'

const BASE_RESEARCH_SYSTEM_INSTRUCTION = `Act as an Elite Tel Aviv Tech Recruiter and senior technical resume writer for the Israeli tech ecosystem in 2026. The user interface may be Hebrew and the raw candidate input may be Hebrew, English, or mixed.

Mandatory rules:
- Base every decision strictly on the research reference supplied below.
- Be tachles: direct, sharp, concise, and recruiter-readable in 6 to 8 seconds.
- Preserve only evidence that is explicitly present in the user input or structured selections.
- Never invent metrics, technologies, scope, teams, employers, units, or outcomes that are not supported by the provided facts.
- Never force XYZ, STAR, CAR, or any named formula. Choose the strongest impact-driven formulation that fits the evidence.
- Remove fluff, first-person phrasing, objectives, soft-skill buzzwords, filler, and weak passive wording.
- Translate Israeli military or national service experience into civilian corporate language when relevant.
- Never include classified targets, specific operations, geopolitical references, or sensitive military details.
- Keep the output suitable for Israeli startups and multinational R&D centers.

Research reference:
${israelResumeResearch}`

const TEXT_SYSTEM_INSTRUCTION = `${BASE_RESEARCH_SYSTEM_INSTRUCTION}

Return only the requested text output with no headings, no markdown, and no commentary.`

const JSON_SYSTEM_INSTRUCTION = `${BASE_RESEARCH_SYSTEM_INSTRUCTION}

Return valid JSON only. Do not wrap the JSON in markdown or add any commentary.`

const fieldGuidance: Record<GeminiFieldKind, string> = {
  summary:
    'Return 2 or 3 sentences maximum. Name the exact target role, stack, and proof of capability. Keep it tight enough for a one-page Israeli resume.',
  bullet:
    'Return exactly one resume bullet sentence. Lead with ownership and end with concrete impact when the source text supports it.',
  headline:
    'Return one concise resume-safe title or headline in 3 to 8 words.',
  phrase:
    'Return one concise technical phrase or sentence fragment without filler.',
  list: 'Return only a concise comma-separated list.',
}

const structuredGuidance: Record<StructuredResumeSynthesisKind, string> = {
  military:
    'Return 1 or 2 resume bullet lines. Translate the service into civilian, ATS-safe business language. Emphasize data, automation, decision support, leadership, logistics, execution, or operational readiness only when the provided facts support it.',
  skills:
    'Return 1 or 2 resume bullet lines that synthesize the selected technical stack into a sharp recruiter-facing capability snapshot. Focus on the stack and the delivery capability it implies. Do not invent projects, metrics, or years.',
  project:
    'Return 1 or 2 resume bullet lines that synthesize the project role, stack, goal, and project facts into a recruiter-ready summary. Do not invent outcomes or metrics.',
  experience:
    'Return 1 or 2 resume bullet lines that synthesize the role, company context, stack, and ownership area into a direct Israeli-market experience summary. Do not invent metrics, scale, or scope.',
  education:
    'Return one concise line that captures the academic focus, relevant coursework, and specialization in a recruiter-friendly way. Do not invent courses, honors, research, or achievements.',
}

const trackLabels: Record<TargetTrack, string> = {
  ds: 'Data Scientist',
  mle: 'Machine Learning Engineer',
  de: 'Data Engineer',
}

const employerLabels: Record<TargetEmployerType, string> = {
  startup: 'Israeli Startup',
  mnc: 'Multinational R&D Center',
}

let client: GoogleGenerativeAI | null = null

const getClient = () => {
  if (client) {
    return client
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY.')
  }

  client = new GoogleGenerativeAI(apiKey)
  return client
}

const sanitizeOutputLine = (value: string) =>
  value
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^\s*(?:[-*•]|\d+\.)\s*/, '')
    .trim()

const sanitizeModelOutput = (value: string, multiline = false) => {
  const normalized = value
    .trim()
    .replace(/^```[\w-]*\s*|\s*```$/g, '')
    .trim()

  const lines = splitMultilineText(normalized).map(sanitizeOutputLine).filter(Boolean)

  if (multiline) {
    return lines.slice(0, 2).join('\n')
  }

  return lines.join(' ').trim()
}

const extractJsonPayload = (value: string) => {
  const normalized = value
    .trim()
    .replace(/^```json\s*|^```\s*|\s*```$/g, '')
    .trim()

  try {
    return JSON.parse(normalized)
  } catch {
    const firstBrace = normalized.indexOf('{')
    const lastBrace = normalized.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('The model did not return valid JSON.')
    }

    return JSON.parse(normalized.slice(firstBrace, lastBrace + 1))
  }
}

const outputLanguageInstruction = (language: ResumeLanguage) =>
  language === 'he'
    ? 'Output language: Hebrew only. Use professional Hebrew suited to the Israeli tech market, while keeping product names, library names, and standard technology names in English when that is the accepted professional norm.'
    : 'Output language: English only. Use flawless business English suited to Israeli tech recruiters.'

const generateText = async ({
  prompt,
  multiline = false,
}: {
  prompt: string
  multiline?: boolean
}) => {
  const model = getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: TEXT_SYSTEM_INSTRUCTION,
  })

  const result = await model.generateContent(prompt)

  return sanitizeModelOutput(result.response.text(), multiline)
}

const generateResumeJsonDraft = async (prompt: string) => {
  const model = getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: JSON_SYSTEM_INSTRUCTION,
  })

  const result = await model.generateContent(prompt)
  return resumeDataSchema.parse(extractJsonPayload(result.response.text()))
}

const mergeTextValue = (base: string, draft: string) =>
  draft.trim() ? draft : base

const mergeTextArray = (base: string[], draft: string[]) =>
  Array.from({ length: Math.max(base.length, draft.length) }, (_, index) =>
    mergeTextValue(base[index] ?? '', draft[index] ?? ''),
  )

const mergeResumeDraft = (
  base: ResumeData,
  draft: ResumeData,
  targetLanguage: ResumeLanguage,
) =>
  resumeDataSchema.parse({
    ...base,
    resumeLanguage: targetLanguage,
    personalDetails: {
      ...base.personalDetails,
      location: mergeTextValue(base.personalDetails.location, draft.personalDetails.location),
    },
    targetRole: {
      ...base.targetRole,
      targetTitle: mergeTextValue(base.targetRole.targetTitle, draft.targetRole.targetTitle),
      summaryManualText: mergeTextValue(
        base.targetRole.summaryManualText,
        draft.targetRole.summaryManualText,
      ),
    },
    militaryService: {
      ...base.militaryService,
      branchOther: mergeTextValue(base.militaryService.branchOther, draft.militaryService.branchOther),
      unitOther: mergeTextValue(base.militaryService.unitOther, draft.militaryService.unitOther),
      roleTitle: mergeTextValue(base.militaryService.roleTitle, draft.militaryService.roleTitle),
      rank: mergeTextValue(base.militaryService.rank, draft.militaryService.rank),
      reserveDutyNote: mergeTextValue(
        base.militaryService.reserveDutyNote,
        draft.militaryService.reserveDutyNote,
      ),
      summary: mergeTextValue(base.militaryService.summary, draft.militaryService.summary),
      bullets: mergeTextArray(base.militaryService.bullets, draft.militaryService.bullets),
    },
    education: {
      ...base.education,
      degreeOther: mergeTextValue(base.education.degreeOther, draft.education.degreeOther),
      institutionOther: mergeTextValue(
        base.education.institutionOther,
        draft.education.institutionOther,
      ),
      courseworkOther: mergeTextValue(
        base.education.courseworkOther,
        draft.education.courseworkOther,
      ),
      focus: mergeTextValue(base.education.focus, draft.education.focus),
    },
    skills: {
      ...base.skills,
      summary: mergeTextValue(base.skills.summary, draft.skills.summary),
      programmingLanguagesOther: mergeTextValue(
        base.skills.programmingLanguagesOther,
        draft.skills.programmingLanguagesOther,
      ),
      machineLearningAIOther: mergeTextValue(
        base.skills.machineLearningAIOther,
        draft.skills.machineLearningAIOther,
      ),
      dataEngineeringMLOpsOther: mergeTextValue(
        base.skills.dataEngineeringMLOpsOther,
        draft.skills.dataEngineeringMLOpsOther,
      ),
      mathematicsAnalyticsOther: mergeTextValue(
        base.skills.mathematicsAnalyticsOther,
        draft.skills.mathematicsAnalyticsOther,
      ),
    },
    projects: base.projects.map((project, index) => {
      const nextProject = draft.projects[index] ?? project

      return {
        ...project,
        name: mergeTextValue(project.name, nextProject.name),
        summary: mergeTextValue(project.summary, nextProject.summary),
        role: mergeTextValue(project.role, nextProject.role),
        goal: mergeTextValue(project.goal, nextProject.goal),
        technologiesOther: mergeTextValue(
          project.technologiesOther,
          nextProject.technologiesOther,
        ),
        bullets: mergeTextArray(project.bullets, nextProject.bullets),
      }
    }),
    experiences: base.experiences.map((experience, index) => {
      const nextExperience = draft.experiences[index] ?? experience

      return {
        ...experience,
        role: mergeTextValue(experience.role, nextExperience.role),
        company: mergeTextValue(experience.company, nextExperience.company),
        summary: mergeTextValue(experience.summary, nextExperience.summary),
        goal: mergeTextValue(experience.goal, nextExperience.goal),
        techStackOther: mergeTextValue(
          experience.techStackOther,
          nextExperience.techStackOther,
        ),
        bullets: mergeTextArray(experience.bullets, nextExperience.bullets),
      }
    }),
  })

export const improveResumeText = async ({
  employer,
  kind,
  label,
  language,
  text,
  track,
}: ImproveResumeTextOptions) => {
  const input = text.trim()

  if (!input) {
    return ''
  }

  return generateText({
    prompt: `
Target track: ${trackLabels[track]}
Target company type: ${employerLabels[employer]}
${outputLanguageInstruction(language)}
User interface language: ${language === 'he' ? 'Hebrew' : 'English'}
Field type: ${kind}
Field label: ${label ?? 'Resume field'}

Instruction:
${fieldGuidance[kind]}

Original text:
${input}
`,
  })
}

export const synthesizeResumeTextFromStructuredData = async ({
  employer,
  kind,
  context,
  label,
  language,
  track,
}: StructuredResumeSynthesisOptions) => {
  const input = context.trim()

  if (!input) {
    return ''
  }

  return generateText({
    multiline: kind !== 'education',
    prompt: `
Target track: ${trackLabels[track]}
Target company type: ${employerLabels[employer]}
${outputLanguageInstruction(language)}
User interface language: ${language === 'he' ? 'Hebrew' : 'English'}
Structured task type: ${kind}
Field label: ${label ?? 'Structured resume synthesis'}

Instruction:
${structuredGuidance[kind]}

Structured candidate context:
${input}
`,
  })
}

export const transformResumeDataWithAi = async ({
  data,
  mode,
}: TransformResumeDataOptions) => {
  const targetLanguage: ResumeLanguage = mode === 'translateToHebrew' ? 'he' : data.resumeLanguage
  const taskInstruction =
    mode === 'translateToHebrew'
      ? `Translate all natural-language resume content fields into professional Hebrew. Keep URLs, email addresses, phone numbers, dates, ids, enum-like codes, and standard technology names accurate. When a technology or library is normally written in English in Israeli tech, leave it in English. Set resumeLanguage to "he".`
      : `Review the entire resume and improve the wording in its current language (${targetLanguage === 'he' ? 'Hebrew' : 'English'}). Fix typos, tighten phrasing to Israeli tech standards, and keep the writing direct, concise, and impact-driven. Set resumeLanguage to "${targetLanguage}".`

  const draft = await generateResumeJsonDraft(`
Task:
${taskInstruction}

Strict output contract:
- Return the full JSON object only.
- Keep the exact same object shape and the same array lengths.
- Do not add or remove projects, experience entries, bullets, skills, or fields.
- Keep empty strings empty when no evidence exists.
- Preserve all factual content unless you are fixing obvious grammar, spelling, phrasing, or translating the text.
- Never invent achievements, metrics, technologies, units, employers, dates, or responsibilities.
- Never use XYZ, STAR, CAR, or American coaching language.
- Write like a Tel Aviv tech recruiter: direct, bottom-line, concise, and readable at a glance.

Input resume JSON:
${JSON.stringify(data, null, 2)}
`)

  return mergeResumeDraft(data, draft, targetLanguage)
}
