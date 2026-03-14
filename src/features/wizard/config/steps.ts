import {
  BookOpenText,
  BriefcaseBusiness,
  CircleCheckBig,
  Code2,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'

export const wizardSteps = [
  { title: 'פתיחה', icon: Sparkles },
  { title: 'פרטים', icon: UserRound },
  { title: 'יעד', icon: Target },
  { title: 'כישורים', icon: Code2 },
  { title: 'פרויקטים', icon: FolderKanban },
  { title: 'ניסיון', icon: BriefcaseBusiness },
  { title: 'שירות', icon: ShieldCheck },
  { title: 'השכלה', icon: BookOpenText },
  { title: 'סקירה', icon: CircleCheckBig },
]

export const WIZARD_STEP_COUNT = wizardSteps.length
