// src/hooks/useOrgUnitMutations.ts
import { useDataMutation } from '@dhis2/app-runtime'
import type { OrgUnitCreatePayload, OrgUnitUpdatePayload } from '../types/orgUnit'

// ── mutations ─────────────────────────────────────────────────────────────────

const CREATE_MUTATION = {
  resource: 'organisationUnits',
  type: 'create' as const,
  data: (vars: { data: OrgUnitCreatePayload }) => vars.data,
}

// id MUST resolve at call-time; app-runtime supports a resolver function
// but some TS overloads only declare `string`.  Cast silences the error.
const UPDATE_MUTATION = {
  resource: 'organisationUnits',
  type: 'update' as const,
  id: (({ id }: { id: string }) => id) as unknown as string,
  data: ({ id: _id, ...rest }: { id: string } & OrgUnitUpdatePayload) => rest,
}

const DELETE_MUTATION = {
  resource: 'organisationUnits',
  type: 'delete' as const,
  id: (({ id }: { id: string }) => id) as unknown as string,
}

// ── hooks ─────────────────────────────────────────────────────────────────────

export function useCreateOrgUnit() {
  const [mutate, state] = useDataMutation(CREATE_MUTATION)
  const create = (data: OrgUnitCreatePayload) => mutate({ data })
  return { create, ...state }
}

export function useUpdateOrgUnit() {
  const [mutate, state] = useDataMutation(UPDATE_MUTATION)
  const update = (id: string, data: OrgUnitUpdatePayload) => mutate({ id, ...data })
  return { update, ...state }
}

export function useDeleteOrgUnit() {
  const [mutate, state] = useDataMutation(DELETE_MUTATION)
  const remove = (id: string) => mutate({ id })
  return { remove, ...state }
}
