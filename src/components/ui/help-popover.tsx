import {
  type CSSProperties,
  type PropsWithChildren,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { CircleHelp } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'

interface HelpPopoverProps extends PropsWithChildren {
  title: string
  className?: string
  panelClassName?: string
}

export const HelpPopover = ({
  children,
  className,
  panelClassName,
  title,
}: HelpPopoverProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({ opacity: 0 })

  const updatePanelPosition = useEffectEvent(() => {
    const button = buttonRef.current
    const panel = panelRef.current

    if (!button || !panel) {
      return
    }

    const viewportMargin = 16
    const gap = 10
    const buttonRect = button.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const width = Math.min(panelRect.width || 320, viewportWidth - viewportMargin * 2)
    const left = Math.min(
      Math.max(buttonRect.right - width, viewportMargin),
      viewportWidth - width - viewportMargin,
    )
    const preferredTop = buttonRect.bottom + gap
    const renderBelow = preferredTop + panelRect.height <= viewportHeight - viewportMargin
    const top = renderBelow
      ? preferredTop
      : Math.max(viewportMargin, buttonRect.top - panelRect.height - gap)

    setPanelStyle({
      left,
      opacity: 1,
      top,
      width,
    })
  })

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    updatePanelPosition()
    const frame = window.requestAnimationFrame(updatePanelPosition)

    const handleWindowChange = () => updatePanelPosition()

    window.addEventListener('resize', handleWindowChange)
    window.addEventListener('scroll', handleWindowChange, true)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleWindowChange)
      window.removeEventListener('scroll', handleWindowChange, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node

      if (!buttonRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <span className={cn('relative inline-flex', className)}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={title}
        className="flex items-center rounded-full border border-slate-200/90 bg-white/92 p-1.5 text-slate-400 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        <CircleHelp className="size-4" />
        <span className="sr-only">{title}</span>
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={cn(
                'fixed z-[140] max-w-[calc(100vw-2rem)] rounded-[22px] border border-slate-200/90 bg-white/96 p-4 text-start shadow-[0_28px_70px_-38px_rgba(15,23,42,0.38)] backdrop-blur',
                panelClassName,
              )}
              id={panelId}
              ref={panelRef}
              role="dialog"
              style={panelStyle}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                {title}
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-600">{children}</div>
            </div>,
            document.body,
          )
        : null}
    </span>
  )
}
