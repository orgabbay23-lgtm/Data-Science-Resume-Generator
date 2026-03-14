import { ChevronDown, PenSquare, Search } from 'lucide-react'
import {
  type CSSProperties,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import type { SearchableOption } from '../../data/options/automation-options'

interface SearchableComboboxProps {
  value: string
  options: SearchableOption[]
  placeholder?: string
  onValueChange: (value: string) => void
  onOptionSelect?: (option: SearchableOption) => void
  onCustomRequest?: () => void
  customActionLabel?: string
  dir?: 'ltr' | 'rtl'
  emptyMessage?: string
  className?: string
  commitFreeText?: boolean
}

const matchesOption = (option: SearchableOption, query: string) => {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return true
  }

  return [option.label, option.value, ...(option.keywords ?? [])].some((item) =>
    item.toLowerCase().includes(normalized),
  )
}

export const SearchableCombobox = ({
  value,
  options,
  placeholder,
  onValueChange,
  onOptionSelect,
  onCustomRequest,
  customActionLabel = 'אחר / מותאם אישית',
  dir = 'rtl',
  emptyMessage = 'אין התאמות כרגע.',
  className,
  commitFreeText = true,
}: SearchableComboboxProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ opacity: 0 })

  const filteredOptions = useMemo(
    () => options.filter((option) => matchesOption(option, inputValue)).slice(0, 8),
    [inputValue, options],
  )

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node

      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const updateMenuPosition = useEffectEvent(() => {
    const container = containerRef.current
    const menu = menuRef.current

    if (!container || !menu) {
      return
    }

    const viewportMargin = 16
    const gap = 8
    const containerRect = container.getBoundingClientRect()
    const menuRect = menu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const width = Math.min(containerRect.width, viewportWidth - viewportMargin * 2)
    const left = Math.min(
      Math.max(containerRect.left, viewportMargin),
      viewportWidth - width - viewportMargin,
    )
    const availableBelow = viewportHeight - containerRect.bottom - gap - viewportMargin
    const availableAbove = containerRect.top - gap - viewportMargin
    const shouldRenderBelow =
      availableBelow >= Math.min(menuRect.height, 260) || availableBelow >= availableAbove
    const maxHeight = Math.max(140, shouldRenderBelow ? availableBelow : availableAbove)
    const top = shouldRenderBelow
      ? containerRect.bottom + gap
      : Math.max(
          viewportMargin,
          containerRect.top - Math.min(menuRect.height, maxHeight) - gap,
        )

    setMenuStyle({
      left,
      maxHeight,
      opacity: 1,
      top,
      width,
    })
  })

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    updateMenuPosition()
    const frame = window.requestAnimationFrame(updateMenuPosition)

    const handleWindowChange = () => updateMenuPosition()

    window.addEventListener('resize', handleWindowChange)
    window.addEventListener('scroll', handleWindowChange, true)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleWindowChange)
      window.removeEventListener('scroll', handleWindowChange, true)
    }
  }, [filteredOptions.length, inputValue, open])

  return (
    <div className={cn('relative', className)} dir={dir} ref={containerRef}>
      <div className="relative">
        <input
          className={cn(
            'h-13 w-full rounded-[22px] border border-slate-200/85 bg-white/90 px-4 pe-22 ps-12 text-sm text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_20px_42px_-32px_rgba(15,23,42,0.38)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100',
          )}
          onBlur={() => {
            if (!commitFreeText) {
              window.setTimeout(() => {
                setInputValue(value)
              }, 0)
            }
          }}
          onChange={(event) => {
            setInputValue(event.target.value)
            if (commitFreeText) {
              onValueChange(event.target.value)
            }
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          value={inputValue}
        />
        <span className="pointer-events-none absolute inset-y-2 start-2.5 flex w-9 items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-50/90 text-slate-400">
          <Search className="size-4" />
        </span>
        <button
          className="absolute inset-y-2 end-2.5 flex w-9 items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-50/90 text-slate-400 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <ChevronDown className={cn('size-4 transition', open && 'rotate-180')} />
        </button>
      </div>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed z-[130] overflow-y-auto rounded-[24px] border border-white/85 bg-white/96 p-2 shadow-[0_26px_60px_-36px_rgba(15,23,42,0.45)] backdrop-blur"
              ref={menuRef}
              style={menuStyle}
            >
              {filteredOptions.length > 0 ? (
                <>
                  {filteredOptions.map((option) => (
                    <button
                      className="flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-start text-sm text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-950"
                      key={option.value}
                      onClick={() => {
                        if (onOptionSelect) {
                          onOptionSelect(option)
                        } else {
                          onValueChange(option.label)
                        }
                        setInputValue(option.label)
                        setOpen(false)
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      type="button"
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-400">
                        בחר
                      </span>
                    </button>
                  ))}
                  {onCustomRequest ? (
                    <button
                      className="mt-1 flex w-full items-center justify-between rounded-[18px] border border-dashed border-cyan-200 bg-cyan-50/70 px-3 py-3 text-start text-sm font-semibold text-cyan-950 transition hover:border-cyan-300 hover:bg-cyan-100"
                      onClick={() => {
                        setOpen(false)
                        onCustomRequest()
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <PenSquare className="size-4" />
                        <span>{customActionLabel}</span>
                      </span>
                      <span className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-700">
                        עריכה
                      </span>
                    </button>
                  ) : null}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-[18px] bg-slate-50/80 px-3 py-4 text-sm text-slate-500">
                    {emptyMessage}
                  </div>
                  {onCustomRequest ? (
                    <button
                      className="flex w-full items-center justify-between rounded-[18px] border border-dashed border-cyan-200 bg-cyan-50/70 px-3 py-3 text-start text-sm font-semibold text-cyan-950 transition hover:border-cyan-300 hover:bg-cyan-100"
                      onClick={() => {
                        setOpen(false)
                        onCustomRequest()
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <PenSquare className="size-4" />
                        <span>{customActionLabel}</span>
                      </span>
                      <span className="text-[0.68rem] uppercase tracking-[0.16em] text-cyan-700">
                        עריכה
                      </span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
