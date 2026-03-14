import {
  courseworkOptions,
  degreeOptions,
  institutionOptions,
  resumeCopy,
  skillOptions,
} from '../data/options/resume-options'
import {
  militaryBranchOptions,
  militaryUnitOptions,
} from '../data/options/israel-resume-options'
import { getCareerTrackConfig } from '../data/options/career-track-options'
import { splitCommaSeparated } from './utils'
import type {
  EducationDetails,
  ExperienceEntry,
  LocalizedOption,
  MilitaryServiceDetails,
  ResumeData,
  ResumeLanguage,
  SkillCategoryKey,
  SkillsDetails,
  TargetRoleDetails,
} from '../types/resume'

const monthFormatters: Record<ResumeLanguage, Intl.DateTimeFormat> = {
  he: new Intl.DateTimeFormat('he-IL', { month: 'short', year: 'numeric' }),
  en: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }),
}

const summaryFocusCopy = {
  ds: {
    he: 'להפוך נתוני מוצר ולקוחות לניסויים, מודלים חזויים ותובנות תומכות החלטה',
    en: 'turn product and customer data into experiments, predictive models, and decision-ready insights',
  },
  mle: {
    he: 'להעלות מודלים ל-API מהירי תגובה, שירותים נצפים ותהליכי ML ברמת ייצור',
    en: 'ship models into low-latency APIs, observable services, and production-grade ML workflows',
  },
  de: {
    he: 'לבנות פייפליינים עמידים, מודלים למחסן נתונים ותשתיות נתונים אמינות לאנליטיקה ול-ML',
    en: 'build resilient pipelines, warehouse models, and trusted data foundations for analytics and ML',
  },
} as const

const localizedDefaultTargetTitles = {
  ds: {
    he: 'מדען/ית נתונים ג׳וניור',
    en: 'Junior Data Scientist',
  },
  mle: {
    he: 'מהנדס/ת למידת מכונה ג׳וניור',
    en: 'Junior Machine Learning Engineer',
  },
  de: {
    he: 'מהנדס/ת נתונים ג׳וניור',
    en: 'Junior Data Engineer',
  },
} as const

const evidenceLineCopy = {
  ds: {
    he: 'מגובה בעבודה מעשית בניסויים, מידול חזוי ואנליטיקה ברמת הנהלה.',
    en: 'Backed by hands-on work in experimentation, predictive modeling, and executive-ready analytics.',
  },
  mle: {
    he: 'מגובה בפרויקטים של פריסת מודלים, הפחתת זמני תגובה ומערכות ML בסביבת ייצור.',
    en: 'Backed by projects spanning model deployment, latency reduction, and production-scale ML systems.',
  },
  de: {
    he: 'מגובה בפרויקטים של קליטת נתונים בקנה מידה גדול, טרנספורמציות למחסן נתונים ופייפליינים אמינים.',
    en: 'Backed by projects spanning large-scale ingestion, warehouse transformation, and reliable scheduled pipelines.',
  },
} as const

const employerFocusCopy = {
  startup: {
    he: 'לזוז מהר בתוך צוותי מוצר ישראליים ולסגור לולאה מקצה לקצה',
    en: 'move quickly inside Israeli startup teams and own end-to-end delivery',
  },
  mnc: {
    he: 'להשתלב במרכזי R&D גלובליים עם עומק מתודולוגי, סקייל וסטנדרט גבוה',
    en: 'deliver rigorous work inside multinational R&D centers with strong engineering discipline',
  },
} as const

const militaryEvidenceLineCopy = {
  tech: {
    he: 'מגובה בניסיון שירות טכנולוגי עתיר דאטה, קצב קבלת החלטות גבוה, ועבודה תחת אילוצי אמת.',
    en: 'Grounded in military-grade data work, high-stakes execution, and direct decision support.',
  },
  combat: {
    he: 'מגובה בניסיון פיקודי, תפעולי ולוגיסטי בסביבה משתנה ולחוצה.',
    en: 'Grounded in cross-functional leadership, logistics, and execution under sustained pressure.',
  },
  operations: {
    he: 'מגובה בתיאום מבצעי, ניהול משאבים, ואחריות רציפה על מוכנות ותזמון.',
    en: 'Grounded in operational coordination, resource ownership, and reliable execution at pace.',
  },
  national: {
    he: 'מגובה בשירות לאומי עם אחריות מערכתית, עבודה מול בעלי עניין, ותפעול בקנה מידה.',
    en: 'Grounded in service operations, stakeholder coordination, and process ownership at scale.',
  },
} as const

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

export const resolveLocalizedOption = (
  options: LocalizedOption[],
  value: string,
  language: ResumeLanguage,
  fallback = '',
) => {
  const option = options.find((item) => item.value === value)

  if (!option) {
    return fallback
  }

  return language === 'he' ? option.labelHe : option.labelEn
}

export const getEducationDegreeText = (
  education: EducationDetails,
  language: ResumeLanguage,
) =>
  education.degree === 'other'
    ? education.degreeOther
    : resolveLocalizedOption(degreeOptions, education.degree, language, education.degreeOther)

export const getInstitutionText = (
  education: EducationDetails,
  language: ResumeLanguage,
) =>
  education.institution === 'other'
    ? education.institutionOther
    : resolveLocalizedOption(
        institutionOptions,
        education.institution,
        language,
        education.institutionOther,
      )

export const getCourseworkText = (
  education: EducationDetails,
  language: ResumeLanguage,
) => {
  const selected = education.coursework.map((coursework) =>
    resolveLocalizedOption(courseworkOptions, coursework, language, coursework),
  )

  return [...selected, ...splitCommaSeparated(education.courseworkOther)]
}

export const shouldDisplayIsraeliGpa = (education: EducationDetails) => {
  if (!education.includeGpa || !education.gpa.trim()) {
    return false
  }

  const score = Number(education.gpa)

  return Number.isFinite(score) && score >= 85
}

export const getSkillCategoryItems = (
  skills: SkillsDetails,
  category: SkillCategoryKey,
) => {
  const config = {
    programmingLanguages: [
      skills.programmingLanguages,
      skills.programmingLanguagesOther,
    ] as const,
    machineLearningAI: [skills.machineLearningAI, skills.machineLearningAIOther] as const,
    dataEngineeringMLOps: [
      skills.dataEngineeringMLOps,
      skills.dataEngineeringMLOpsOther,
    ] as const,
    mathematicsAnalytics: [
      skills.mathematicsAnalytics,
      skills.mathematicsAnalyticsOther,
    ] as const,
  }

  const [selected, other] = config[category]

  return [...selected, ...splitCommaSeparated(other)]
}

export const getAllSelectedTechnologies = (skills: SkillsDetails) => {
  const ordered = [
    ...getSkillCategoryItems(skills, 'programmingLanguages'),
    ...getSkillCategoryItems(skills, 'machineLearningAI'),
    ...getSkillCategoryItems(skills, 'dataEngineeringMLOps'),
    ...getSkillCategoryItems(skills, 'mathematicsAnalytics'),
  ]

  return Array.from(new Set(ordered))
}

export const getFallbackTechnologyChoices = () =>
  Array.from(
    new Set(
      Object.values(skillOptions)
        .flat()
        .sort((first, second) => first.localeCompare(second)),
    ),
  )

export const getProjectTechnologyChoices = (resumeData: ResumeData) => {
  const chosen = getAllSelectedTechnologies(resumeData.skills)

  return chosen.length > 0 ? chosen : getFallbackTechnologyChoices()
}

export const getResumeDirection = (language: ResumeLanguage) =>
  language === 'he' ? 'rtl' : 'ltr'

export const getResumeText = (language: ResumeLanguage) => resumeCopy[language]

export const formatDateRange = (
  experience: ExperienceEntry,
  language: ResumeLanguage,
) => {
  const formatPart = (value: string) => {
    if (!value) {
      return ''
    }

    const date = new Date(`${value}-01T00:00:00`)
    return monthFormatters[language].format(date)
  }

  const start = formatPart(experience.startDate)
  const end = experience.isCurrent
    ? resumeCopy[language].present
    : formatPart(experience.endDate)

  return [start, end].filter(Boolean).join(' - ')
}

export const formatServiceDateRange = (service: MilitaryServiceDetails) =>
  [service.startYear.trim(), service.endYear.trim()].filter(Boolean).join(' - ')

export const getMilitaryBranchText = (
  service: MilitaryServiceDetails,
  language: ResumeLanguage,
) =>
  service.branch === 'other'
    ? service.branchOther
    : resolveLocalizedOption(
        militaryBranchOptions,
        service.branch,
        language,
        service.branchOther,
      )

export const getMilitaryUnitText = (
  service: MilitaryServiceDetails,
  language: ResumeLanguage,
) =>
  service.unit === 'other'
    ? service.unitOther
    : resolveLocalizedOption(militaryUnitOptions, service.unit, language, service.unitOther)

export const getMilitarySectionTitle = (
  service: MilitaryServiceDetails,
  language: ResumeLanguage,
) =>
  service.serviceType === 'national'
    ? language === 'he'
      ? 'שירות לאומי'
      : 'National Service'
    : resumeCopy[language].militaryService

export const getResolvedTargetTitle = (
  targetRole: TargetRoleDetails,
  language: ResumeLanguage,
) => {
  const fallback = localizedDefaultTargetTitles[targetRole.targetTrack][language]
  const title = targetRole.targetTitle.trim() || fallback
  const englishDefault = getCareerTrackConfig(targetRole.targetTrack).defaultTargetTitle
  const localizedDefault = localizedDefaultTargetTitles[targetRole.targetTrack][language]

  if (language === 'he' && title === englishDefault) {
    return localizedDefault
  }

  if (language === 'en' && title === localizedDefaultTargetTitles[targetRole.targetTrack].he) {
    return localizedDefault
  }

  return title
}

export const buildProfessionalSummary = (data: ResumeData) => {
  const targetTitle = getResolvedTargetTitle(data.targetRole, data.resumeLanguage)
  const selectedSkills = getAllSelectedTechnologies(data.skills)
  const language = data.resumeLanguage
  const track = data.targetRole.targetTrack
  const targetEmployer = data.targetRole.targetEmployer
  const trackConfig = getCareerTrackConfig(track)
  const prioritizedStack = [
    ...trackConfig.targetStack.filter((item) => selectedSkills.includes(item)),
    ...selectedSkills.filter((item) => !trackConfig.targetStack.includes(item)),
    ...trackConfig.targetStack,
  ]
  const stack = Array.from(new Set(prioritizedStack)).slice(0, 5)
  const projectProofs = data.projects
    .map((project) => project.name.trim())
    .filter(Boolean)
    .slice(0, 2)
  const experienceProofs = data.experiences
    .filter((experience) => experience.role.trim() || experience.company.trim())
    .map((experience) =>
      [experience.role.trim(), experience.company.trim()]
        .filter(Boolean)
        .join(' at '),
    )
    .filter(Boolean)
    .slice(0, 1)
  const militaryProof =
    data.militaryService.enabled &&
    (data.militaryService.summary.trim() ||
      data.militaryService.roleTitle.trim() ||
      data.militaryService.unit.trim())
      ? militaryEvidenceLineCopy[data.militaryService.profile][language]
      : ''
  const proofLine =
    projectProofs.length > 0
      ? language === 'he'
        ? `מגובה בעבודה מעשית על ${joinWithConjunction(projectProofs, language)}.`
        : `Backed by hands-on work in ${joinWithConjunction(projectProofs, language)}.`
      : militaryProof
        ? militaryProof
      : experienceProofs.length > 0
        ? language === 'he'
          ? `מבוסס על ניסיון מוכח ב-${joinWithConjunction(experienceProofs, language)}.`
          : `Grounded in delivery across ${joinWithConjunction(
              experienceProofs,
              language,
            )}.`
        : evidenceLineCopy[track][language]

  const summary =
    language === 'he'
      ? `${targetTitle} עם התמחות ב-${joinWithConjunction(stack, language)} ויכולת ${summaryFocusCopy[track].he}, כדי ${employerFocusCopy[targetEmployer].he}. ${proofLine}`
      : `${targetTitle} using ${joinWithConjunction(stack, language)} to ${summaryFocusCopy[track].en}, prepared to ${employerFocusCopy[targetEmployer].en}. ${proofLine}`

  return summary.replace(/\s+/g, ' ').trim()
}

export const getProfessionalSummaryText = (data: ResumeData) =>
  data.targetRole.summaryMode === 'manual'
    ? data.targetRole.summaryManualText.trim()
    : buildProfessionalSummary(data)
