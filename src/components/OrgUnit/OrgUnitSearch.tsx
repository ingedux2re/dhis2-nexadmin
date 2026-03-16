// src/components/OrgUnit/OrgUnitSearch.tsx
// The component is fully controlled: the `value` prop is the single source of
// truth. Local state was removed because it diverged from the parent's state
// whenever the parent reset the search (e.g. after a filter clear).
import { useCallback } from 'react'
import { Input } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function OrgUnitSearch({
  value,
  onChange,
  placeholder = i18n.t('Search organisation units…'),
  disabled = false,
}: Props) {
  const handleChange = useCallback(
    ({ value: v }: { value?: string }) => {
      onChange(v ?? '')
    },
    [onChange]
  )

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      type="search"
      disabled={disabled}
    />
  )
}
