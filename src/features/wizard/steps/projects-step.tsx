import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { AiSynthesisButton } from '../../../components/ui/ai-synthesis-button'
import { Button } from '../../../components/ui/button'
import { FieldShell } from '../../../components/ui/field-shell'
import { HelpPopover } from '../../../components/ui/help-popover'
import { InlineAiTextArea } from '../../../components/ui/inline-ai-textarea'
import { Input } from '../../../components/ui/input'
import { SearchableChipMultiSelect } from '../../../components/ui/searchable-chip-multi-select'
import { Select } from '../../../components/ui/select'
import { TextArea } from '../../../components/ui/textarea'
import { israeliFieldHints } from '../../../data/options/israel-resume-options'
import {
  getProjectTemplate,
  getTrackProjectTemplates,
} from '../../../data/options/career-track-options'
import { synthesizeResumeTextFromStructuredData } from '../../../lib/gemini-service'
import { getProjectTechnologyChoices } from '../../../lib/resume-helpers'
import { normalizeUrl, splitCommaSeparated, splitMultilineText } from '../../../lib/utils'
import {
  defaultProjectsFormValues,
  projectsSchema,
  type ProjectsFormValues,
} from '../../../schemas/resume-schemas'
import { useResumeStore } from '../../../store/resume-store'
import {
  createEmptyProject,
  ensureProjectEntry,
} from '../../../types/resume'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface ProjectsStepProps {
  onNext: () => void
  onPrevious: () => void
}

export const ProjectsStep = ({ onNext, onPrevious }: ProjectsStepProps) => {
  const data = useResumeStore((state) => state.data)
  const updateProjects = useResumeStore((state) => state.updateProjects)
  const track = data.targetRole.targetTrack
  const projectTemplates = useMemo(() => getTrackProjectTemplates(track), [track])
  const technologyChoices = getProjectTechnologyChoices(data)

  const form = useForm<ProjectsFormValues>({
    resolver: zodResolver(projectsSchema),
    defaultValues:
      data.projects.length > 0
        ? { projects: data.projects.map((project) => ensureProjectEntry(project)) }
        : defaultProjectsFormValues(),
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'projects',
  })

  const values = useWatch({ control: form.control })

  useEffect(() => {
    updateProjects(
      (values.projects ?? []).map((project) =>
        ensureProjectEntry(project as Parameters<typeof ensureProjectEntry>[0]),
      ),
    )
  }, [updateProjects, values.projects])

  const syncProjectSummary = (projectIndex: number, nextSummary: string) => {
    form.setValue(`projects.${projectIndex}.summary`, nextSummary, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue(`projects.${projectIndex}.bullets.0`, nextSummary, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const syncProjectSecondaryBullet = (projectIndex: number, nextBullet: string) => {
    form.setValue(`projects.${projectIndex}.bullets.1`, nextBullet, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const applyStructuredProjectSummary = (projectIndex: number, nextSummary: string) => {
    const lines = splitMultilineText(nextSummary)

    if (lines.length === 0) {
      return
    }

    syncProjectSummary(projectIndex, lines[0])

    if (lines[1]) {
      syncProjectSecondaryBullet(projectIndex, lines[1])
    }
  }

  const setProjectTechnologies = (projectIndex: number, nextSelection: string[]) => {
    form.setValue(`projects.${projectIndex}.technologies`, nextSelection, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue(`projects.${projectIndex}.technologiesOther`, '', {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const applyProjectTemplate = (projectIndex: number, templateKey: string) => {
    form.setValue(`projects.${projectIndex}.templateKey`, templateKey, {
      shouldDirty: true,
      shouldValidate: true,
    })

    const template = getProjectTemplate(track, templateKey)

    if (!template) {
      return
    }

    const currentProject = ensureProjectEntry(form.getValues(`projects.${projectIndex}`))

    if (!currentProject.name.trim()) {
      form.setValue(`projects.${projectIndex}.name`, template.label, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    if (!currentProject.role.trim()) {
      form.setValue(`projects.${projectIndex}.role`, template.role, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    if (!currentProject.goal.trim()) {
      form.setValue(`projects.${projectIndex}.goal`, template.description, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    const mergedTechnologies = Array.from(
      new Set([
        ...currentProject.technologies,
        ...splitCommaSeparated(currentProject.technologiesOther),
        ...template.technologySeeds,
      ]),
    )

    setProjectTechnologies(projectIndex, mergedTechnologies)
  }

  const buildProjectSynthesisContext = (project: ReturnType<typeof ensureProjectEntry>) => {
    const template = getProjectTemplate(track, project.templateKey)
    const projectTechnologies = Array.from(
      new Set([...project.technologies, ...splitCommaSeparated(project.technologiesOther)]),
    ).filter(Boolean)

    return [
      template ? `Selected project template: ${template.label}` : '',
      template ? `Template description: ${template.description}` : '',
      template ? `Template role: ${template.role}` : '',
      template ? `Template keywords: ${template.keywords.join(', ')}` : '',
      project.name ? `Project name: ${project.name}` : '',
      project.role ? `Candidate role: ${project.role}` : '',
      project.goal ? `Project goal or bottom line: ${project.goal}` : '',
      projectTechnologies.length > 0
        ? `Tech stack: ${projectTechnologies.join(', ')}`
        : '',
      project.summary ? `Existing summary draft: ${project.summary}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <form
      onSubmit={form.handleSubmit((submittedValues) => {
        updateProjects(
          submittedValues.projects.map((project) =>
            ensureProjectEntry({
              ...project,
              link: normalizeUrl(project.link),
            }),
          ),
        )
        onNext()
      })}
    >
      <StepFrame
        description="הפרויקטים הם ה-proof. בישראל צריך להבין תוך שנייה מה בניתם, עם איזה סטאק, ולמה זה שווה תשומת לב."
        eyebrow="שלב 5"
        footer={
          <>
            <Button onClick={onPrevious} type="button" variant="secondary">
              חזרה
            </Button>
            <Button type="submit">המשך</Button>
          </>
        }
        stepIndex={5}
        title="פרויקטים"
      >
        {fields.length === 0 ? (
          <WizardSection
            description="אפשר לדלג, אבל עדיף לפחות פרויקט אחד שנשמע כמו מוצר, מחקר או R&D אמיתי ולא כמו תיאור קורס כללי."
            title="לא חייבים, אבל עדיף"
            tone="info"
          >
            <Button onClick={() => append(createEmptyProject())} type="button" variant="secondary">
              <Plus className="size-4" />
              הוסף פרויקט
            </Button>
          </WizardSection>
        ) : null}

        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {fields.map((field, index) => {
              const project = ensureProjectEntry(
                values.projects?.[index] as Parameters<typeof ensureProjectEntry>[0],
              )
              const projectError = form.formState.errors.projects?.[index]
              const currentTemplate = getProjectTemplate(track, project.templateKey)
              const projectTechnologies = Array.from(
                new Set([...project.technologies, ...splitCommaSeparated(project.technologiesOther)]),
              )
              const canGenerateProjectSummary = Boolean(
                project.templateKey ||
                  project.name.trim() ||
                  project.role.trim() ||
                  project.goal.trim() ||
                  projectTechnologies.length > 0,
              )

              return (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: 10 }}
                  key={field.id}
                  layout
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <WizardSection
                    action={
                      <Button
                        onClick={() => remove(index)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                        הסר
                      </Button>
                    }
                    title={`פרויקט ${index + 1}`}
                  >
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                        <FieldShell label="תבנית פרויקט (אופציונלי)">
                          <Select
                            dir="ltr"
                            onChange={(event) => applyProjectTemplate(index, event.target.value)}
                            value={project.templateKey}
                          >
                            <option value="">בחרו תבנית פרויקט</option>
                            {projectTemplates.map((template) => (
                              <option key={template.value} value={template.value}>
                                {template.label}
                              </option>
                            ))}
                          </Select>
                        </FieldShell>

                        <AiSynthesisButton
                          className="md:self-end"
                          disabled={!canGenerateProjectSummary}
                          onApply={(nextValue) => applyStructuredProjectSummary(index, nextValue)}
                          onGenerate={() =>
                            synthesizeResumeTextFromStructuredData({
                              employer: data.targetRole.targetEmployer,
                              kind: 'project',
                              label: 'Project synthesis',
                              language: data.resumeLanguage,
                              track,
                              context: buildProjectSynthesisContext(project),
                            })
                          }
                        >
                          ✨ צור ניסוח אוטומטי ב-AI
                        </AiSynthesisButton>
                      </div>

                      {currentTemplate ? (
                        <div className="rounded-[22px] border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
                          <div className="font-semibold text-slate-900">{currentTemplate.label}</div>
                          <div className="mt-1">{currentTemplate.description}</div>
                        </div>
                      ) : null}

                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell
                          error={projectError?.name?.message}
                          label="שם הפרויקט"
                          labelSuffix={
                            <HelpPopover title={israeliFieldHints.projectTitle.title}>
                              {israeliFieldHints.projectTitle.body}
                            </HelpPopover>
                          }
                          required
                        >
                          <Input
                            dir="ltr"
                            onChange={(event) =>
                              form.setValue(`projects.${index}.name`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            placeholder="Clinical Anomaly Detection Pipeline"
                            value={project.name}
                          />
                        </FieldShell>

                        <FieldShell error={projectError?.link?.message} label="GitHub / קישור">
                          <Input
                            dir="ltr"
                            onChange={(event) =>
                              form.setValue(`projects.${index}.link`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            placeholder="github.com/you/project"
                            value={project.link}
                          />
                        </FieldShell>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldShell label="Role / כובע בפרויקט">
                          <Input
                            dir="ltr"
                            onChange={(event) =>
                              form.setValue(`projects.${index}.role`, event.target.value, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            placeholder="ML Engineer / Data Scientist"
                            value={project.role}
                          />
                        </FieldShell>

                        <FieldShell label="Tech Stack">
                          <SearchableChipMultiSelect
                            allowCustom
                            dir="ltr"
                            onChange={(nextSelection) =>
                              setProjectTechnologies(index, nextSelection)
                            }
                            options={technologyChoices}
                            placeholder="Python, SQL, LangChain, Docker"
                            value={projectTechnologies}
                          />
                        </FieldShell>
                      </div>

                      <FieldShell label="Goal / מה ה-bottom line של הפרויקט?">
                        <TextArea
                          dir="ltr"
                          onChange={(event) =>
                            form.setValue(`projects.${index}.goal`, event.target.value, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          placeholder="What problem did the project solve, for whom, and why did it matter?"
                          rows={3}
                          value={project.goal}
                        />
                      </FieldShell>

                      <FieldShell
                        error={projectError?.summary?.message}
                        label="תקציר"
                        labelSuffix={
                          <HelpPopover title={israeliFieldHints.projectSummary.title}>
                            {israeliFieldHints.projectSummary.body}
                          </HelpPopover>
                        }
                        required
                      >
                        <InlineAiTextArea
                          employer={data.targetRole.targetEmployer}
                          kind="bullet"
                          label="תקציר פרויקט"
                          language={data.resumeLanguage}
                          onApply={(nextValue) => syncProjectSummary(index, nextValue)}
                          onChange={(nextValue) => syncProjectSummary(index, nextValue)}
                          placeholder="Write rough notes. Example: Built a Technion capstone on 100,000+ medical records and reached 92% accuracy."
                          track={data.targetRole.targetTrack}
                          value={project.summary}
                        />
                      </FieldShell>

                      <FieldShell label="בולט נוסף (אופציונלי)">
                        <InlineAiTextArea
                          employer={data.targetRole.targetEmployer}
                          kind="bullet"
                          label="בולט פרויקט נוסף"
                          language={data.resumeLanguage}
                          onApply={(nextValue) => syncProjectSecondaryBullet(index, nextValue)}
                          onChange={(nextValue) => syncProjectSecondaryBullet(index, nextValue)}
                          placeholder="Optional second line for scale, ownership, or result."
                          rows={3}
                          textareaClassName="min-h-24"
                          track={data.targetRole.targetTrack}
                          value={project.bullets[1] ?? ''}
                        />
                      </FieldShell>
                    </div>
                  </WizardSection>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => append(createEmptyProject())} type="button" variant="secondary">
            <Plus className="size-4" />
            הוסף פרויקט
          </Button>
          <span className="text-sm text-slate-500">
            אם אין עדיין פרויקט חזק, עדיף אחד טוב ולא שלושה חלשים.
          </span>
        </div>
      </StepFrame>
    </form>
  )
}
