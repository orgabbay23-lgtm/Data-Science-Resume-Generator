export interface SearchableOption {
  value: string
  label: string
  keywords?: string[]
}

export const companySuggestions: SearchableOption[] = [
  { value: 'google', label: 'Google' },
  { value: 'microsoft', label: 'Microsoft' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'meta', label: 'Meta' },
  { value: 'nvidia', label: 'NVIDIA' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'databricks', label: 'Databricks' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'monday', label: 'monday.com' },
  { value: 'wix', label: 'Wix' },
  { value: 'intel', label: 'Intel' },
  { value: 'research-lab', label: 'Research Lab' },
  { value: 'stealth-startup', label: 'Stealth Startup' },
]
