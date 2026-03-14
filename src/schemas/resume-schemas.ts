import { z } from 'zod'
import {
  createEmptyExperience,
  createEmptyMilitaryService,
  createEmptyProject,
} from '../types/resume'

export const resumeLanguageSchema = z.enum(['en', 'he'])

const optionalUrlField = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' ||
      /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-./?%&=+#]*)?$/i.test(value),
    {
      message: 'יש להזין כתובת URL תקינה או להשאיר את השדה ריק.',
    },
  )

const nonEmptyText = (message: string) => z.string().trim().min(1, message)

const personalDetailsSchema = z.object({
  fullName: nonEmptyText('יש להזין שם מלא.'),
  email: z.string().trim().email('יש להזין כתובת אימייל תקינה.'),
  phone: nonEmptyText('יש להזין מספר טלפון.'),
  location: nonEmptyText('יש להזין עיר ואזור / מדינה.'),
  linkedinUrl: optionalUrlField,
  githubUrl: optionalUrlField,
  portfolioUrl: optionalUrlField,
})

export const initializationSchema = z.object({
  resumeLanguage: resumeLanguageSchema,
  ...personalDetailsSchema.shape,
})

export type InitializationFormValues = z.infer<typeof initializationSchema>

export const targetRoleSchema = z
  .object({
    targetTrack: z.enum(['ds', 'mle', 'de']),
    targetTitle: nonEmptyText('יש לבחור או לכתוב כותרת יעד.'),
    targetEmployer: z.enum(['startup', 'mnc']),
    summaryMode: z.enum(['guided', 'manual']),
    summaryManualText: z.string().trim(),
  })
  .superRefine((value, context) => {
    if (value.summaryMode === 'manual' && !value.summaryManualText) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['summaryManualText'],
        message: 'יש לכתוב תקציר מותאם אישית או לחזור למצב אוטומטי.',
      })
    }
  })

export type TargetRoleFormValues = z.infer<typeof targetRoleSchema>

export const militaryServiceSchema = z
  .object({
    enabled: z.boolean(),
    serviceType: z.enum(['military', 'national']),
    profile: z.enum(['tech', 'combat', 'operations', 'national']),
    branch: z.string().trim(),
    branchOther: z.string().trim(),
    unit: z.string().trim(),
    unitOther: z.string().trim(),
    roleTitle: z.string().trim(),
    rank: z.string().trim(),
    startYear: z.string().trim(),
    endYear: z.string().trim(),
    activeSecurityClearance: z.boolean(),
    includeReserveDuty: z.boolean(),
    reserveDutyNote: z.string().trim(),
    summary: z.string().trim(),
    bullets: z.array(z.string().trim()),
  })
  .superRefine((value, context) => {
    if (!value.enabled) {
      return
    }

    if (!value.roleTitle) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['roleTitle'],
        message: 'יש להזין תרגום אנגלי קצר לתפקיד או לשירות.',
      })
    }

    if (!value.startYear) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startYear'],
        message: 'יש להזין שנת התחלה.',
      })
    }

    if (!value.endYear) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endYear'],
        message: 'יש להזין שנת סיום.',
      })
    }

    if (value.startYear && value.endYear && value.startYear > value.endYear) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endYear'],
        message: 'שנת הסיום חייבת להיות אחרי שנת ההתחלה.',
      })
    }

    if (!value.summary && value.bullets.every((bullet) => !bullet.trim())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['summary'],
        message: 'יש להזין לפחות שורה אחת שמתרגמת את השירות לערך עסקי.',
      })
    }
  })

export type MilitaryServiceFormValues = z.infer<typeof militaryServiceSchema>

export const defaultMilitaryServiceFormValues = (): MilitaryServiceFormValues =>
  createEmptyMilitaryService()

export const educationSchema = z
  .object({
    degree: nonEmptyText('יש לבחור תואר.'),
    degreeOther: z.string().trim(),
    institution: nonEmptyText('יש לבחור מוסד לימודים.'),
    institutionOther: z.string().trim(),
    graduationYear: nonEmptyText('יש לבחור שנת סיום צפויה.'),
    includeGpa: z.boolean(),
    gpa: z.string().trim(),
    includeCoursework: z.boolean(),
    coursework: z.array(z.string()),
    courseworkOther: z.string().trim(),
    focus: z.string().trim(),
  })
  .superRefine((value, context) => {
    if (value.degree === 'other' && !value.degreeOther) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['degreeOther'],
        message: 'יש להזין את שם התואר המלא.',
      })
    }

    if (value.institution === 'other' && !value.institutionOther) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['institutionOther'],
        message: 'יש להזין את שם מוסד הלימודים.',
      })
    }

    if (value.includeGpa) {
      const grade = Number(value.gpa)
      if (!value.gpa || Number.isNaN(grade) || grade < 0 || grade > 100) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['gpa'],
          message: 'יש להזין ממוצע בין 0 ל-100.',
        })
      }
    }
  })

export type EducationFormValues = z.infer<typeof educationSchema>

export const skillsSchema = z
  .object({
    summary: z.string().trim(),
    programmingLanguages: z.array(z.string()),
    programmingLanguagesOther: z.string().trim(),
    machineLearningAI: z.array(z.string()),
    machineLearningAIOther: z.string().trim(),
    dataEngineeringMLOps: z.array(z.string()),
    dataEngineeringMLOpsOther: z.string().trim(),
    mathematicsAnalytics: z.array(z.string()),
    mathematicsAnalyticsOther: z.string().trim(),
  })
  .refine(
    (value) =>
      value.programmingLanguages.length +
        value.machineLearningAI.length +
        value.dataEngineeringMLOps.length +
        value.mathematicsAnalytics.length >
        0 ||
      [
        value.programmingLanguagesOther,
        value.machineLearningAIOther,
        value.dataEngineeringMLOpsOther,
        value.mathematicsAnalyticsOther,
      ].some(Boolean),
    {
      message: 'יש לבחור לפחות מילת מפתח טכנית אחת.',
      path: ['programmingLanguages'],
    },
  )

export type SkillsFormValues = z.infer<typeof skillsSchema>

const sentenceBuilderSchema = z.object({
  mode: z.enum(['guided', 'manual']),
  manualText: z.string().trim(),
  baseline: z.string().trim(),
  scope: z.string().trim(),
  actionVerb: z.string().trim(),
  technologies: z.array(z.string()),
  outcomeKey: z.string().trim(),
  outcomeValue: z.string().trim(),
})

export const projectSchema = z
  .object({
    id: z.string(),
    templateKey: z.string().trim(),
    name: nonEmptyText('יש להזין שם פרויקט.'),
    link: optionalUrlField,
    summary: nonEmptyText('יש להוסיף תקציר קצר לפרויקט.'),
    role: z.string().trim(),
    goal: z.string().trim(),
    technologies: z.array(z.string()),
    technologiesOther: z.string().trim(),
    bullets: z.array(z.string().trim()),
    bulletBuilders: z.array(sentenceBuilderSchema),
  })
  .superRefine((value, context) => {
    if (!value.summary && value.bullets.filter(Boolean).length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['summary'],
        message: 'יש להוסיף תיאור קצר לפרויקט.',
      })
    }
  })

export const projectsSchema = z.object({
  projects: z.array(projectSchema),
})

export type ProjectsFormValues = z.infer<typeof projectsSchema>

export const defaultProjectsFormValues = (): ProjectsFormValues => ({
  projects: [],
})

const experienceEntrySchema = z.object({
  id: z.string(),
  role: nonEmptyText('יש להזין את שם התפקיד.'),
  company: nonEmptyText('יש להזין את שם החברה או הארגון.'),
  summary: nonEmptyText('יש להוסיף תקציר קצר.'),
  goal: z.string().trim(),
  techStack: z.array(z.string()),
  techStackOther: z.string().trim(),
  startDate: nonEmptyText('יש להזין תאריך התחלה.'),
  endDate: z.string().trim(),
  isCurrent: z.boolean(),
  bullets: z.array(z.string().trim()),
  bulletBuilders: z.array(sentenceBuilderSchema),
})

export const experienceSchema = z
  .object({
    experiences: z.array(experienceEntrySchema),
  })
  .superRefine((value, context) => {
    value.experiences.forEach((experience, index) => {
      if (!experience.isCurrent && !experience.endDate) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['experiences', index, 'endDate'],
          message: 'יש להזין תאריך סיום.',
        })
      }

      if (
        experience.startDate &&
        experience.endDate &&
        !experience.isCurrent &&
        experience.startDate > experience.endDate
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['experiences', index, 'endDate'],
          message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה.',
        })
      }

      if (!experience.summary && experience.bullets.filter(Boolean).length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['experiences', index, 'summary'],
          message: 'יש להוסיף תיאור קצר לניסיון.',
        })
      }
    })
  })

export type ExperienceFormValues = z.infer<typeof experienceSchema>

export const defaultExperienceFormValues = (): ExperienceFormValues => ({
  experiences: [],
})

export const defaultProjectEntry = () => createEmptyProject()
export const defaultExperienceEntry = () => createEmptyExperience()

export const resumeDataSchema = z.object({
  resumeLanguage: resumeLanguageSchema,
  personalDetails: personalDetailsSchema,
  targetRole: targetRoleSchema,
  militaryService: militaryServiceSchema,
  education: educationSchema,
  skills: skillsSchema,
  projects: z.array(projectSchema),
  experienceEnabled: z.boolean(),
  experiences: z.array(experienceEntrySchema),
})
