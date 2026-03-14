import type {
  LocalizedOption,
  MilitaryServiceProfile,
  TargetEmployerType,
} from '../../types/resume'

const currentYear = new Date().getFullYear()
const earliestYear = 2000

export const serviceYearOptions = Array.from({ length: currentYear + 2 - earliestYear }, (_, index) =>
  String(currentYear + 1 - index),
)

export const employerModeOptions: Record<
  TargetEmployerType,
  {
    label: string
    description: string
    strategy: string
  }
> = {
  startup: {
    label: 'סטארטאפ ישראלי',
    description: 'מהיר, ישיר, סוף-סוף-למוצר. מדגישים בעלות, קצב, ויכולת לזוז בלי חפירות.',
    strategy:
      'בגרסה הזאת עדיף להבליט פרויקטים פרוסים, החלטות מהירות, full-stack analytics, ו-rosh gadol.',
  },
  mnc: {
    label: 'מרכז פיתוח גלובלי',
    description: 'יותר מסודר, יותר מחקרי, יותר סקייל. מדגישים עומק אלגוריתמי, סדר, וסטנדרטים.',
    strategy:
      'בגרסה הזאת עדיף להבליט עומק מתודולוגי, קורסים חזקים, אמינות, ויכולת לעבוד בתוך תשתית R&D גדולה.',
  },
}

export const militaryBranchOptions: LocalizedOption[] = [
  {
    value: 'intelligence_corps',
    labelHe: 'חיל המודיעין',
    labelEn: 'Intelligence Corps',
    keywords: ['מודיעין', 'intelligence', 'aman'],
  },
  {
    value: 'c4i',
    labelHe: 'אגף התקשוב / C4I',
    labelEn: 'C4I Directorate',
    keywords: ['תקשוב', 'c4i'],
  },
  {
    value: 'air_force',
    labelHe: 'חיל האוויר',
    labelEn: 'Israeli Air Force',
    keywords: ['חיל האוויר', 'air force', 'iaf'],
  },
  {
    value: 'navy',
    labelHe: 'חיל הים',
    labelEn: 'Israeli Navy',
    keywords: ['חיל הים', 'navy'],
  },
  {
    value: 'infantry',
    labelHe: 'חי"ר',
    labelEn: 'Infantry Corps',
    keywords: ['infantry', 'חי"ר', 'golani', 'גולני', 'givati', 'גבעתי', 'paratroopers', 'צנחנים'],
  },
  {
    value: 'armored_corps',
    labelHe: 'חיל השריון',
    labelEn: 'Armored Corps',
    keywords: ['שריון', 'armored'],
  },
  {
    value: 'artillery_corps',
    labelHe: 'חיל התותחנים',
    labelEn: 'Artillery Corps',
    keywords: ['תותחנים', 'artillery'],
  },
  {
    value: 'home_front_command',
    labelHe: 'פיקוד העורף',
    labelEn: 'Home Front Command',
    keywords: ['פיקוד העורף', 'home front'],
  },
  {
    value: 'national_service',
    labelHe: 'שירות לאומי / אזרחי',
    labelEn: 'National Service',
    keywords: ['שירות לאומי', 'national service', 'sherut leumi'],
  },
  {
    value: 'other',
    labelHe: 'אחר / מותאם אישית',
    labelEn: 'Other / Custom',
  },
]

export const militaryUnitOptions: LocalizedOption[] = [
  {
    value: '8200',
    labelHe: '8200',
    labelEn: 'Unit 8200',
    keywords: ['8200', 'unit 8200'],
  },
  {
    value: '9900',
    labelHe: '9900',
    labelEn: 'Unit 9900',
    keywords: ['9900', 'unit 9900'],
  },
  {
    value: 'mamram',
    labelHe: 'ממר"ם',
    labelEn: 'Mamram',
    keywords: ['mamram', 'ממרם', 'ממר"ם'],
  },
  {
    value: 'lotem',
    labelHe: 'לוטם',
    labelEn: 'Lotem',
    keywords: ['lotem', 'לותם'],
  },
  {
    value: 'ofek',
    labelHe: 'אופק',
    labelEn: 'Ofek Unit',
    keywords: ['ofek', 'אופק'],
  },
  {
    value: 'other',
    labelHe: 'אחר / לא נוח לחשוף',
    labelEn: 'Other / Prefer Not to Specify',
  },
]

export const militaryProfileCards: Record<
  MilitaryServiceProfile,
  {
    label: string
    description: string
    roleExample: string
    bulletExample: string
  }
> = {
  tech: {
    label: 'שירות טכנולוגי',
    description:
      'אם הייתם ב-8200, 9900, ממר"ם או יחידת דאטה/סייבר, תכתבו סקייל, דאטה, קוד, ואדריכלות. לא משימה מבצעית.',
    roleExample: 'Data Intelligence Analyst, IDF Unit 8200',
    bulletExample:
      'Analyzed large-scale unstructured datasets using SQL and Python, surfacing actionable patterns for senior decision-makers.',
  },
  combat: {
    label: 'קרבי / פיקודי',
    description:
      'לא כותבים ז׳רגון צבאי. מתרגמים ללידרשיפ, לוגיסטיקה, קבלת החלטות תחת לחץ, וניהול צוותים.',
    roleExample: 'Operations Lead & Cross-Functional Commander, IDF',
    bulletExample:
      'Directed logistics, risk mitigation, and execution for a 20-person unit in high-pressure, mission-critical environments.',
  },
  operations: {
    label: 'מבצעי / לוגיסטי',
    description:
      'מדגישים משמעת תפעולית, SLA לא כתוב, ניהול משאבים, ותיאום בין כמה גורמים בלי לאבד קצב.',
    roleExample: 'Operations Coordinator, IDF',
    bulletExample:
      'Coordinated resource allocation and cross-team execution, maintaining full operational readiness under severe time constraints.',
  },
  national: {
    label: 'שירות לאומי',
    description:
      'אם השירות היה בעמותה, בית חולים, רשות ציבורית או מערכת חינוך, תרגמו את זה לאופרציה, דאטה, ושירות בקנה מידה.',
    roleExample: 'Program Operations Coordinator, National Service',
    bulletExample:
      'Supported data-driven service delivery across multiple stakeholders, improving process consistency and response times.',
  },
}

export const israeliFieldHints = {
  location: {
    title: 'מיקום ישראלי נכון',
    body:
      'טכלאס: עיר בלבד באנגלית. למשל Tel Aviv, Israel או Haifa, Israel. בלי רחוב, בלי שכונה, ובלי תמונה.',
  },
  targetEmployer: {
    title: 'למי אתם מכוונים',
    body:
      'סטארטאפ רוצה לראות בעלות, קצב, ויכולת לפרוס מהר. MNC רוצה לראות עומק, מתודולוגיה, ויכולת לעבוד בתוך סטנדרט גלובלי.',
  },
  summary: {
    title: 'תקציר ישראלי',
    body:
      'לא כותבים Objective. כן כותבים 2-3 שורות באנגלית עם stack, סוג הבעיה, והוכחה מספרית. פחות “passionate”, יותר תוצאה.',
  },
  projectTitle: {
    title: 'שם פרויקט בלי קורס 236360',
    body:
      'השם צריך להישמע כמו מוצר או יוזמת R&D. למשל “Clinical Anomaly Detection Pipeline” ולא “Technion Final Project”.',
  },
  projectSummary: {
    title: 'תרגום קפסטון',
    body:
      'דוגמת Technion/BGU: “Engineered a diagnostic ML pipeline on 100,000+ records using Python and scikit-learn, reaching 92% accuracy.”',
  },
  educationInstitution: {
    title: 'מוסדות ישראליים באנגלית',
    body:
      'המערכת מנרמלת טכניון, TAU, HUJI, BGU ורייכמן לשם הרשמי באנגלית. זה מה שה-ATS וה-recruiter צריכים לראות.',
  },
  educationGpa: {
    title: 'כלל ה-85+',
    body:
      'במדעים מדויקים 85+ הוא הסטנדרט שמתגאה בו. מתחת לזה בדרך כלל לא מציגים ממוצע, ונותנים לפרויקטים ול-GitHub לעבוד.',
  },
  coursework: {
    title: 'קורסים ששווים מקום',
    body:
      '3-4 קורסים בלבד, כאלה שמסבירים עומק: Machine Learning, Statistical Modeling, Deep Learning, Distributed Systems. בלי רשימת מכולת.',
  },
  militaryStep: {
    title: 'איך מתרגמים שירות',
    body:
      'טכנולוגי: סקייל, SQL, Python, pipelines, architecture. קרבי/פיקודי: leadership, logistics, crisis execution. לא כותבים מידע מסווג.',
  },
  militaryRole: {
    title: 'כותרת תפקיד באנגלית',
    body:
      '8200 -> Data Intelligence Analyst. מ״מ -> Cross-Functional Team Lead. מפקד/ת צוות -> Team Lead / Operations Lead.',
  },
} as const
