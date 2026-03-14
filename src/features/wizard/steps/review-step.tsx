import { FileDown, Languages, PencilLine, RotateCcw, WandSparkles } from 'lucide-react'
import type { ResumeLanguage } from '../../../types/resume'
import { Button } from '../../../components/ui/button'
import { StepFrame } from '../components/step-frame'
import { WizardSection } from '../components/wizard-section'

interface ReviewStepProps {
  editMode: boolean
  isOptimizingResume: boolean
  isTranslatingResume: boolean
  onImproveResume: () => void
  onPrevious: () => void
  onPrint: () => void
  onReset: () => void
  onToggleEditMode: () => void
  onTranslateResume: () => void
  projectCount: number
  resumeLanguage: ResumeLanguage
  skillCount: number
}

export const ReviewStep = ({
  editMode,
  isOptimizingResume,
  isTranslatingResume,
  onImproveResume,
  onPrevious,
  onPrint,
  onReset,
  onToggleEditMode,
  onTranslateResume,
  projectCount,
  resumeLanguage,
  skillCount,
}: ReviewStepProps) => (
  <StepFrame
    description="זה השלב האחרון לפני הורדה. כאן עושים polish לכל המסמך, מפעילים AI גלובלי, ובודקים שהקובץ נשאר חד, קצר, ומוכן ל-PDF."
    eyebrow="שלב 9"
    footer={
      <>
        <Button onClick={onPrevious} type="button" variant="secondary">
          חזרה
        </Button>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Button onClick={onToggleEditMode} type="button" variant="secondary">
            <PencilLine className="size-4" />
            {editMode ? 'סגור עריכה ישירה' : 'ערוך ישירות על ה-Preview'}
          </Button>
          <Button disabled={isOptimizingResume || isTranslatingResume} onClick={onPrint} type="button">
            <FileDown className="size-4" />
            הורד PDF
          </Button>
        </div>
      </>
    }
    stepIndex={9}
    title="סקירה והורדה"
  >
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <WizardSection title="פרויקטים">
        <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
          {projectCount}
        </div>
      </WizardSection>

      <WizardSection title="כישורים">
        <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
          {skillCount}
        </div>
      </WizardSection>

      <WizardSection title="צ'ק אחרון" tone="info">
        <p className="text-sm leading-6 text-slate-600">
          ודאו שאין fluff, שהשורות נקראות מהר, ושבגרסה בעברית הפריסה נשארת RTL ומודפסת נכון.
        </p>
      </WizardSection>
    </div>

    <WizardSection
      description="הכפתורים כאן רצים על כל ה-JSON של קורות החיים ומעדכנים את ה-preview במקום."
      title="AI גלובלי"
      tone="success"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <Button
          className="h-auto min-h-14 justify-start px-5 py-4 text-start"
          disabled={isOptimizingResume || isTranslatingResume}
          onClick={onImproveResume}
          type="button"
        >
          <WandSparkles className="size-4" />
          {isOptimizingResume ? 'AI משפר את כל קורות החיים...' : '✨ שפר קורות חיים בעזרת AI'}
        </Button>

        <Button
          className="h-auto min-h-14 justify-start px-5 py-4 text-start"
          disabled={isOptimizingResume || isTranslatingResume}
          onClick={onTranslateResume}
          type="button"
          variant="secondary"
        >
          <Languages className="size-4" />
          {isTranslatingResume
            ? 'AI מתרגם את כל קורות החיים...'
            : resumeLanguage === 'he'
              ? 'תרגם מחדש לעברית'
              : 'תרגם קורות חיים לעברית'}
        </Button>
      </div>
    </WizardSection>

    <Button onClick={onReset} type="button" variant="ghost">
      <RotateCcw className="size-4" />
      אפס הכל
    </Button>
  </StepFrame>
)
