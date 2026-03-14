import type { LocalizedOption, ResumeLanguage, SkillCategoryKey } from '../../types/resume'

const currentYear = new Date().getFullYear()
const earliestYear = 2000

export const degreeOptions: LocalizedOption[] = [
  {
    value: 'bsc_computer_science',
    labelHe: 'B.Sc. במדעי המחשב',
    labelEn: 'B.Sc. in Computer Science',
    keywords: ['computer science', 'cs', 'מדעי המחשב'],
  },
  {
    value: 'bsc_data_science',
    labelHe: 'B.Sc. במדעי הנתונים',
    labelEn: 'B.Sc. in Data Science',
    keywords: ['data science', 'ds', 'מדעי הנתונים'],
  },
  {
    value: 'bsc_statistics',
    labelHe: 'B.Sc. בסטטיסטיקה',
    labelEn: 'B.Sc. in Statistics',
    keywords: ['statistics', 'סטטיסטיקה'],
  },
  {
    value: 'bsc_mathematics_statistics',
    labelHe: 'B.Sc. במתמטיקה וסטטיסטיקה',
    labelEn: 'B.Sc. in Mathematics and Statistics',
    keywords: ['mathematics', 'statistics', 'מתמטיקה'],
  },
  {
    value: 'bsc_information_systems',
    labelHe: 'B.Sc. במערכות מידע',
    labelEn: 'B.Sc. in Information Systems',
    keywords: ['information systems', 'מערכות מידע'],
  },
  {
    value: 'bsc_software_engineering',
    labelHe: 'B.Sc. בהנדסת תוכנה',
    labelEn: 'B.Sc. in Software Engineering',
    keywords: ['software engineering', 'הנדסת תוכנה'],
  },
  {
    value: 'bsc_electrical_engineering',
    labelHe: 'B.Sc. בהנדסת חשמל',
    labelEn: 'B.Sc. in Electrical Engineering',
    keywords: ['electrical engineering', 'הנדסת חשמל'],
  },
  {
    value: 'bsc_industrial_engineering',
    labelHe: 'B.Sc. בהנדסת תעשייה וניהול',
    labelEn: 'B.Sc. in Industrial Engineering and Management',
    keywords: ['industrial engineering', 'תעשייה וניהול'],
  },
  {
    value: 'msc_data_science',
    labelHe: 'M.Sc. במדעי הנתונים',
    labelEn: 'M.Sc. in Data Science',
  },
  {
    value: 'msc_computer_science',
    labelHe: 'M.Sc. במדעי המחשב',
    labelEn: 'M.Sc. in Computer Science',
  },
  {
    value: 'msc_statistics',
    labelHe: 'M.Sc. בסטטיסטיקה',
    labelEn: 'M.Sc. in Statistics',
  },
  {
    value: 'other',
    labelHe: 'אחר / מותאם אישית',
    labelEn: 'Other / Custom',
  },
]

export const institutionOptions: LocalizedOption[] = [
  {
    value: 'technion',
    labelHe: 'הטכניון - מכון טכנולוגי לישראל',
    labelEn: 'Technion - Israel Institute of Technology',
    keywords: ['technion', 'טכניון'],
  },
  {
    value: 'tel_aviv_university',
    labelHe: 'אוניברסיטת תל אביב',
    labelEn: 'Tel Aviv University',
    keywords: ['tau', 'tel aviv university', 'אוניברסיטת תל אביב', 'תל אביב'],
  },
  {
    value: 'hebrew_university',
    labelHe: 'האוניברסיטה העברית בירושלים',
    labelEn: 'The Hebrew University of Jerusalem',
    keywords: ['huji', 'hebrew university', 'האוניברסיטה העברית'],
  },
  {
    value: 'ben_gurion',
    labelHe: 'אוניברסיטת בן-גוריון בנגב',
    labelEn: 'Ben-Gurion University of the Negev',
    keywords: ['bgu', 'בן גוריון', 'ben gurion'],
  },
  {
    value: 'bar_ilan',
    labelHe: 'אוניברסיטת בר-אילן',
    labelEn: 'Bar-Ilan University',
    keywords: ['bar ilan', 'בר אילן'],
  },
  {
    value: 'haifa',
    labelHe: 'אוניברסיטת חיפה',
    labelEn: 'University of Haifa',
    keywords: ['haifa', 'אוניברסיטת חיפה'],
  },
  {
    value: 'weizmann',
    labelHe: 'מכון ויצמן למדע',
    labelEn: 'Weizmann Institute of Science',
    keywords: ['weizmann', 'ויצמן'],
  },
  {
    value: 'reichman',
    labelHe: 'אוניברסיטת רייכמן',
    labelEn: 'Reichman University',
    keywords: ['reichman', 'idc', 'idc herzliya', 'רייכמן'],
  },
  {
    value: 'ariel',
    labelHe: 'אוניברסיטת אריאל',
    labelEn: 'Ariel University',
    keywords: ['ariel', 'אוניברסיטת אריאל'],
  },
  {
    value: 'hit',
    labelHe: 'HIT מכון טכנולוגי חולון',
    labelEn: 'Holon Institute of Technology',
    keywords: ['hit', 'holon institute of technology', 'חולון'],
  },
  {
    value: 'jct',
    labelHe: 'המרכז האקדמי לב',
    labelEn: 'Jerusalem College of Technology',
    keywords: ['jct', 'lev', 'jerusalem college of technology', 'לב'],
  },
  {
    value: 'afeka',
    labelHe: 'המכללה האקדמית להנדסה אפקה',
    labelEn: 'Afeka Academic College of Engineering',
    keywords: ['afeka', 'אפקה'],
  },
  {
    value: 'tel_aviv_yafo',
    labelHe: 'המכללה האקדמית תל אביב-יפו',
    labelEn: 'The Academic College of Tel Aviv-Yaffo',
    keywords: ['yaffo', 'yafo', 'תל אביב יפו'],
  },
  {
    value: 'braude',
    labelHe: 'המכללה האקדמית להנדסה אורט בראודה',
    labelEn: 'ORT Braude College of Engineering',
    keywords: ['braude', 'בראודה'],
  },
  {
    value: 'sce',
    labelHe: 'מכללת סמי שמעון',
    labelEn: 'Sami Shamoon College of Engineering',
    keywords: ['sce', 'sami shamoon', 'סמי שמעון'],
  },
  {
    value: 'stanford',
    labelHe: 'אוניברסיטת סטנפורד',
    labelEn: 'Stanford University',
  },
  {
    value: 'mit',
    labelHe: "המכון הטכנולוגי של מסצ'וסטס (MIT)",
    labelEn: 'Massachusetts Institute of Technology',
  },
  {
    value: 'berkeley',
    labelHe: 'אוניברסיטת קליפורניה, ברקלי',
    labelEn: 'University of California, Berkeley',
  },
  {
    value: 'cmu',
    labelHe: 'אוניברסיטת קרנגי מלון',
    labelEn: 'Carnegie Mellon University',
  },
  {
    value: 'other',
    labelHe: 'אחר / מותאם אישית',
    labelEn: 'Other / Custom',
  },
]

export const graduationYearOptions = Array.from({ length: currentYear + 5 - earliestYear }, (_, index) =>
  String(currentYear + 4 - index),
)

export const courseworkOptions: LocalizedOption[] = [
  {
    value: 'advanced_nlp',
    labelHe: 'עיבוד שפה טבעית מתקדם',
    labelEn: 'Advanced Natural Language Processing',
  },
  {
    value: 'bayesian_statistics',
    labelHe: 'סטטיסטיקה בייסיאנית',
    labelEn: 'Bayesian Statistics',
  },
  {
    value: 'causal_inference',
    labelHe: 'הסקה סיבתית',
    labelEn: 'Causal Inference',
  },
  {
    value: 'distributed_systems',
    labelHe: 'מערכות מבוזרות',
    labelEn: 'Distributed Systems',
  },
  {
    value: 'machine_learning',
    labelHe: 'למידת מכונה',
    labelEn: 'Machine Learning',
  },
  {
    value: 'deep_learning',
    labelHe: 'למידה עמוקה',
    labelEn: 'Deep Learning',
  },
  {
    value: 'statistical_modeling',
    labelHe: 'מידול סטטיסטי',
    labelEn: 'Statistical Modeling',
  },
  {
    value: 'time_series',
    labelHe: 'ניתוח סדרות זמן',
    labelEn: 'Time Series Analysis',
  },
]

export const skillCategoryLabels: Record<
  ResumeLanguage,
  Record<SkillCategoryKey, string>
> = {
  he: {
    programmingLanguages: 'שפות תכנות',
    machineLearningAI: 'למידת מכונה ובינה מלאכותית',
    dataEngineeringMLOps: 'הנדסת נתונים ו-MLOps',
    mathematicsAnalytics: 'מתמטיקה ואנליטיקה',
  },
  en: {
    programmingLanguages: 'Programming Languages',
    machineLearningAI: 'Machine Learning & AI',
    dataEngineeringMLOps: 'Data Engineering & MLOps',
    mathematicsAnalytics: 'Mathematics & Analytics',
  },
}

export const skillOptions: Record<SkillCategoryKey, string[]> = {
  programmingLanguages: [
    'Python',
    'SQL',
    'R',
    'Scala',
    'Bash Scripting',
    'Java',
    'Go',
    'C++',
  ],
  machineLearningAI: [
    'Scikit-learn',
    'Pandas',
    'NumPy',
    'PyTorch',
    'TensorFlow',
    'XGBoost',
    'Keras',
    'LLMs',
    'Retrieval-Augmented Generation (RAG)',
    'Agentic AI',
    'Hugging Face Transformers',
    'LangChain',
    'LlamaIndex',
    'OpenCV',
  ],
  dataEngineeringMLOps: [
    'Git',
    'Docker',
    'Kubernetes',
    'MLflow',
    'Weights & Biases',
    'Apache Spark',
    'Apache Airflow',
    'dbt',
    'Data Modeling',
    'Kafka',
    'Snowflake',
    'Databricks',
    'BigQuery',
    'Parquet',
    'Delta Lake',
    'Pinecone',
    'Milvus',
    'Amazon Redshift',
    'AWS S3',
    'AWS SageMaker',
    'GCP Vertex AI',
    'Azure ML',
    'Ray Serve',
    'FastAPI',
    'Triton Inference Server',
  ],
  mathematicsAnalytics: [
    'Exploratory Data Analysis (EDA)',
    'A/B Testing',
    'Hypothesis Testing',
    'Causal Inference',
    'Predictive Analytics',
    'Feature Engineering',
    'Matplotlib',
    'Tableau',
    'Power BI',
    'Linear Algebra',
    'Probability Distributions',
    'Statistical Modeling',
    'Bayesian Statistics',
    'Conformal Prediction',
  ],
}

export const wizardStepTitles = [
  'פתיחה',
  'פרטים',
  'תפקיד יעד',
  'כישורים',
  'פרויקטים',
  'ניסיון',
  'שירות',
  'השכלה',
  'סקירה',
]

export const resumeCopy: Record<
  ResumeLanguage,
  {
    summary: string
    technicalSkills: string
    militaryService: string
    experience: string
    projects: string
    education: string
    expectedGraduation: string
    gpa: string
    academicFocus: string
    relevantCoursework: string
    coreTechnologies: string
    projectRole: string
    link: string
    securityClearance: string
    reserveDuty: string
    present: string
  }
> = {
  he: {
    summary: 'תקציר מקצועי',
    technicalSkills: 'כישורים טכניים',
    militaryService: 'שירות צבאי / לאומי',
    experience: 'ניסיון',
    projects: 'פרויקטים',
    education: 'השכלה',
    expectedGraduation: 'סיום לימודים צפוי',
    gpa: 'ממוצע',
    academicFocus: 'מיקוד אקדמי',
    relevantCoursework: 'קורסים רלוונטיים',
    coreTechnologies: 'טכנולוגיות מרכזיות',
    projectRole: 'תפקיד',
    link: 'קישור',
    securityClearance: 'סיווג ביטחוני פעיל',
    reserveDuty: 'מילואים',
    present: 'נוכחי',
  },
  en: {
    summary: 'Professional Summary',
    technicalSkills: 'Technical Skills',
    militaryService: 'Military Service',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    expectedGraduation: 'Expected Graduation',
    gpa: 'GPA',
    academicFocus: 'Academic Focus',
    relevantCoursework: 'Relevant Coursework',
    coreTechnologies: 'Core Technologies',
    projectRole: 'Role',
    link: 'Link',
    securityClearance: 'Active Security Clearance',
    reserveDuty: 'Reserve Duty',
    present: 'Present',
  },
}
