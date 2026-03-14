// src/components/OrgUnit/OrgUnitSearch.tsx
import { useState, useCallback } from 'react'
import { Input } from '@dhis2/ui'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function OrgUnitSearch({
  value,
  onChange,
  placeholder = 'Search organisation units…',
  disabled = false,
}: Props) {
  const [local, setLocal] = useState(value)

  const handleChange = useCallback(
    ({ value: v }: { value?: string }) => {
      const next = v ?? ''
      setLocal(next)
      onChange(next)
    },
    [onChange]
  )

  return (
    <Input
      value={local}
      onChange={handleChange}
      placeholder={placeholder}
      type="search"
      disabled={disabled}
    />
  )
}
