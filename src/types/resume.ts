export type ResumeLanguage = 'he' | 'en'
export type BuilderMode = 'guided' | 'manual'
export type TargetTrack = 'ds' | 'mle' | 'de'
export type TargetEmployerType = 'startup' | 'mnc'
export type MilitaryServiceType = 'military' | 'national'
export type MilitaryServiceProfile = 'tech' | 'combat' | 'operations' | 'national'

export const ENFORCED_RESUME_LANGUAGE: ResumeLanguage = 'en'

export type SkillCategoryKey =
  | 'programmingLanguages'
  | 'machineLearningAI'
  | 'dataEngineeringMLOps'
  | 'mathematicsAnalytics'

export interface LocalizedOption {
  value: string
  labelHe: string
  labelEn: string
  keywords?: string[]
}

export interface PersonalDetails {
  fullName: string
  email: string
  phone: string
  location: string
  linkedinUrl: string
  githubUrl: string
  portfolioUrl: string
}

export interface TargetRoleDetails {
  targetTrack: TargetTrack
  targetTitle: string
  targetEmployer: TargetEmployerType
  summaryMode: BuilderMode
  summaryManualText: string
}

export interface EducationDetails {
  degree: string
  degreeOther: string
  institution: string
  institutionOther: string
  graduationYear: string
  includeGpa: boolean
  gpa: string
  includeCoursework: boolean
  coursework: string[]
  courseworkOther: string
  focus: string
}

export interface SkillsDetails {
  summary: string
  programmingLanguages: string[]
  programmingLanguagesOther: string
  machineLearningAI: string[]
  machineLearningAIOther: string
  dataEngineeringMLOps: string[]
  dataEngineeringMLOpsOther: string
  mathematicsAnalytics: string[]
  mathematicsAnalyticsOther: string
}

export interface MilitaryServiceDetails {
  enabled: boolean
  serviceType: MilitaryServiceType
  profile: MilitaryServiceProfile
  branch: string
  branchOther: string
  unit: string
  unitOther: string
  roleTitle: string
  rank: string
  startYear: string
  endYear: string
  activeSecurityClearance: boolean
  includeReserveDuty: boolean
  reserveDutyNote: string
  summary: string
  bullets: string[]
}

export interface SentenceBuilderState {
  mode: BuilderMode
  manualText: string
  baseline: string
  scope: string
  actionVerb: string
  technologies: string[]
  outcomeKey: string
  outcomeValue: string
}

export interface ProjectEntry {
  id: string
  templateKey: string
  name: string
  link: string
  summary: string
  role: string
  goal: string
  technologies: string[]
  technologiesOther: string
  bullets: string[]
  bulletBuilders: SentenceBuilderState[]
}

export interface ExperienceEntry {
  id: string
  role: string
  company: string
  summary: string
  goal: string
  techStack: string[]
  techStackOther: string
  startDate: string
  endDate: string
  isCurrent: boolean
  bullets: string[]
  bulletBuilders: SentenceBuilderState[]
}

export interface ResumeData {
  resumeLanguage: ResumeLanguage
  personalDetails: PersonalDetails
  targetRole: TargetRoleDetails
  militaryService: MilitaryServiceDetails
  education: EducationDetails
  skills: SkillsDetails
  projects: ProjectEntry[]
  experienceEnabled: boolean
  experiences: ExperienceEntry[]
}

export const getDefaultGraduationYear = () => String(new Date().getFullYear() + 1)

export const createEmptySentenceBuilder = (): SentenceBuilderState => ({
  mode: 'guided',
  manualText: '',
  baseline: '',
  scope: '',
  actionVerb: '',
  technologies: [],
  outcomeKey: '',
  outcomeValue: '',
})

export const ensureSentenceBuilder = (
  builder?: Partial<SentenceBuilderState>,
): SentenceBuilderState => ({
  ...createEmptySentenceBuilder(),
  ...builder,
  mode: builder?.mode ?? (builder?.manualText?.trim() ? 'manual' : 'guided'),
  technologies: builder?.technologies ?? [],
})

const uniqueTrimmedStrings = (...collections: Array<string[] | undefined>) =>
  Array.from(
    new Set(
      collections
        .flatMap((collection) => collection ?? [])
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )

const buildProjectBullets = (
  project?: Partial<ProjectEntry> & {
    goal?: string
    result?: string
    storyBuilder?: {
      focus?: string
      technologies?: string[]
      methods?: string[]
      outcomeKey?: string
      outcomeValue?: string
    }
  },
) => {
  if (project?.bullets?.length) {
    return project.bullets
  }

  const legacyBullets = [project?.goal ?? '', project?.result ?? ''].filter(
    (item) => item.trim().length > 0,
  )

  if (legacyBullets.length > 0) {
    return legacyBullets
  }

  return ['', '']
}

const buildProjectBulletBuilders = (
  project?: Partial<ProjectEntry> & {
    goal?: string
    result?: string
    storyBuilder?: {
      focus?: string
      technologies?: string[]
      methods?: string[]
      outcomeKey?: string
      outcomeValue?: string
    }
  },
  fallbackTechnologies?: string[],
) => {
  if (project?.bulletBuilders?.length) {
    return project.bulletBuilders.map((builder, index) =>
      ensureSentenceBuilder({
        ...builder,
        manualText:
          builder?.mode === 'manual'
            ? builder.manualText
            : project.bullets?.[index] ?? builder?.manualText ?? '',
      }),
    )
  }

  const legacyFocus = project?.storyBuilder?.focus ?? project?.name ?? ''

  return [
    ensureSentenceBuilder({
      mode: project?.goal?.trim() ? 'manual' : 'guided',
      manualText: project?.goal ?? '',
      scope: legacyFocus,
      technologies: fallbackTechnologies ?? [],
    }),
    ensureSentenceBuilder({
      mode: project?.result?.trim() ? 'manual' : 'guided',
      manualText: project?.result ?? '',
      scope: legacyFocus,
      technologies: fallbackTechnologies ?? [],
      outcomeKey: project?.storyBuilder?.outcomeKey ?? '',
      outcomeValue: project?.storyBuilder?.outcomeValue ?? '',
    }),
  ]
}

export const createEmptyProject = (): ProjectEntry => ({
  id: crypto.randomUUID(),
  templateKey: '',
  name: '',
  link: '',
  summary: '',
  role: '',
  goal: '',
  technologies: [],
  technologiesOther: '',
  bullets: ['', ''],
  bulletBuilders: [createEmptySentenceBuilder(), createEmptySentenceBuilder()],
})

type ProjectEntryInput = Partial<ProjectEntry> & {
  goal?: string
  result?: string
  storyBuilder?: {
    focus?: string
    technologies?: string[]
    methods?: string[]
    outcomeKey?: string
    outcomeValue?: string
  }
}

export const ensureProjectEntry = (project?: ProjectEntryInput): ProjectEntry => {
  const base = createEmptyProject()
  const fallbackTechnologies = uniqueTrimmedStrings(
    project?.technologies,
    project?.storyBuilder?.methods,
    project?.storyBuilder?.technologies,
  )
  const bullets = Array.from(
    { length: Math.max(2, buildProjectBullets(project).length) },
    (_, index) => buildProjectBullets(project)[index] ?? '',
  )
  const bulletBuilders = Array.from(
    {
      length: Math.max(
        2,
        buildProjectBulletBuilders(project, fallbackTechnologies).length,
      ),
    },
    (_, index) => {
      const builder = ensureSentenceBuilder(
        buildProjectBulletBuilders(project, fallbackTechnologies)[index],
      )

      if (builder.mode === 'manual') {
        return {
          ...builder,
          manualText: bullets[index] || builder.manualText,
        }
      }

      return builder
    },
  )

  return {
    ...base,
    ...project,
    link: project?.link ?? base.link,
    summary:
      project?.summary ??
      bullets.find((item) => item.trim().length > 0) ??
      base.summary,
    role: project?.role ?? base.role,
    goal: project?.goal ?? base.goal,
    technologies: fallbackTechnologies,
    bullets,
    bulletBuilders,
  }
}

export const createEmptyExperience = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  role: '',
  company: '',
  summary: '',
  goal: '',
  techStack: [],
  techStackOther: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  bullets: ['', '', ''],
  bulletBuilders: [
    createEmptySentenceBuilder(),
    createEmptySentenceBuilder(),
    createEmptySentenceBuilder(),
  ],
})

export const createEmptyMilitaryService = (): MilitaryServiceDetails => ({
  enabled: false,
  serviceType: 'military',
  profile: 'tech',
  branch: '',
  branchOther: '',
  unit: '',
  unitOther: '',
  roleTitle: '',
  rank: '',
  startYear: '',
  endYear: '',
  activeSecurityClearance: false,
  includeReserveDuty: false,
  reserveDutyNote: '',
  summary: '',
  bullets: ['', ''],
})

export const ensureMilitaryServiceDetails = (
  service?: Partial<MilitaryServiceDetails>,
): MilitaryServiceDetails => {
  const base = createEmptyMilitaryService()
  const bullets = Array.from(
    { length: Math.max(2, service?.bullets?.length ?? 2) },
    (_, index) => service?.bullets?.[index] ?? '',
  )

  return {
    ...base,
    ...service,
    bullets,
  }
}

type ExperienceEntryInput = Partial<Omit<ExperienceEntry, 'bulletBuilders'>> & {
  bulletBuilders?: Array<Partial<SentenceBuilderState>>
}

export const ensureExperienceEntry = (
  experience?: ExperienceEntryInput,
): ExperienceEntry => {
  const base = createEmptyExperience()
  const bullets = Array.from(
    { length: Math.max(3, experience?.bullets?.length ?? 3) },
    (_, index) => experience?.bullets?.[index] ?? '',
  )
  const bulletBuilders = Array.from(
    { length: Math.max(3, experience?.bulletBuilders?.length ?? 3) },
    (_, index) => {
      const builder = ensureSentenceBuilder(experience?.bulletBuilders?.[index])

      if (builder.mode === 'manual') {
        return {
          ...builder,
          manualText: bullets[index] || builder.manualText,
        }
      }

      return builder
    },
  )

  return {
    ...base,
    ...experience,
    summary:
      experience?.summary ??
      bullets.find((item) => item.trim().length > 0) ??
      base.summary,
    goal: experience?.goal ?? base.goal,
    techStack: experience?.techStack ?? base.techStack,
    techStackOther: experience?.techStackOther ?? base.techStackOther,
    bullets,
    bulletBuilders,
  }
}

export const createEmptyResumeData = (): ResumeData => ({
  resumeLanguage: ENFORCED_RESUME_LANGUAGE,
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  },
  targetRole: {
    targetTrack: 'ds',
    targetTitle: 'Junior Data Scientist',
    targetEmployer: 'startup',
    summaryMode: 'guided',
    summaryManualText: '',
  },
  militaryService: createEmptyMilitaryService(),
  education: {
    degree: '',
    degreeOther: '',
    institution: '',
    institutionOther: '',
    graduationYear: getDefaultGraduationYear(),
    includeGpa: false,
    gpa: '',
    includeCoursework: false,
    coursework: [],
    courseworkOther: '',
    focus: '',
  },
  skills: {
    summary: '',
    programmingLanguages: [],
    programmingLanguagesOther: '',
    machineLearningAI: [],
    machineLearningAIOther: '',
    dataEngineeringMLOps: [],
    dataEngineeringMLOpsOther: '',
    mathematicsAnalytics: [],
    mathematicsAnalyticsOther: '',
  },
  projects: [],
  experienceEnabled: false,
  experiences: [],
})
