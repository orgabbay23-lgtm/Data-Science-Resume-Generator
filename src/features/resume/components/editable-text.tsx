import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '../../../lib/utils'

type EditableTextProps<Tag extends ElementType> = {
  as?: Tag
  value: string
  editable?: boolean
  onChange?: (value: string) => void
  multiline?: boolean
  placeholder?: string
  className?: string
  inputClassName?: string
  dir?: 'rtl' | 'ltr' | 'auto'
} & Omit<ComponentPropsWithoutRef<Tag>, 'as' | 'children' | 'onChange'>

export const EditableText = <Tag extends ElementType = 'span'>({
  as,
  className,
  dir,
  editable = false,
  inputClassName,
  multiline = false,
  onChange,
  placeholder = '',
  value,
  ...props
}: EditableTextProps<Tag>) => {
  const Component = (as ?? 'span') as ElementType

  if (!editable || !onChange) {
    return (
      <Component className={className} {...props}>
        {value || placeholder}
      </Component>
    )
  }

  if (multiline) {
    return (
      <textarea
        className={cn(
          'editable-inline block w-full resize-none px-2 py-1 text-inherit placeholder:text-slate-400',
          inputClassName,
        )}
        data-editable="true"
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        rows={Math.min(Math.max(value.split('\n').length, 1), 6)}
        value={value}
      />
    )
  }

  return (
    <input
      className={cn(
        'editable-inline w-full px-2 py-1 text-inherit placeholder:text-slate-400',
        inputClassName,
      )}
      data-editable="true"
      dir={dir}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  )
}
