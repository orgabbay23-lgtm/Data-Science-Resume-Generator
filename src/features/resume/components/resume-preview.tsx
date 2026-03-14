import { Fragment, forwardRef } from 'react'
import { skillCategoryLabels } from '../../../data/options/resume-options'
import {
  formatDateRange,
  formatServiceDateRange,
  getCourseworkText,
  getEducationDegreeText,
  getInstitutionText,
  getMilitaryBranchText,
  getMilitarySectionTitle,
  getMilitaryUnitText,
  getProfessionalSummaryText,
  getResumeDirection,
  getResumeText,
  getSkillCategoryItems,
  shouldDisplayIsraeliGpa,
} from '../../../lib/resume-helpers'
import { splitCommaSeparated } from '../../../lib/utils'
import { useResumeStore } from '../../../store/resume-store'
import type { ResumeData, SkillCategoryKey } from '../../../types/resume'
import { EditableText } from './editable-text'
import { ResumeSection } from '../sections/resume-section'

interface ResumePreviewProps {
  data: ResumeData
  editable?: boolean
}

const categories: SkillCategoryKey[] = [
  'programmingLanguages',
  'machineLearningAI',
  'dataEngineeringMLOps',
  'mathematicsAnalytics',
]

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, editable = false }, ref) => {
    const updatePersonalField = useResumeStore((state) => state.updatePersonalField)
    const setProfessionalSummaryText = useResumeStore(
      (state) => state.setProfessionalSummaryText,
    )
    const setEducationDegreeText = useResumeStore((state) => state.setEducationDegreeText)
    const setEducationInstitutionText = useResumeStore(
      (state) => state.setEducationInstitutionText,
    )
    const setEducationCourseworkText = useResumeStore(
      (state) => state.setEducationCourseworkText,
    )
    const setEducationFocusText = useResumeStore((state) => state.setEducationFocusText)
    const setSkillCategoryFromText = useResumeStore(
      (state) => state.setSkillCategoryFromText,
    )
    const updateSkillsSummary = useResumeStore((state) => state.updateSkillsSummary)
    const updateMilitaryField = useResumeStore((state) => state.updateMilitaryField)
    const updateMilitaryBullet = useResumeStore((state) => state.updateMilitaryBullet)
    const updateProjectField = useResumeStore((state) => state.updateProjectField)
    const updateProjectBullet = useResumeStore((state) => state.updateProjectBullet)
    const setProjectTechnologiesText = useResumeStore(
      (state) => state.setProjectTechnologiesText,
    )
    const updateExperienceField = useResumeStore((state) => state.updateExperienceField)
    const updateExperienceBullet = useResumeStore((state) => state.updateExperienceBullet)

    const direction = getResumeDirection(data.resumeLanguage) as 'rtl' | 'ltr'
    const labels = getResumeText(data.resumeLanguage)
    const alignClass = direction === 'rtl' ? 'text-right' : 'text-left'

    const degreeText = getEducationDegreeText(data.education, data.resumeLanguage)
    const institutionText = getInstitutionText(data.education, data.resumeLanguage)
    const educationFocusText = data.education.focus.trim()
    const courseworkText = getCourseworkText(data.education, data.resumeLanguage).join(', ')
    const summaryText = getProfessionalSummaryText(data)
    const militaryBranchText = getMilitaryBranchText(
      data.militaryService,
      data.resumeLanguage,
    )
    const militaryUnitText = getMilitaryUnitText(data.militaryService, data.resumeLanguage)
    const militarySectionTitle = getMilitarySectionTitle(
      data.militaryService,
      data.resumeLanguage,
    )
    const visibleProjects = data.projects.filter(
      (project) =>
        editable ||
        project.name ||
        project.link ||
        project.summary ||
        project.role ||
        project.technologies.length > 0 ||
        project.technologiesOther.trim() ||
        project.bullets.some((bullet) => bullet.trim()),
    )
    const visibleExperiences = data.experiences.filter(
      (experience) =>
        editable ||
        experience.role ||
        experience.company ||
        experience.summary ||
        experience.bullets.some((bullet) => bullet.trim()),
    )
    const showMilitarySection =
      editable ||
      (data.militaryService.enabled &&
        Boolean(
          data.militaryService.roleTitle.trim() ||
            data.militaryService.summary.trim() ||
            data.militaryService.bullets.some((bullet) => bullet.trim()) ||
            data.militaryService.branch.trim() ||
            data.militaryService.branchOther.trim() ||
            data.militaryService.unit.trim() ||
            data.militaryService.unitOther.trim(),
        ))

    const contactItems = [
      {
        field: 'location' as const,
        value: data.personalDetails.location,
        placeholder: 'Tel Aviv, Israel',
        dir: 'auto' as const,
      },
      {
        field: 'phone' as const,
        value: data.personalDetails.phone,
        placeholder: '+972 54 123 4567',
        dir: 'ltr' as const,
      },
      {
        field: 'email' as const,
        value: data.personalDetails.email,
        placeholder: 'name@example.com',
        dir: 'ltr' as const,
      },
      {
        field: 'linkedinUrl' as const,
        value: data.personalDetails.linkedinUrl,
        placeholder: 'LinkedIn',
        dir: 'ltr' as const,
      },
      {
        field: 'githubUrl' as const,
        value: data.personalDetails.githubUrl,
        placeholder: 'GitHub',
        dir: 'ltr' as const,
      },
      {
        field: 'portfolioUrl' as const,
        value: data.personalDetails.portfolioUrl,
        placeholder: 'Portfolio / Kaggle',
        dir: 'ltr' as const,
      },
    ]
    const visibleContactItems = contactItems.filter((item) => item.value || editable)

    const renderSummary = () => (
      <ResumeSection title={labels.summary}>
        <EditableText
          as="div"
          className="text-[0.94rem] leading-7 text-slate-700"
          dir={direction}
          editable={editable}
          multiline
          onChange={setProfessionalSummaryText}
          placeholder="Professional Summary"
          value={summaryText}
        />
      </ResumeSection>
    )

    const renderSkills = () => (
      <ResumeSection title={labels.technicalSkills}>
        <div className="space-y-2.5">
          {data.skills.summary || editable ? (
            <EditableText
              as="div"
              className="whitespace-pre-line text-[0.88rem] leading-6 text-slate-700"
              dir="auto"
              editable={editable}
              multiline
              onChange={updateSkillsSummary}
              placeholder="Technical capability summary."
              value={data.skills.summary}
            />
          ) : null}
          {categories.map((category) => {
            const categoryItems = getSkillCategoryItems(data.skills, category)

            if (categoryItems.length === 0 && !editable) {
              return null
            }

            return (
              <div className="text-[0.88rem]" key={category}>
                <span className="font-semibold text-slate-800">
                  {skillCategoryLabels[data.resumeLanguage][category]}:
                </span>{' '}
                <EditableText
                  as="span"
                  dir="auto"
                  editable={editable}
                  onChange={(value) => setSkillCategoryFromText(category, value)}
                  placeholder="Python, SQL, PyTorch"
                  value={categoryItems.join(', ')}
                />
              </div>
            )
          })}
        </div>
      </ResumeSection>
    )

    const renderMilitary = () =>
      showMilitarySection ? (
        <ResumeSection title={militarySectionTitle}>
          <article className="space-y-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="text-[1rem] font-semibold tracking-[-0.01em] text-slate-900">
                <EditableText
                  as="span"
                  dir="auto"
                  editable={editable}
                  onChange={(value) => updateMilitaryField('roleTitle', value)}
                  placeholder="Data Intelligence Analyst, IDF Unit 8200"
                  value={data.militaryService.roleTitle}
                />
              </div>
              <div className="text-[0.82rem] font-medium text-slate-500">
                {formatServiceDateRange(data.militaryService)}
              </div>
            </div>

            {(militaryBranchText || militaryUnitText || editable) ? (
              <div className="text-[0.84rem] text-slate-600">
                {[militaryUnitText, militaryBranchText].filter(Boolean).join(' | ') ||
                  'Military Service'}
              </div>
            ) : null}

            {data.militaryService.summary || editable ? (
              <EditableText
                as="div"
                className="text-[0.9rem] leading-7 text-slate-700"
                dir="auto"
                editable={editable}
                multiline
                onChange={(value) => updateMilitaryField('summary', value)}
                placeholder="Translate the service into business English."
                value={data.militaryService.summary}
              />
            ) : null}

            {data.militaryService.activeSecurityClearance ? (
              <div className="text-[0.82rem] font-medium text-slate-600">
                {labels.securityClearance}
              </div>
            ) : null}

            {data.militaryService.includeReserveDuty && data.militaryService.reserveDutyNote ? (
              <div className="text-[0.82rem] text-slate-600">
                <span className="font-semibold text-slate-700">{labels.reserveDuty}:</span>{' '}
                <EditableText
                  as="span"
                  dir="auto"
                  editable={editable}
                  onChange={(value) => updateMilitaryField('reserveDutyNote', value)}
                  placeholder="Military Reserve Duty"
                  value={data.militaryService.reserveDutyNote}
                />
              </div>
            ) : null}

            <ul className="space-y-1.5 text-[0.9rem] text-slate-700">
              {data.militaryService.bullets.slice(1).map((bullet, index) =>
                bullet || editable ? (
                  <li className="flex gap-2" key={`military-${index + 1}`}>
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                    <EditableText
                      as="span"
                      dir="auto"
                      editable={editable}
                      multiline
                      onChange={(value) => updateMilitaryBullet(index + 1, value)}
                      placeholder="Optional military bullet."
                      value={bullet}
                    />
                  </li>
                ) : null,
              )}
            </ul>
          </article>
        </ResumeSection>
      ) : null

    const renderProjects = () =>
      visibleProjects.length > 0 ? (
        <ResumeSection title={labels.projects}>
          <div className="space-y-5.5">
            {visibleProjects.map((project) => {
              const projectTechnologies = [
                ...project.technologies,
                ...splitCommaSeparated(project.technologiesOther),
              ].join(', ')

              return (
                <article className="space-y-2.5" key={project.id}>
                  <div className="text-[1rem] font-semibold tracking-[-0.01em] text-slate-900">
                    <EditableText
                      as="span"
                      dir="auto"
                      editable={editable}
                      onChange={(value) => updateProjectField(project.id, 'name', value)}
                      placeholder="Project Name"
                      value={project.name}
                    />
                    {project.name && project.role ? <span> | </span> : null}
                    <EditableText
                      as="span"
                      dir="auto"
                      editable={editable}
                      onChange={(value) => updateProjectField(project.id, 'role', value)}
                      placeholder={labels.projectRole}
                      value={project.role}
                    />
                  </div>

                  {project.link || editable ? (
                    <div className="text-[0.82rem] text-slate-500">
                      <span className="font-semibold text-slate-700">{labels.link}:</span>{' '}
                      <EditableText
                        as="span"
                        dir="ltr"
                        editable={editable}
                        onChange={(value) => updateProjectField(project.id, 'link', value)}
                        placeholder="github.com/your-project"
                        value={project.link}
                      />
                    </div>
                  ) : null}

                  {project.summary || editable ? (
                    <EditableText
                      as="div"
                      className="text-[0.9rem] leading-7 text-slate-700"
                      dir="auto"
                      editable={editable}
                      multiline
                      onChange={(value) => updateProjectField(project.id, 'summary', value)}
                      placeholder="Project summary."
                      value={project.summary}
                    />
                  ) : null}

                  {projectTechnologies || editable ? (
                    <div className="text-[0.85rem] text-slate-600">
                      <span className="font-semibold text-slate-700">
                        {labels.coreTechnologies}:
                      </span>{' '}
                      <EditableText
                        as="span"
                        dir="ltr"
                        editable={editable}
                        onChange={(value) => setProjectTechnologiesText(project.id, value)}
                        placeholder="Python, SQL, Spark"
                        value={projectTechnologies}
                      />
                    </div>
                  ) : null}

                  <ul className="space-y-1.5 text-[0.9rem] text-slate-700">
                    {project.bullets.slice(1).map((bullet, index) =>
                      bullet || editable ? (
                        <li className="flex gap-2" key={`${project.id}-${index + 1}`}>
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                          <EditableText
                            as="span"
                            dir="auto"
                            editable={editable}
                            multiline
                            onChange={(value) =>
                              updateProjectBullet(project.id, index + 1, value)
                            }
                            placeholder="Additional project bullet."
                            value={bullet}
                          />
                        </li>
                      ) : null,
                    )}
                  </ul>
                </article>
              )
            })}
          </div>
        </ResumeSection>
      ) : null

    const renderExperience = () =>
      data.experienceEnabled && visibleExperiences.length > 0 ? (
        <ResumeSection title={labels.experience}>
          <div className="space-y-5.5">
            {visibleExperiences.map((experience) => (
              <article className="space-y-2.5" key={experience.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="text-[1rem] font-semibold tracking-[-0.01em] text-slate-900">
                    <EditableText
                      as="span"
                      dir="auto"
                      editable={editable}
                      onChange={(value) => updateExperienceField(experience.id, 'company', value)}
                      placeholder="Company"
                      value={experience.company}
                    />
                    {experience.role && experience.company ? <span> | </span> : null}
                    <EditableText
                      as="span"
                      dir="auto"
                      editable={editable}
                      onChange={(value) => updateExperienceField(experience.id, 'role', value)}
                      placeholder="Role"
                      value={experience.role}
                    />
                  </div>
                  <div className="text-[0.82rem] font-medium text-slate-500">
                    {formatDateRange(experience, data.resumeLanguage)}
                  </div>
                </div>

                {experience.summary || editable ? (
                  <EditableText
                    as="div"
                    className="text-[0.9rem] leading-7 text-slate-700"
                    dir="auto"
                    editable={editable}
                    multiline
                    onChange={(value) => updateExperienceField(experience.id, 'summary', value)}
                    placeholder="Experience summary."
                    value={experience.summary}
                  />
                ) : null}

                <ul className="space-y-1.5 text-[0.9rem] text-slate-700">
                  {experience.bullets.slice(1).map((bullet, index) =>
                    bullet || editable ? (
                      <li className="flex gap-2" key={`${experience.id}-${index + 1}`}>
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                        <EditableText
                          as="span"
                          dir="auto"
                          editable={editable}
                          multiline
                          onChange={(value) =>
                            updateExperienceBullet(experience.id, index + 1, value)
                          }
                          placeholder="Additional result."
                          value={bullet}
                        />
                      </li>
                    ) : null,
                  )}
                </ul>
              </article>
            ))}
          </div>
        </ResumeSection>
      ) : null

    const renderEducation = () => (
      <ResumeSection title={labels.education}>
        <div className="space-y-1.5">
          <div className="text-[1rem] font-semibold tracking-[-0.01em] text-slate-900">
            <EditableText
              as="span"
              dir="auto"
              editable={editable}
              onChange={setEducationInstitutionText}
              placeholder="Institution"
              value={institutionText}
            />
            {degreeText && institutionText ? <span> | </span> : null}
            <EditableText
              as="span"
              dir="auto"
              editable={editable}
              onChange={setEducationDegreeText}
              placeholder="Degree"
              value={degreeText}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.84rem] text-slate-600">
            {data.education.graduationYear ? (
              <span>
                <span className="font-semibold text-slate-700">
                  {labels.expectedGraduation}:
                </span>{' '}
                {data.education.graduationYear}
              </span>
            ) : null}
            {shouldDisplayIsraeliGpa(data.education) ? (
              <span>
                <span className="font-semibold text-slate-700">{labels.gpa}:</span>{' '}
                {data.education.gpa}
              </span>
            ) : null}
          </div>

          {educationFocusText || editable ? (
            <div className="text-[0.84rem] text-slate-600">
              <span className="font-semibold text-slate-700">{labels.academicFocus}:</span>{' '}
              <EditableText
                as="span"
                dir="auto"
                editable={editable}
                onChange={setEducationFocusText}
                placeholder="Applied ML and experimentation focus."
                value={educationFocusText}
              />
            </div>
          ) : null}

          {courseworkText || editable ? (
            <div className="text-[0.84rem] text-slate-600">
              <span className="font-semibold text-slate-700">
                {labels.relevantCoursework}:
              </span>{' '}
              <EditableText
                as="span"
                dir="auto"
                editable={editable}
                onChange={setEducationCourseworkText}
                placeholder="Machine Learning, Deep Learning, Statistical Modeling"
                value={courseworkText}
              />
            </div>
          ) : null}
        </div>
      </ResumeSection>
    )

    const sectionOrder =
      data.targetRole.targetEmployer === 'mnc'
        ? ['summary', 'education', 'skills', 'military', 'projects', 'experience']
        : ['summary', 'skills', 'military', 'projects', 'experience', 'education']

    const renderedSections = {
      summary: renderSummary(),
      skills: renderSkills(),
      military: renderMilitary(),
      projects: renderProjects(),
      experience: renderExperience(),
      education: renderEducation(),
    } as const

    return (
      <div
        className={`resume-paper rounded-[24px] sm:rounded-[34px] px-4 py-6 sm:px-7 sm:py-8 md:px-10 md:py-11 ${alignClass}`}
        dir={direction}
        ref={ref}
      >
        <header className="space-y-4 border-b border-slate-200 pb-7">
          <EditableText
            as="div"
            className="text-[2.02rem] font-semibold tracking-[-0.04em] text-slate-950 md:text-[2.12rem]"
            dir="auto"
            editable={editable}
            onChange={(value) => updatePersonalField('fullName', value)}
            placeholder="Full Name"
            value={data.personalDetails.fullName}
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.83rem] leading-6 text-slate-600">
            {visibleContactItems.map((item, index) => (
              <div className="flex items-center gap-3" key={item.field}>
                {index > 0 ? <span className="text-slate-300">|</span> : null}
                <EditableText
                  as="span"
                  className="min-w-0"
                  dir={item.dir}
                  editable={editable}
                  inputClassName="w-44 md:w-auto"
                  onChange={(value) => updatePersonalField(item.field, value)}
                  placeholder={item.placeholder}
                  value={item.value}
                />
              </div>
            ))}
          </div>
        </header>

        <div className="mt-7 space-y-7 text-[0.92rem] leading-6 text-slate-800">
          {sectionOrder.map((key) => (
            <Fragment key={key}>
              {renderedSections[key as keyof typeof renderedSections]}
            </Fragment>
          ))}
        </div>
      </div>
    )
  },
)

ResumePreview.displayName = 'ResumePreview'
