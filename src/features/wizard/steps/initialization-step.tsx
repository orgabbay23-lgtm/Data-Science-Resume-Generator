import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, Link2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { ChoiceChip } from '../../../components/ui/choice-chip'
import { FieldShell } from '../../../components/ui/field-shell'
import { HelpPopover } from '../../../components/ui/help-popover'
import { Input } from '../../../components/ui/input'
import { normalizeUrl } from '../../../lib/utils'
import {
  initializationSchema,
  type InitializationFormValues,
} from '../../../schemas/resume-schemas'
import { useResumeStore } from '../../../store/resume-store'
import { ENFORCED_RESUME_LANGUAGE } from '../../../types/resume'
import { israeliFieldHints } from '../../../data/options/israel-resume-options'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface InitializationStepProps {
  onNext: () => void
  onPrevious: () => void
}

export const InitializationStep = ({
  onNext,
  onPrevious,
}: InitializationStepProps) => {
  const data = useResumeStore((state) => state.data)
  const updateInitialization = useResumeStore((state) => state.updateInitialization)
  const [showMore, setShowMore] = useState(
    Boolean(
      data.personalDetails.linkedinUrl ||
        data.personalDetails.githubUrl ||
        data.personalDetails.portfolioUrl,
    ),
  )

  const form = useForm<InitializationFormValues>({
    resolver: zodResolver(initializationSchema),
    defaultValues: {
      resumeLanguage: data.resumeLanguage || ENFORCED_RESUME_LANGUAGE,
      fullName: data.personalDetails.fullName,
      email: data.personalDetails.email,
      phone: data.personalDetails.phone,
      location: data.personalDetails.location,
      linkedinUrl: data.personalDetails.linkedinUrl,
      githubUrl: data.personalDetails.githubUrl,
      portfolioUrl: data.personalDetails.portfolioUrl,
    },
  })

  const values = useWatch({ control: form.control })

  useEffect(() => {
    updateInitialization({
      resumeLanguage: values.resumeLanguage ?? data.resumeLanguage ?? ENFORCED_RESUME_LANGUAGE,
      fullName: values.fullName ?? '',
      email: values.email ?? '',
      phone: values.phone ?? '',
      location: values.location ?? '',
      linkedinUrl: values.linkedinUrl ?? '',
      githubUrl: values.githubUrl ?? '',
      portfolioUrl: values.portfolioUrl ?? '',
    })
  }, [updateInitialization, values, data.resumeLanguage])

  return (
    <form
      onSubmit={form.handleSubmit((submittedValues) => {
        updateInitialization({
          resumeLanguage: submittedValues.resumeLanguage,
          fullName: submittedValues.fullName,
          email: submittedValues.email,
          phone: submittedValues.phone,
          location: submittedValues.location,
          linkedinUrl: normalizeUrl(submittedValues.linkedinUrl),
          githubUrl: normalizeUrl(submittedValues.githubUrl),
          portfolioUrl: normalizeUrl(submittedValues.portfolioUrl),
        })
        onNext()
      })}
    >
      <input
        type="hidden"
        value={values.resumeLanguage ?? data.resumeLanguage ?? ENFORCED_RESUME_LANGUAGE}
        {...form.register('resumeLanguage')}
      />

      <StepFrame
        description="ממלאים רק את מה שחייב להיות למעלה. ברירת המחדל נשארת אנגלית עסקית, ובמסך הסופי אפשר לשפר או לתרגם את כל הקובץ לעברית."
        eyebrow="שלב 2"
        footer={
          <>
            <Button onClick={onPrevious} type="button" variant="secondary">
              חזרה
            </Button>
            <Button type="submit">המשך</Button>
          </>
        }
        stepIndex={2}
        title="פרטים בסיסיים"
      >
        <WizardSection title="פורמט הפלט">
          <div className="grid gap-3 md:grid-cols-2">
            <ChoiceChip
              checked
              description="מתחילים באנגלית עסקית תקינה שמתאימה לשוק הישראלי. במסך הסופי אפשר גם לתרגם את כל הקובץ לעברית מקצועית."
              icon={<Globe className="size-4" />}
              label="ברירת מחדל: אנגלית"
              onToggle={() => undefined}
            />
            <ChoiceChip
              checked
              description="כדי לעבור סינון ישראלי מהיר ו-ATS, הקובץ נשאר עמוד אחד, חד, וקל להעברה ב-WhatsApp או מייל."
              icon={<Link2 className="size-4" />}
              label="עמוד אחד, ATS-safe"
              onToggle={() => undefined}
            />
          </div>
        </WizardSection>

        <WizardSection title="כרטיס ביקור">
          <div className="grid gap-4 md:grid-cols-2">
            <FieldShell
              error={form.formState.errors.fullName?.message}
              label="שם מלא"
              required
            >
              <Input dir="rtl" placeholder="דנה לוי / Dana Levi" {...form.register('fullName')} />
            </FieldShell>

            <FieldShell error={form.formState.errors.phone?.message} label="טלפון" required>
              <Input dir="ltr" placeholder="+972 54 123 4567" {...form.register('phone')} />
            </FieldShell>

            <FieldShell
              className="md:col-span-2"
              error={form.formState.errors.email?.message}
              label="אימייל"
              required
            >
              <Input dir="ltr" placeholder="name@example.com" {...form.register('email')} />
            </FieldShell>

            <FieldShell
              className="md:col-span-2"
              error={form.formState.errors.location?.message}
              label="מיקום"
              labelSuffix={
                <HelpPopover title={israeliFieldHints.location.title}>
                  {israeliFieldHints.location.body}
                </HelpPopover>
              }
              required
            >
              <Input
                dir={data.resumeLanguage === 'he' ? 'rtl' : 'ltr'}
                placeholder="Tel Aviv, Israel"
                {...form.register('location')}
              />
            </FieldShell>
          </div>
        </WizardSection>

        <WizardSection
          action={
            <button
              className="text-sm font-semibold text-cyan-800 transition hover:text-cyan-950"
              onClick={() => setShowMore((current) => !current)}
              type="button"
            >
              {showMore ? 'הסתר קישורים' : 'הצג עוד'}
            </button>
          }
          description="בישראל זה לא קישוט. LinkedIn, GitHub ו-Kaggle הם הוכחת עבודה."
          title="קישורים מקצועיים"
        >
          {showMore ? (
            <div className="grid gap-4">
              <FieldShell error={form.formState.errors.linkedinUrl?.message} label="LinkedIn">
                <Input
                  dir="ltr"
                  placeholder="linkedin.com/in/your-profile"
                  {...form.register('linkedinUrl')}
                />
              </FieldShell>

              <FieldShell error={form.formState.errors.githubUrl?.message} label="GitHub">
                <Input
                  dir="ltr"
                  placeholder="github.com/your-handle"
                  {...form.register('githubUrl')}
                />
              </FieldShell>

              <FieldShell
                error={form.formState.errors.portfolioUrl?.message}
                label="Portfolio / Hugging Face / Kaggle"
              >
                <Input
                  dir="ltr"
                  placeholder="kaggle.com/your-handle"
                  {...form.register('portfolioUrl')}
                />
              </FieldShell>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              אפשר להמשיך בלי זה, אבל בתכלס עדיף שלפחות LinkedIn ו-GitHub יהיו מוכנים.
            </p>
          )}
        </WizardSection>
      </StepFrame>
    </form>
  )
}
