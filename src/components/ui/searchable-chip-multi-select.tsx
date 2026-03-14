import { Search, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '../../lib/utils'

interface SearchableChipMultiSelectProps {
  value: string[]
  options: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  allowCustom?: boolean
  onCustomRequest?: () => void
  customActionLabel?: string
  dir?: 'ltr' | 'rtl'
  emptyMessage?: string
}

const normalize = (value: string) => value.trim().toLowerCase()

export const SearchableChipMultiSelect = ({
  value,
  options,
  onChange,
  placeholder = 'חפשו ובחרו',
  allowCustom = false,
  onCustomRequest,
  customActionLabel = 'אחר / מותאם אישית',
  dir = 'rtl',
  emptyMessage = 'אין אפשרויות תואמות לחיפוש הזה.',
}: SearchableChipMultiSelectProps) => {
  const [query, setQuery] = useState('')

  const optionPool = useMemo(
    () => Array.from(new Set([...value, ...options])).sort((first, second) => first.localeCompare(second)),
    [options, value],
  )

  const visibleOptions = useMemo(() => {
    const normalized = normalize(query)

    const prioritized = optionPool.filter((option) =>
      normalized ? normalize(option).includes(normalized) : true,
    )

    return prioritized.sort((first, second) => {
      const firstSelected = value.includes(first)
      const secondSelected = value.includes(second)

      if (firstSelected === secondSelected) {
        return first.localeCompare(second)
      }

      return firstSelected ? -1 : 1
    })
  }, [optionPool, query, value])

  const canAddCustom =
    allowCustom &&
    query.trim() !== '' &&
    !optionPool.some((option) => normalize(option) === normalize(query))

  const toggleOption = (option: string) => {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    )
  }

  return (
    <div className="space-y-3" dir={dir}>
      <div className="relative">
        <input
          className="h-12 w-full rounded-[20px] border border-slate-200/85 bg-white/90 px-4 pe-11 ps-11 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_36px_-32px_rgba(15,23,42,0.34)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          value={query}
        />
        <span className="pointer-events-none absolute inset-y-2 start-2.5 flex w-8 items-center justify-center rounded-2xl bg-slate-50/90 text-slate-400">
          <Search className="size-4" />
        </span>
        {query ? (
          <button
            className="absolute inset-y-2 end-2.5 flex w-8 items-center justify-center rounded-2xl bg-slate-50/90 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setQuery('')}
            type="button"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-950 transition hover:border-cyan-300 hover:bg-cyan-100"
              key={item}
              onClick={() => toggleOption(item)}
              type="button"
            >
              <span>{item}</span>
              <X className="size-3.5" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {onCustomRequest ? (
          <button
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-950 transition hover:border-cyan-300 hover:bg-cyan-100"
            onClick={onCustomRequest}
            type="button"
          >
            <Sparkles className="size-3.5" />
            <span>{customActionLabel}</span>
          </button>
        ) : null}
        {canAddCustom ? (
          <button
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-950 transition hover:border-emerald-300 hover:bg-emerald-100"
            onClick={() => {
              onChange([...value, query.trim()])
              setQuery('')
            }}
            type="button"
          >
            <Sparkles className="size-3.5" />
            <span>הוסיפו "{query.trim()}"</span>
          </button>
        ) : null}

        {visibleOptions.length > 0 ? (
          visibleOptions.map((option) => {
            const selected = value.includes(option)

            return (
              <button
                className={cn(
                  'rounded-full border px-3 py-2 text-xs font-semibold transition',
                  selected
                    ? 'border-cyan-400 bg-[linear-gradient(135deg,rgba(236,254,255,0.92),rgba(224,242,254,0.94))] text-cyan-950 shadow-[0_18px_44px_-32px_rgba(6,182,212,0.48)]'
                    : 'border-slate-200/90 bg-white/90 text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-950',
                )}
                key={option}
                onClick={() => toggleOption(option)}
                type="button"
              >
                {option}
              </button>
            )
          })
        ) : (
          <div className="rounded-[18px] bg-slate-50/80 px-3 py-3 text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}
