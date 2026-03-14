import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { WIZARD_STEP_COUNT } from '../features/wizard/config/steps'
import { splitCommaSeparated } from '../lib/utils'
import {
  ENFORCED_RESUME_LANGUAGE,
  createEmptyResumeData,
  ensureExperienceEntry,
  ensureMilitaryServiceDetails,
  ensureProjectEntry,
  type EducationDetails,
  type ExperienceEntry,
  type MilitaryServiceDetails,
  type PersonalDetails,
  type ProjectEntry,
  type ResumeData,
  type ResumeLanguage,
  type SkillCategoryKey,
  type SkillsDetails,
  type TargetRoleDetails,
} from '../types/resume'

interface ResumeStore {
  data: ResumeData
  currentStep: number
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  updateInitialization: (
    values: {
      resumeLanguage: ResumeLanguage
    } & PersonalDetails,
  ) => void
  updateTargetRole: (targetRole: TargetRoleDetails) => void
  updateMilitaryService: (militaryService: MilitaryServiceDetails) => void
  updateEducation: (education: EducationDetails) => void
  updateSkills: (skills: SkillsDetails) => void
  updateSkillsSummary: (value: string) => void
  updateProjects: (projects: ProjectEntry[]) => void
  updateExperienceSection: (enabled: boolean, experiences: ExperienceEntry[]) => void
  updatePersonalField: <Key extends keyof PersonalDetails>(
    field: Key,
    value: PersonalDetails[Key],
  ) => void
  updateTargetRoleField: <Key extends keyof TargetRoleDetails>(
    field: Key,
    value: TargetRoleDetails[Key],
  ) => void
  updateMilitaryField: <Key extends keyof MilitaryServiceDetails>(
    field: Key,
    value: MilitaryServiceDetails[Key],
  ) => void
  updateMilitaryBullet: (bulletIndex: number, value: string) => void
  setProfessionalSummaryText: (value: string) => void
  setEducationDegreeText: (value: string) => void
  setEducationInstitutionText: (value: string) => void
  setEducationCourseworkText: (value: string) => void
  setEducationFocusText: (value: string) => void
  setSkillCategoryFromText: (category: SkillCategoryKey, value: string) => void
  updateProjectField: <Key extends keyof ProjectEntry>(
    id: string,
    field: Key,
    value: ProjectEntry[Key],
  ) => void
  updateProjectBullet: (id: string, bulletIndex: number, value: string) => void
  setProjectTechnologiesText: (id: string, value: string) => void
  updateExperienceField: <Key extends keyof ExperienceEntry>(
    id: string,
    field: Key,
    value: ExperienceEntry[Key],
  ) => void
  updateExperienceBullet: (id: string, bulletIndex: number, value: string) => void
  replaceResumeData: (data: ResumeData) => void
  resetResume: () => void
}

const initialData = createEmptyResumeData()

const uniqueTrimmedStrings = (...collections: Array<string[] | undefined>) =>
  Array.from(
    new Set(
      collections
        .flatMap((collection) => collection ?? [])
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )

const hasMeaningfulProject = (project: ProjectEntry) =>
  Boolean(
    project.name.trim() ||
      project.link.trim() ||
      project.summary.trim() ||
      project.role.trim() ||
      project.technologies.length > 0 ||
      project.technologiesOther.trim() ||
      project.bullets.some((bullet) => bullet.trim()),
  )

const hasMeaningfulExperience = (experience: ExperienceEntry) =>
  Boolean(
    experience.role.trim() ||
      experience.company.trim() ||
      experience.summary.trim() ||
      experience.startDate.trim() ||
      experience.endDate.trim() ||
      experience.bullets.some((bullet) => bullet.trim()),
  )

const hydrateResumeData = (
  data?:
    | (Partial<ResumeData> & {
        skills?: ResumeData['skills'] | Record<string, unknown>
      })
    | undefined,
): ResumeData => {
  const projects =
    data?.projects && data.projects.length > 0
      ? data.projects
          .map((project) => ensureProjectEntry(project))
          .filter(hasMeaningfulProject)
      : initialData.projects
  const experiences =
    data?.experiences && data.experiences.length > 0
      ? data.experiences
          .map((experience) => ensureExperienceEntry(experience))
          .filter(hasMeaningfulExperience)
      : initialData.experiences
  const militaryService = ensureMilitaryServiceDetails(data?.militaryService)

  return {
    ...createEmptyResumeData(),
    ...data,
    resumeLanguage: data?.resumeLanguage === 'he' ? 'he' : ENFORCED_RESUME_LANGUAGE,
    personalDetails: {
      ...initialData.personalDetails,
      ...data?.personalDetails,
    },
    targetRole: {
      ...initialData.targetRole,
      ...data?.targetRole,
    },
    militaryService,
    education: {
      ...initialData.education,
      ...data?.education,
      graduationYear:
        data?.education?.graduationYear || initialData.education.graduationYear,
    },
    skills: {
      ...initialData.skills,
      ...data?.skills,
      machineLearningAI:
        data?.skills && 'machineLearningAI' in data.skills
          ? ((data.skills.machineLearningAI as string[]) ?? [])
          : (((data?.skills as { machineLearning?: string[] } | undefined)?.machineLearning) ??
            []),
      machineLearningAIOther:
        data?.skills && 'machineLearningAIOther' in data.skills
          ? ((data.skills.machineLearningAIOther as string) ?? '')
          : (((data?.skills as { machineLearningOther?: string } | undefined)
              ?.machineLearningOther) ?? ''),
      dataEngineeringMLOps:
        data?.skills && 'dataEngineeringMLOps' in data.skills
          ? ((data.skills.dataEngineeringMLOps as string[]) ?? [])
          : uniqueTrimmedStrings(
              ((data?.skills as { dataBigData?: string[] } | undefined)?.dataBigData) ??
                [],
              ((data?.skills as { toolsCloud?: string[] } | undefined)?.toolsCloud) ?? [],
            ),
      dataEngineeringMLOpsOther:
        data?.skills && 'dataEngineeringMLOpsOther' in data.skills
          ? ((data.skills.dataEngineeringMLOpsOther as string) ?? '')
          : [
              ((data?.skills as { dataBigDataOther?: string } | undefined)?.dataBigDataOther) ??
                '',
              ((data?.skills as { toolsCloudOther?: string } | undefined)?.toolsCloudOther) ?? '',
            ]
              .filter(Boolean)
              .join(', '),
    },
    projects,
    experienceEnabled: experiences.length > 0,
    experiences,
  }
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: hydrateResumeData(),
      currentStep: 0,
      setCurrentStep: (step) =>
        set({ currentStep: Math.max(0, Math.min(step, WIZARD_STEP_COUNT - 1)) }),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, WIZARD_STEP_COUNT - 1),
        })),
      previousStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
      updateInitialization: (values) =>
        set((state) => ({
          data: {
            ...state.data,
            resumeLanguage: values.resumeLanguage,
            personalDetails: {
              fullName: values.fullName,
              email: values.email,
              phone: values.phone,
              location: values.location,
              linkedinUrl: values.linkedinUrl,
              githubUrl: values.githubUrl,
              portfolioUrl: values.portfolioUrl,
            },
          },
        })),
      updateTargetRole: (targetRole) =>
        set((state) => ({
          data: {
            ...state.data,
            targetRole,
          },
        })),
      updateMilitaryService: (militaryService) =>
        set((state) => ({
          data: {
            ...state.data,
            militaryService: ensureMilitaryServiceDetails(militaryService),
          },
        })),
      updateEducation: (education) =>
        set((state) => ({
          data: {
            ...state.data,
            education: {
              ...education,
              graduationYear:
                education.graduationYear || initialData.education.graduationYear,
            },
          },
        })),
      updateSkills: (skills) => set((state) => ({ data: { ...state.data, skills } })),
      updateSkillsSummary: (value) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: {
              ...state.data.skills,
              summary: value,
            },
          },
        })),
      updateProjects: (projects) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: projects.map((project) => ensureProjectEntry(project)),
          },
        })),
      updateExperienceSection: (experienceEnabled, experiences) =>
        set((state) => ({
          data: {
            ...state.data,
            experienceEnabled,
            experiences: experiences.map((experience) => ensureExperienceEntry(experience)),
          },
        })),
      updatePersonalField: (field, value) =>
        set((state) => ({
          data: {
            ...state.data,
            personalDetails: {
              ...state.data.personalDetails,
              [field]: value,
            },
          },
        })),
      updateTargetRoleField: (field, value) =>
        set((state) => ({
          data: {
            ...state.data,
            targetRole: {
              ...state.data.targetRole,
              [field]: value,
            },
          },
        })),
      updateMilitaryField: (field, value) =>
        set((state) => ({
          data: {
            ...state.data,
            militaryService: ensureMilitaryServiceDetails({
              ...state.data.militaryService,
              [field]: value,
            }),
          },
        })),
      updateMilitaryBullet: (bulletIndex, value) =>
        set((state) => ({
          data: {
            ...state.data,
            militaryService: ensureMilitaryServiceDetails({
              ...state.data.militaryService,
              summary: bulletIndex === 0 ? value : state.data.militaryService.summary,
              bullets: state.data.militaryService.bullets.map((bullet, index) =>
                index === bulletIndex ? value : bullet,
              ),
            }),
          },
        })),
      setProfessionalSummaryText: (value) =>
        set((state) => ({
          data: {
            ...state.data,
            targetRole: {
              ...state.data.targetRole,
              summaryMode: 'manual',
              summaryManualText: value,
            },
          },
        })),
      setEducationDegreeText: (value) =>
        set((state) => ({
          data: {
            ...state.data,
            education: {
              ...state.data.education,
              degree: 'other',
              degreeOther: value,
            },
          },
        })),
      setEducationInstitutionText: (value) =>
        set((state) => ({
          data: {
            ...state.data,
            education: {
              ...state.data.education,
              institution: 'other',
              institutionOther: value,
            },
          },
        })),
      setEducationCourseworkText: (value) =>
        set((state) => ({
          data: {
            ...state.data,
            education: {
              ...state.data.education,
              includeCoursework: Boolean(value.trim()),
              coursework: [],
              courseworkOther: value,
            },
          },
        })),
      setEducationFocusText: (value) =>
        set((state) => ({
          data: {
            ...state.data,
            education: {
              ...state.data.education,
              focus: value,
            },
          },
        })),
      setSkillCategoryFromText: (category, value) =>
        set((state) => {
          const items = splitCommaSeparated(value)
          const mapping = {
            programmingLanguages: {
              values: 'programmingLanguages',
              other: 'programmingLanguagesOther',
            },
            machineLearningAI: {
              values: 'machineLearningAI',
              other: 'machineLearningAIOther',
            },
            dataEngineeringMLOps: {
              values: 'dataEngineeringMLOps',
              other: 'dataEngineeringMLOpsOther',
            },
            mathematicsAnalytics: {
              values: 'mathematicsAnalytics',
              other: 'mathematicsAnalyticsOther',
            },
          } as const

          const target = mapping[category]

          return {
            data: {
              ...state.data,
              skills: {
                ...state.data.skills,
                [target.values]: items,
                [target.other]: '',
              },
            },
          }
        }),
      updateProjectField: (id, field, value) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((project) =>
              project.id === id
                ? ensureProjectEntry({
                    ...project,
                    [field]: value,
                  })
                : project,
            ),
          },
        })),
      updateProjectBullet: (id, bulletIndex, value) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((project) =>
              project.id === id
                ? ensureProjectEntry({
                    ...project,
                    summary: bulletIndex === 0 ? value : project.summary,
                    bullets: project.bullets.map((bullet, index) =>
                      index === bulletIndex ? value : bullet,
                    ),
                    bulletBuilders: project.bulletBuilders.map((builder, index) =>
                      index === bulletIndex && builder.mode === 'manual'
                        ? { ...builder, manualText: value }
                        : builder,
                    ),
                  })
                : project,
            ),
          },
        })),
      setProjectTechnologiesText: (id, value) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((project) =>
              project.id === id
                ? ensureProjectEntry({
                    ...project,
                    technologies: splitCommaSeparated(value),
                    technologiesOther: '',
                  })
                : project,
            ),
          },
        })),
      updateExperienceField: (id, field, value) =>
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences.map((experience) =>
              experience.id === id
                ? ensureExperienceEntry({ ...experience, [field]: value })
                : experience,
            ),
          },
        })),
      updateExperienceBullet: (id, bulletIndex, value) =>
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences.map((experience) =>
              experience.id === id
                ? ensureExperienceEntry({
                    ...experience,
                    summary: bulletIndex === 0 ? value : experience.summary,
                    bullets: experience.bullets.map((bullet, index) =>
                      index === bulletIndex ? value : bullet,
                    ),
                    bulletBuilders: experience.bulletBuilders.map((builder, index) =>
                      index === bulletIndex && builder.mode === 'manual'
                        ? { ...builder, manualText: value }
                        : builder,
                    ),
                  })
                : experience,
            ),
          },
        })),
      replaceResumeData: (data) =>
        set({
          data: hydrateResumeData(data),
        }),
      resetResume: () => set({ data: createEmptyResumeData(), currentStep: 0 }),
    }),
    {
      name: 'data-science-resume-generator',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ResumeStore> | undefined

        return {
          ...currentState,
          ...persisted,
          data: hydrateResumeData(persisted?.data),
        }
      },
    },
  ),
)
