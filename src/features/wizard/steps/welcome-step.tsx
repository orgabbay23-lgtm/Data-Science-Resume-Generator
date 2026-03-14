import { Button } from '../../../components/ui/button'

interface WelcomeStepProps {
  onNext: () => void
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => (
  <div className="flex min-h-[min(720px,calc(100vh-6rem))] flex-col items-center justify-center text-center">
    <div className="space-y-8">
      <h1 className="text-4xl font-semibold tracking-[-0.07em] text-slate-950 md:text-6xl">
        בונים קורות חיים לדאטה
      </h1>
      <div className="flex justify-center">
        <Button onClick={onNext} size="lg" type="button">
          התחל
        </Button>
      </div>
    </div>
  </div>
)
