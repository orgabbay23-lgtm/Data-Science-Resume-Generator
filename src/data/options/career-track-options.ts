import type { LocalizedOption, SkillCategoryKey, TargetTrack } from '../../types/resume'
import type { SearchableOption } from './automation-options'

interface SkillQuickPack {
  id: string
  label: string
  skills: string[]
}

export interface ProjectTemplate {
  value: string
  label: string
  role: string
  description: string
  keywords: string[]
  technologySeeds: string[]
  bulletSeeds: Array<{
    actionVerb: string
    baseline: string
    scope: string
    outcomeKey: string
  }>
}

export interface CareerTrackConfig {
  value: TargetTrack
  shortLabel: string
  label: string
  defaultTargetTitle: string
  description: string
  resumeStrategy: string
  methodologyHighlights: string[]
  targetStack: string[]
  keywords: string[]
  evidenceLine: string
  roleTitleSuggestions: SearchableOption[]
  projectTemplates: ProjectTemplate[]
  skillQuickPacks: SkillQuickPack[]
  recommendedSkills: Record<SkillCategoryKey, string[]>
}

export interface XyzOutcomeOption {
  value: string
  label: string
  tracks: TargetTrack[]
  accomplishmentEn: string
  accomplishmentHe: string
  measurementLabelEn: string
  measurementLabelHe: string
  suffix?: string
  quickValues: string[]
}

type XyzActionOption = LocalizedOption & {
  tracks: TargetTrack[]
}

export const xyzActionOptions: XyzActionOption[] = [
  { value: 'engineered', labelHe: 'פיתוח', labelEn: 'Engineered', tracks: ['ds', 'mle', 'de'] },
  { value: 'architected', labelHe: 'ארכיטקטורה', labelEn: 'Architected', tracks: ['mle', 'de'] },
  { value: 'deployed', labelHe: 'הטמעה בייצור', labelEn: 'Deployed', tracks: ['mle', 'de'] },
  { value: 'optimized', labelHe: 'אופטימיזציה', labelEn: 'Optimized', tracks: ['ds', 'mle', 'de'] },
  { value: 'orchestrated', labelHe: 'תזמור', labelEn: 'Orchestrated', tracks: ['mle', 'de'] },
  { value: 'productionized', labelHe: 'העלאה לייצור', labelEn: 'Productionized', tracks: ['mle', 'de'] },
  { value: 'automated', labelHe: 'אוטומציה', labelEn: 'Automated', tracks: ['ds', 'mle', 'de'] },
  { value: 'scaled', labelHe: 'הרחבה', labelEn: 'Scaled', tracks: ['mle', 'de'] },
  { value: 'designed', labelHe: 'תכנון', labelEn: 'Designed', tracks: ['ds', 'mle', 'de'] },
  { value: 'implemented', labelHe: 'מימוש', labelEn: 'Implemented', tracks: ['ds', 'mle', 'de'] },
  { value: 'synthesized', labelHe: 'סינתזה', labelEn: 'Synthesized', tracks: ['ds'] },
  { value: 'tuned', labelHe: 'כיול', labelEn: 'Tuned', tracks: ['ds', 'mle'] },
]

export const xyzOutcomeOptions: XyzOutcomeOption[] = [
  {
    value: 'accuracy',
    label: 'שיפור בדיוק המודל',
    tracks: ['ds', 'mle'],
    accomplishmentEn: 'improve model accuracy',
    accomplishmentHe: 'לשפר את דיוק המודל',
    measurementLabelEn: 'accuracy lift',
    measurementLabelHe: 'שיפור בדיוק',
    suffix: '%',
    quickValues: ['5', '8', '12', '15'],
  },
  {
    value: 'roc_auc',
    label: 'שיפור ב-ROC-AUC',
    tracks: ['ds'],
    accomplishmentEn: 'raise model discrimination quality',
    accomplishmentHe: 'להעלות את איכות ההבחנה של המודל',
    measurementLabelEn: 'ROC-AUC',
    measurementLabelHe: 'ROC-AUC',
    quickValues: ['0.84', '0.88', '0.91'],
  },
  {
    value: 'roi',
    label: 'שיפור ב-ROI',
    tracks: ['ds'],
    accomplishmentEn: 'increase campaign ROI',
    accomplishmentHe: 'להגדיל את החזר ההשקעה בקמפיין',
    measurementLabelEn: 'ROI gain',
    measurementLabelHe: 'שיפור ב-ROI',
    quickValues: ['14%', '23%', '$40K', '$150K'],
  },
  {
    value: 'conversion',
    label: 'שיפור בהמרה',
    tracks: ['ds'],
    accomplishmentEn: 'increase user conversion',
    accomplishmentHe: 'להגדיל את שיעור ההמרה',
    measurementLabelEn: 'conversion lift',
    measurementLabelHe: 'שיפור בהמרה',
    suffix: '%',
    quickValues: ['5', '8', '14', '18'],
  },
  {
    value: 'retention',
    label: 'שיפור בשימור',
    tracks: ['ds'],
    accomplishmentEn: 'improve customer retention',
    accomplishmentHe: 'לשפר שימור לקוחות',
    measurementLabelEn: 'retention lift',
    measurementLabelHe: 'שיפור בשימור',
    suffix: '%',
    quickValues: ['4', '7', '10', '12'],
  },
  {
    value: 'latency',
    label: 'הפחתת זמני תגובה',
    tracks: ['mle'],
    accomplishmentEn: 'reduce inference latency',
    accomplishmentHe: 'להפחית את זמני ההשהיה של האינפרנס',
    measurementLabelEn: 'p95 latency reduction',
    measurementLabelHe: 'הפחתת p95 latency',
    suffix: '%',
    quickValues: ['20', '30', '40', '55'],
  },
  {
    value: 'throughput',
    label: 'הגדלת תפוקה',
    tracks: ['mle', 'de'],
    accomplishmentEn: 'increase system throughput',
    accomplishmentHe: 'להגדיל את תפוקת המערכת',
    measurementLabelEn: 'throughput gain',
    measurementLabelHe: 'גידול בתפוקה',
    quickValues: ['2x', '4x', '10K qps', '25M rows/day'],
  },
  {
    value: 'uptime',
    label: 'שיפור אמינות',
    tracks: ['mle', 'de'],
    accomplishmentEn: 'improve production reliability',
    accomplishmentHe: 'לשפר את אמינות סביבת הייצור',
    measurementLabelEn: 'uptime',
    measurementLabelHe: 'זמינות',
    suffix: '%',
    quickValues: ['99.5', '99.9', '99.95'],
  },
  {
    value: 'query_accuracy',
    label: 'שיפור איכות תשובות',
    tracks: ['mle'],
    accomplishmentEn: 'improve response accuracy',
    accomplishmentHe: 'לשפר את דיוק התשובות',
    measurementLabelEn: 'query accuracy',
    measurementLabelHe: 'דיוק תשובות',
    suffix: '%',
    quickValues: ['20', '35', '60'],
  },
  {
    value: 'runtime',
    label: 'הפחתת זמן ריצה של פייפליין',
    tracks: ['de'],
    accomplishmentEn: 'reduce pipeline runtime',
    accomplishmentHe: 'להפחית את זמן הריצה של הפייפליין',
    measurementLabelEn: 'runtime reduction',
    measurementLabelHe: 'הפחתת זמן ריצה',
    suffix: '%',
    quickValues: ['25', '40', '65', '85'],
  },
  {
    value: 'freshness',
    label: 'שיפור רעננות נתונים',
    tracks: ['de'],
    accomplishmentEn: 'reduce data freshness lag',
    accomplishmentHe: 'להפחית את פער רעננות הנתונים',
    measurementLabelEn: 'freshness lag reduction',
    measurementLabelHe: 'הפחתת פער רעננות',
    suffix: '%',
    quickValues: ['20', '35', '50', '70'],
  },
  {
    value: 'data_quality',
    label: 'שיפור איכות נתונים',
    tracks: ['de'],
    accomplishmentEn: 'improve pipeline data quality',
    accomplishmentHe: 'לשפר את איכות הנתונים בפייפליין',
    measurementLabelEn: 'quality issue reduction',
    measurementLabelHe: 'הפחתת תקלות איכות',
    suffix: '%',
    quickValues: ['30', '50', '75'],
  },
  {
    value: 'cost',
    label: 'הפחתת עלויות',
    tracks: ['mle', 'de'],
    accomplishmentEn: 'reduce infrastructure cost',
    accomplishmentHe: 'להפחית את עלות התשתית',
    measurementLabelEn: 'cost reduction',
    measurementLabelHe: 'הפחתת עלות',
    quickValues: ['12%', '20%', '$30K', '$75K'],
  },
]

export const careerTrackOptions: CareerTrackConfig[] = [
  {
    value: 'ds',
    shortLabel: 'DS',
    label: 'מדען/ית נתונים',
    defaultTargetTitle: 'Junior Data Scientist',
    description:
      'התאמה ליצירת תובנות, ניסויים מדויקים, מידול חזוי והשפעה עסקית ברורה לבעלי עניין.',
    resumeStrategy:
      'יש להדגיש צמיחה עסקית, הפחתת סיכונים, יכולת ניסויית והמרת נתונים מורכבים להחלטות ברורות.',
    methodologyHighlights: [
      'ניתוח נתונים חקרני (EDA)',
      'בדיקות A/B',
      'בדיקת השערות',
      'הסקה סיבתית',
      'אנליטיקה חזויה',
      'פיצ׳ר אנג׳ינירינג',
    ],
    targetStack: [
      'Python',
      'R',
      'SQL',
      'Jupyter',
      'Scikit-learn',
      'XGBoost',
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Tableau',
      'Power BI',
    ],
    keywords: [
      'business impact',
      'revenue generation',
      'risk mitigation',
      'stakeholder communication',
      'predictive modeling',
    ],
    evidenceLine:
      'Backed by hands-on work in experimentation, predictive modeling, and executive-ready analytics.',
    roleTitleSuggestions: [
      { value: 'junior-data-scientist', label: 'Junior Data Scientist', keywords: ['data scientist', 'entry level'] },
      { value: 'applied-data-scientist', label: 'Applied Data Scientist', keywords: ['applied', 'ml'] },
      { value: 'product-data-scientist', label: 'Product Data Scientist', keywords: ['product', 'growth'] },
      { value: 'decision-scientist', label: 'Decision Scientist', keywords: ['analytics', 'experiments'] },
      { value: 'marketing-data-scientist', label: 'Marketing Data Scientist', keywords: ['marketing', 'roi'] },
    ],
    projectTemplates: [
      {
        value: 'churn-risk-scoring',
        label: 'Churn Risk Scoring System',
        role: 'Lead Data Scientist',
        description: 'Predict at-risk accounts and quantify retention impact for growth teams.',
        keywords: ['churn', 'xgboost', 'retention', 'risk'],
        technologySeeds: ['Python', 'SQL', 'Pandas', 'Scikit-learn', 'XGBoost', 'Tableau'],
        bulletSeeds: [
          {
            actionVerb: 'engineered',
            baseline: 'for 24 months of enterprise product usage and CRM history',
            scope: 'a churn propensity modeling workflow',
            outcomeKey: 'roc_auc',
          },
          {
            actionVerb: 'designed',
            baseline: 'for account managers prioritizing save interventions',
            scope: 'an experiment-ready retention segmentation layer',
            outcomeKey: 'retention',
          },
        ],
      },
      {
        value: 'ab-testing-conversion',
        label: 'A/B Testing Conversion Analysis',
        role: 'Product Data Scientist',
        description: 'Turn product experiments into statistically grounded conversion wins.',
        keywords: ['ab test', 'experimentation', 'conversion', 'product'],
        technologySeeds: ['Python', 'SQL', 'A/B Testing', 'Hypothesis Testing', 'Tableau'],
        bulletSeeds: [
          {
            actionVerb: 'designed',
            baseline: 'across landing page and onboarding funnel variants',
            scope: 'a multivariate experimentation workflow',
            outcomeKey: 'conversion',
          },
          {
            actionVerb: 'synthesized',
            baseline: 'for growth and lifecycle stakeholders',
            scope: 'an executive-ready decision dashboard',
            outcomeKey: 'roi',
          },
        ],
      },
      {
        value: 'pricing-causal-inference',
        label: 'Pricing Causal Inference Study',
        role: 'Decision Scientist',
        description: 'Estimate causal pricing effects and tie them to revenue outcomes.',
        keywords: ['pricing', 'causal inference', 'revenue', 'uplift'],
        technologySeeds: ['Python', 'SQL', 'Causal Inference', 'Bayesian Statistics', 'Pandas'],
        bulletSeeds: [
          {
            actionVerb: 'implemented',
            baseline: 'for regional pricing changes across several customer cohorts',
            scope: 'a causal inference analysis pipeline',
            outcomeKey: 'revenue',
          },
          {
            actionVerb: 'optimized',
            baseline: 'for commercial strategy reviews',
            scope: 'a scenario modeling layer for pricing decisions',
            outcomeKey: 'roi',
          },
        ],
      },
    ],
    skillQuickPacks: [
      {
        id: 'ds-core',
        label: 'חבילת בסיס ל-DS',
        skills: ['Python', 'SQL', 'Scikit-learn', 'Pandas', 'A/B Testing'],
      },
      {
        id: 'ds-experimentation',
        label: 'ניסויים',
        skills: ['Hypothesis Testing', 'Causal Inference', 'Tableau', 'Power BI'],
      },
      {
        id: 'ds-modeling',
        label: 'מידול חזוי',
        skills: ['XGBoost', 'NumPy', 'Feature Engineering', 'Bayesian Statistics'],
      },
    ],
    recommendedSkills: {
      programmingLanguages: ['Python', 'SQL', 'R'],
      machineLearningAI: ['Scikit-learn', 'Pandas', 'NumPy', 'XGBoost'],
      dataEngineeringMLOps: ['Git', 'Docker', 'MLflow'],
      mathematicsAnalytics: [
        'Exploratory Data Analysis (EDA)',
        'A/B Testing',
        'Hypothesis Testing',
        'Causal Inference',
        'Feature Engineering',
      ],
    },
  },
  {
    value: 'mle',
    shortLabel: 'MLE',
    label: 'מהנדס/ת למידת מכונה',
    defaultTargetTitle: 'Junior Machine Learning Engineer',
    description:
      'התאמה לפריסה, זמני תגובה, סקיילינג, APIs לאינפרנס, ניטור מודלים ואחריות על סביבת ייצור.',
    resumeStrategy:
      'יש להפחית שפה BI-ית ולהתמקד בקונטיינרים, APIs, מסירה מקצה לקצה וביצועי ייצור מדידים.',
    methodologyHighlights: [
      'MLOps',
      'CI/CD ללמידת מכונה',
      'פריסת מודלים',
      'אימון מבוזר',
      'אופטימיזציית Latency',
      'זיהוי Model Drift',
      'ארכיטקטורת מערכת',
    ],
    targetStack: [
      'Python',
      'C++',
      'Go',
      'PyTorch',
      'TensorFlow',
      'Docker',
      'Kubernetes',
      'MLflow',
      'Ray Serve',
      'FastAPI',
      'Triton Inference Server',
    ],
    keywords: [
      'deployment',
      'latency optimization',
      'containerization',
      'api design',
      'production logs',
    ],
    evidenceLine:
      'Backed by projects spanning model deployment, latency reduction, and production-scale ML systems.',
    roleTitleSuggestions: [
      { value: 'junior-machine-learning-engineer', label: 'Junior Machine Learning Engineer', keywords: ['mle', 'entry level'] },
      { value: 'applied-ml-engineer', label: 'Applied Machine Learning Engineer', keywords: ['applied', 'production'] },
      { value: 'mlops-engineer', label: 'MLOps Engineer', keywords: ['mlops', 'platform'] },
      { value: 'llm-engineer', label: 'LLM Engineer', keywords: ['llm', 'rag'] },
      { value: 'ai-platform-engineer', label: 'AI Platform Engineer', keywords: ['platform', 'serving'] },
    ],
    projectTemplates: [
      {
        value: 'realtime-inference-api',
        label: 'Real-Time Inference API',
        role: 'Machine Learning Engineer',
        description: 'Productionize model serving with measurable latency and scale targets.',
        keywords: ['realtime', 'fastapi', 'docker', 'latency'],
        technologySeeds: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Triton Inference Server', 'Kubernetes'],
        bulletSeeds: [
          {
            actionVerb: 'deployed',
            baseline: 'for high-traffic fraud scoring requests',
            scope: 'a real-time model inference API',
            outcomeKey: 'latency',
          },
          {
            actionVerb: 'scaled',
            baseline: 'under bursty production traffic',
            scope: 'an autoscaled serving architecture',
            outcomeKey: 'throughput',
          },
        ],
      },
      {
        value: 'rag-knowledge-assistant',
        label: 'RAG Knowledge Assistant',
        role: 'LLM Engineer',
        description: 'Serve grounded LLM answers with retrieval, observability, and data safety.',
        keywords: ['rag', 'langchain', 'llm', 'vector'],
        technologySeeds: ['Python', 'Hugging Face Transformers', 'LangChain', 'LlamaIndex', 'FastAPI', 'Docker'],
        bulletSeeds: [
          {
            actionVerb: 'architected',
            baseline: 'against internal policy and support documentation',
            scope: 'a retrieval-augmented generation service',
            outcomeKey: 'query_accuracy',
          },
          {
            actionVerb: 'productionized',
            baseline: 'with observability, retries, and deployment automation',
            scope: 'an LLM serving workflow',
            outcomeKey: 'uptime',
          },
        ],
      },
      {
        value: 'vision-inspection-service',
        label: 'Computer Vision Inspection Service',
        role: 'Applied ML Engineer',
        description: 'Move a vision model from notebook evaluation into a production service.',
        keywords: ['computer vision', 'pytorch', 'serving', 'latency'],
        technologySeeds: ['Python', 'PyTorch', 'TensorFlow', 'Docker', 'Ray Serve', 'MLflow'],
        bulletSeeds: [
          {
            actionVerb: 'engineered',
            baseline: 'for production image triage in manufacturing flows',
            scope: 'a computer vision inference service',
            outcomeKey: 'accuracy',
          },
          {
            actionVerb: 'optimized',
            baseline: 'for p95 response times under peak load',
            scope: 'a GPU inference path',
            outcomeKey: 'latency',
          },
        ],
      },
    ],
    skillQuickPacks: [
      {
        id: 'mle-serving',
        label: 'סטאק הגשה',
        skills: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'Kubernetes'],
      },
      {
        id: 'mle-ops',
        label: 'MLOps',
        skills: ['MLflow', 'Weights & Biases', 'Ray Serve', 'Git'],
      },
      {
        id: 'mle-llm',
        label: 'GenAI',
        skills: ['Hugging Face Transformers', 'LangChain', 'LlamaIndex', 'Triton Inference Server'],
      },
    ],
    recommendedSkills: {
      programmingLanguages: ['Python', 'Go', 'C++'],
      machineLearningAI: [
        'PyTorch',
        'TensorFlow',
        'Hugging Face Transformers',
        'LangChain',
      ],
      dataEngineeringMLOps: [
        'Docker',
        'Kubernetes',
        'MLflow',
        'Ray Serve',
        'FastAPI',
        'Triton Inference Server',
      ],
      mathematicsAnalytics: ['Feature Engineering', 'Conformal Prediction'],
    },
  },
  {
    value: 'de',
    shortLabel: 'DE',
    label: 'מהנדס/ת נתונים',
    defaultTargetTitle: 'Junior Data Engineer',
    description:
      'התאמה לפייפליינים של נתונים, תכנון אחסון, תזמור, מערכות מבוזרות ואמינות מדידה בקנה מידה גדול.',
    resumeStrategy:
      'יש לכמת נפחי נתונים, שיפורי זמן ריצה, אמינות תזמור והתשתית שמזינה אנליטיקה ו-ML.',
    methodologyHighlights: [
      'פייפלייני ETL/ELT',
      'מחסן נתונים',
      'מידול נתונים',
      'חישוב מבוזר',
      'תזמור נתונים',
      'ארכיטקטורות סטרימינג',
    ],
    targetStack: [
      'Python',
      'Java',
      'Scala',
      'SQL',
      'Bash',
      'Apache Airflow',
      'dbt',
      'Apache Spark',
      'Hadoop',
      'Kafka',
      'Snowflake',
      'Amazon Redshift',
      'AWS S3',
    ],
    keywords: [
      'data volume',
      'database optimization',
      'pipeline orchestration',
      'streaming architectures',
      'data reliability',
    ],
    evidenceLine:
      'Backed by projects spanning large-scale ingestion, warehouse transformation, and reliable scheduled pipelines.',
    roleTitleSuggestions: [
      { value: 'junior-data-engineer', label: 'Junior Data Engineer', keywords: ['de', 'entry level'] },
      { value: 'analytics-engineer', label: 'Analytics Engineer', keywords: ['analytics engineer', 'dbt'] },
      { value: 'platform-data-engineer', label: 'Platform Data Engineer', keywords: ['platform', 'pipelines'] },
      { value: 'etl-engineer', label: 'ETL Engineer', keywords: ['etl', 'batch'] },
      { value: 'streaming-data-engineer', label: 'Streaming Data Engineer', keywords: ['streaming', 'kafka'] },
    ],
    projectTemplates: [
      {
        value: 'streaming-orders-pipeline',
        label: 'Streaming Orders Pipeline',
        role: 'Data Engineer',
        description: 'Build a resilient streaming pipeline with freshness and throughput metrics.',
        keywords: ['streaming', 'kafka', 'spark', 'freshness'],
        technologySeeds: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'AWS S3', 'Docker'],
        bulletSeeds: [
          {
            actionVerb: 'architected',
            baseline: 'for continuously arriving order and event data',
            scope: 'a streaming ingestion and enrichment pipeline',
            outcomeKey: 'freshness',
          },
          {
            actionVerb: 'optimized',
            baseline: 'under rising daily traffic volumes',
            scope: 'a Spark processing layer',
            outcomeKey: 'throughput',
          },
        ],
      },
      {
        value: 'warehouse-transformation-graph',
        label: 'Warehouse Transformation Graph',
        role: 'Analytics Engineer',
        description: 'Turn raw tables into reliable marts with dbt, tests, and warehouse modeling.',
        keywords: ['warehouse', 'dbt', 'snowflake', 'data quality'],
        technologySeeds: ['SQL', 'dbt', 'Snowflake', 'Git', 'Apache Airflow'],
        bulletSeeds: [
          {
            actionVerb: 'orchestrated',
            baseline: 'for finance and go-to-market reporting dependencies',
            scope: 'a tested warehouse transformation graph',
            outcomeKey: 'data_quality',
          },
          {
            actionVerb: 'automated',
            baseline: 'for scheduled daily refreshes and SLA monitoring',
            scope: 'a warehouse orchestration workflow',
            outcomeKey: 'uptime',
          },
        ],
      },
      {
        value: 'feature-pipeline-platform',
        label: 'Feature Pipeline Platform',
        role: 'Platform Data Engineer',
        description: 'Deliver clean feature tables and batch scoring inputs for downstream ML teams.',
        keywords: ['feature store', 'airflow', 'spark', 'batch scoring'],
        technologySeeds: ['Python', 'SQL', 'Apache Airflow', 'Apache Spark', 'MLflow', 'AWS S3'],
        bulletSeeds: [
          {
            actionVerb: 'engineered',
            baseline: 'for downstream churn and fraud models',
            scope: 'a batch feature generation pipeline',
            outcomeKey: 'runtime',
          },
          {
            actionVerb: 'scaled',
            baseline: 'across multi-terabyte training snapshots',
            scope: 'a reusable feature delivery framework',
            outcomeKey: 'throughput',
          },
        ],
      },
    ],
    skillQuickPacks: [
      {
        id: 'de-pipelines',
        label: 'פייפליינים',
        skills: ['Python', 'SQL', 'Apache Airflow', 'dbt', 'Apache Spark'],
      },
      {
        id: 'de-streaming',
        label: 'סטרימינג',
        skills: ['Kafka', 'AWS S3', 'Docker', 'Git'],
      },
      {
        id: 'de-warehouse',
        label: 'מחסן נתונים',
        skills: ['Snowflake', 'Amazon Redshift', 'Data Modeling', 'Bash Scripting'],
      },
    ],
    recommendedSkills: {
      programmingLanguages: ['Python', 'SQL', 'Scala', 'Bash Scripting'],
      machineLearningAI: ['Pandas', 'NumPy'],
      dataEngineeringMLOps: [
        'Apache Airflow',
        'dbt',
        'Apache Spark',
        'Kafka',
        'Snowflake',
        'Amazon Redshift',
        'AWS S3',
        'Git',
        'Docker',
      ],
      mathematicsAnalytics: ['Statistical Modeling'],
    },
  },
]

export const getCareerTrackConfig = (track: TargetTrack) =>
  careerTrackOptions.find((option) => option.value === track) ?? careerTrackOptions[0]

export const getRoleTitleSuggestions = (track: TargetTrack) =>
  getCareerTrackConfig(track).roleTitleSuggestions

export const getTrackProjectTemplates = (track: TargetTrack) =>
  getCareerTrackConfig(track).projectTemplates

export const getProjectTemplate = (track: TargetTrack, templateKey: string) =>
  getTrackProjectTemplates(track).find((template) => template.value === templateKey)

export const getTrackSkillQuickPacks = (track: TargetTrack) =>
  getCareerTrackConfig(track).skillQuickPacks

export const getTrackRecommendedSkills = (
  track: TargetTrack,
  category: SkillCategoryKey,
) => getCareerTrackConfig(track).recommendedSkills[category]

export const getTrackProjectRoleSuggestions = (track: TargetTrack): SearchableOption[] =>
  Array.from(
    new Set(getTrackProjectTemplates(track).map((template) => template.role)),
  ).map((role) => ({
    value: role.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    label: role,
    keywords: [track],
  }))

export const getTrackActionOptions = (track: TargetTrack) =>
  xyzActionOptions.filter((option) => option.tracks.includes(track))

export const getTrackOutcomeOptions = (track: TargetTrack) =>
  xyzOutcomeOptions.filter((option) => option.tracks.includes(track))
