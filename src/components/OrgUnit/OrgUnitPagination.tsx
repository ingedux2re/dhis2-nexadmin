// src/components/OrgUnit/OrgUnitPagination.tsx
import { Pagination } from '@dhis2/ui'
import type { Pager } from '../../types/orgUnit'

interface Props {
  pager: Pager
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function OrgUnitPagination({ pager, onPageChange, onPageSizeChange }: Props) {
  return (
    <Pagination
      page={pager.page}
      pageCount={pager.pageCount ?? 1}
      pageSize={pager.pageSize}
      total={pager.total}
      onPageChange={onPageChange}
      // DHIS2 Pagination fires pageSize as string in some versions — coerce
      onPageSizeChange={(ps: number | string) => onPageSizeChange(Number(ps))}
    />
  )
}
