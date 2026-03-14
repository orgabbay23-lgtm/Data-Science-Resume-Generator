import type { PropsWithChildren } from 'react'

interface ResumeSectionProps extends PropsWithChildren {
  title: string
}

export const ResumeSection = ({ children, title }: ResumeSectionProps) => (
  <section className="space-y-3.5">
    <h2 className="resume-section-title text-slate-800">{title}</h2>
    {children}
  </section>
)
