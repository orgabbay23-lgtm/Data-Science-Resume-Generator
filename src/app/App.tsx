import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReactToPrint } from 'react-to-print'
import { ResumePreview } from '../features/resume/components/resume-preview'
import { wizardSteps } from '../features/wizard/config/steps'
import { EducationStep } from '../features/wizard/steps/education-step'
import { ExperienceStep } from '../features/wizard/steps/experience-step'
import { InitializationStep } from '../features/wizard/steps/initialization-step'
import { MilitaryServiceStep } from '../features/wizard/steps/military-service-step'
import { ProjectsStep } from '../features/wizard/steps/projects-step'
import { ReviewStep } from '../features/wizard/steps/review-step'
import { SkillsStep } from '../features/wizard/steps/skills-step'
import { TargetRoleStep } from '../features/wizard/steps/target-role-step'
import { WelcomeStep } from '../features/wizard/steps/welcome-step'
import { getAllSelectedTechnologies } from '../lib/resume-helpers'
import { transformResumeDataWithAi } from '../lib/gemini-service'
import { createAudioCuePlayer } from '../lib/audio-cues'
import { useToast } from '../components/ui/toast-context'
import { useResumeStore } from '../store/resume-store'
import { useAuthStore } from '../store/auth-store'
import { useCloudSync } from '../hooks/use-cloud-sync'
import { AuthScreen } from '../features/auth/components/auth-screen'
import { ApiKeyModal } from '../components/ui/api-key-modal'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'

const stepMotionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 44 : -44,
    y: 10,
    filter: 'blur(10px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -44 : 44,
    y: -10,
    filter: 'blur(10px)',
  }),
}

const renderStep = (
  currentStep: number,
  handlers: {
    onNext: () => void
    onPrevious: () => void
    onPrint: () => void
    onReset: () => void
    editMode: boolean
    onToggleEditMode: () => void
    onImproveResume: () => void
    onTranslateResume: () => void
    isOptimizingResume: boolean
    isTranslatingResume: boolean
    projectCount: number
    resumeLanguage: 'en' | 'he'
    skillCount: number
  },
) => {
  switch (currentStep) {
    case 0:
      return <WelcomeStep onNext={handlers.onNext} />
    case 1:
      return (
        <InitializationStep onNext={handlers.onNext} onPrevious={handlers.onPrevious} />
      )
    case 2:
      return <TargetRoleStep onNext={handlers.onNext} onPrevious={handlers.onPrevious} />
    case 3:
      return <SkillsStep onNext={handlers.onNext} onPrevious={handlers.onPrevious} />
    case 4:
      return <ProjectsStep onNext={handlers.onNext} onPrevious={handlers.onPrevious} />
    case 5:
      return <ExperienceStep onNext={handlers.onNext} onPrevious={handlers.onPrevious} />
    case 6:
      return <MilitaryServiceStep onNext={handlers.onNext} onPrevious={handlers.onPrevious} />
    case 7:
      return <EducationStep onNext={handlers.onNext} onPrevious={handlers.onPrevious} />
    default:
      return (
        <ReviewStep
          editMode={handlers.editMode}
          isOptimizingResume={handlers.isOptimizingResume}
          isTranslatingResume={handlers.isTranslatingResume}
          onImproveResume={handlers.onImproveResume}
          onPrevious={handlers.onPrevious}
          onPrint={handlers.onPrint}
          onReset={handlers.onReset}
          onToggleEditMode={handlers.onToggleEditMode}
          onTranslateResume={handlers.onTranslateResume}
          projectCount={handlers.projectCount}
          resumeLanguage={handlers.resumeLanguage}
          skillCount={handlers.skillCount}
        />
      )
  }
}

export const App = () => {
  const { user, loading, isAuthLoading, setIsApiKeyModalOpen } = useAuthStore()
  const data = useResumeStore((state) => state.data)
  const currentStep = useResumeStore((state) => state.currentStep)
  const nextStep = useResumeStore((state) => state.nextStep)
  const previousStep = useResumeStore((state) => state.previousStep)
  const replaceResumeData = useResumeStore((state) => state.replaceResumeData)
  const resetResume = useResumeStore((state) => state.resetResume)
  const { pushToast } = useToast()
  
  const { syncStatus } = useCloudSync()

  const [editMode, setEditMode] = useState(false)
  const [isOptimizingResume, setIsOptimizingResume] = useState(false)
  const [isTranslatingResume, setIsTranslatingResume] = useState(false)
  const [motionDirection, setMotionDirection] = useState(1)
  const deferredData = useDeferredValue(data)
  const previewRef = useRef<HTMLDivElement>(null)
  const lastStepRef = useRef(currentStep)
  const audioCuePlayerRef = useRef(createAudioCuePlayer())

  const totalSteps = wizardSteps.length
  const isReviewStep = currentStep === totalSteps - 1
  const skillCount = getAllSelectedTechnologies(data.skills).length
  const projectCount = data.projects.filter(
    (project) =>
      project.name.trim() ||
      project.link.trim() ||
      project.summary.trim() ||
      project.bullets.some((bullet) => bullet.trim()),
  ).length

  useEffect(() => {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'he'
    document.body.dir = 'rtl'
  }, [])

  useEffect(() => {
    const handleFallback = () => {
      pushToast({
        tone: 'info',
        title: 'עומס זמני',
        message: 'עקב עומס זמני, נעשה שימוש במודל הגיבוי (2.5 Flash)',
      })
    }
    window.addEventListener('gemini-fallback-toast', handleFallback)
    return () => window.removeEventListener('gemini-fallback-toast', handleFallback)
  }, [pushToast])

  useEffect(() => {
    if (currentStep === lastStepRef.current) {
      return
    }

    audioCuePlayerRef.current(currentStep > lastStepRef.current ? 'stepComplete' : 'softClick')
    lastStepRef.current = currentStep
  }, [currentStep])

  const onPrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle:
      data.personalDetails.fullName.trim() !== ''
        ? `${data.personalDetails.fullName.trim()}-resume`
        : 'data-science-resume',
    pageStyle:
      '@page { size: A4; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
  })

  const runResumeAiAction = async (mode: 'optimize' | 'translateToHebrew') => {
    const isTranslateMode = mode === 'translateToHebrew'
    const setLoadingState = isTranslateMode ? setIsTranslatingResume : setIsOptimizingResume

    if (isOptimizingResume || isTranslatingResume) {
      return
    }

    try {
      setLoadingState(true)
      pushToast({
        tone: 'info',
        title: isTranslateMode
          ? 'Gemini מתרגם את קורות החיים'
          : 'Gemini משפר את קורות החיים',
        message: isTranslateMode
          ? 'המערכת מעבירה את כל ה-JSON לעברית מקצועית ושומרת על מבנה הקובץ.'
          : 'המערכת עוברת על כל ה-JSON, מתקנת ניסוחים וחדה את המסמך לפי הטכלאס הישראלי.',
        durationMs: 2800,
      })

      const nextData = await transformResumeDataWithAi({ data, mode })

      startTransition(() => {
        if (isTranslateMode) {
          setEditMode(true)
        }
        replaceResumeData(nextData)
      })

      pushToast({
        tone: 'success',
        title: isTranslateMode ? 'התרגום הושלם' : 'השיפור הושלם',
        message: isTranslateMode
          ? 'ה-preview עבר לעברית ול-RTL. אפשר להמשיך לערוך ישירות על המסמך.'
          : 'ה-preview עודכן עם ניסוח חד יותר ומוכן לסקירה סופית.',
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: isTranslateMode ? 'תרגום קורות החיים נכשל' : 'שיפור קורות החיים נכשל',
        message: error instanceof Error ? error.message : 'Gemini לא החזיר תשובה תקינה.',
      })
    } finally {
      setLoadingState(false)
    }
  }

  const handlers = {
    onNext: () =>
      startTransition(() => {
        setMotionDirection(1)
        nextStep()
      }),
    onPrevious: () =>
      startTransition(() => {
        setMotionDirection(-1)
        previousStep()
      }),
    onPrint,
    onImproveResume: () => void runResumeAiAction('optimize'),
    onReset: () => {
      setEditMode(false)
      resetResume()
    },
    editMode,
    onToggleEditMode: () => setEditMode((value) => !value),
    onTranslateResume: () => void runResumeAiAction('translateToHebrew'),
    isOptimizingResume,
    isTranslatingResume,
    projectCount,
    resumeLanguage: data.resumeLanguage,
    skillCount,
  }

  const handleSignOut = () => {
    signOut(auth)
  }

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center zen-shell">
        <div className="animate-pulse text-slate-500 font-medium tracking-tight">
          טוען מערכת...
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <main className="zen-shell min-h-screen relative" dir="rtl">
      {/* Top Header for Auth & Sync Status */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            התנתק
          </button>
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="text-xs sm:text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors flex items-center gap-1.5 bg-cyan-50 px-2 sm:px-3 py-1.5 rounded-full"
          >
            <span>🔑</span>
            עדכן מפתח AI
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          {syncStatus === 'saving' && (
            <span className="text-slate-500 animate-pulse">שומר בענן...</span>
          )}
          {syncStatus === 'saved' && (
            <span className="text-cyan-600">נשמר בענן ✓</span>
          )}
          {syncStatus === 'error' && (
            <span className="text-rose-500">שגיאה בשמירה</span>
          )}
        </div>
      </header>

      <div
        className={`mx-auto flex w-full px-4 sm:px-6 pt-16 ${
          isReviewStep
            ? 'max-w-6xl flex-col py-6'
            : 'min-h-screen max-w-4xl items-center justify-center py-8'
        }`}
      >
        <div className="w-full space-y-5">
          <AnimatePresence custom={motionDirection} mode="wait">
            <motion.section
              animate="center"
              className="glass-panel rounded-[28px] sm:rounded-[38px] px-4 py-6 sm:px-8 sm:py-8"
              custom={motionDirection}
              exit="exit"
              initial="enter"
              key={currentStep}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              variants={stepMotionVariants}
            >
              {renderStep(currentStep, handlers)}
            </motion.section>
          </AnimatePresence>

          {isReviewStep ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ResumePreview
                data={deferredData}
                editable={isReviewStep && editMode}
                ref={previewRef}
              />
            </motion.div>
          ) : null}
        </div>
      </div>
      
      <ApiKeyModal />
    </main>
  )
}
