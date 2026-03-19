# Feature: Sharing & Access in Assign-to-Dataset Workflow

**Date:** 2025-03-18  
**Module:** Data Element Engineering (Bulk Create → Assign to Dataset)

---

## Summary

The "Assign to dataset" workflow includes a final **Sharing & Access** step before confirmation. Users can configure:

- **Public access** — None (private), View only, or View and edit
- **User groups** — Add user groups with View only or View and edit access

No per-user sharing in this MVP. When no sharing is configured, existing sharing is preserved.

---

## DHIS2 Sharing API

### Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/sharing?type=dataSet&id={id}` | Fetch current sharing |
| POST | `/api/sharing?type=dataSet&id={id}` | Update sharing |

### Request/Response

**GET response:**
```json
{
  "meta": { "allowPublicAccess": true, "allowExternalAccess": false },
  "object": {
    "publicAccess": "rw------",
    "externalAccess": false,
    "user": {},
    "userGroupAccesses": [
      { "id": "userGroupId", "access": "rw------" }
    ]
  }
}
```

**POST payload:**
```json
{
  "object": {
    "publicAccess": "rw------",
    "externalAccess": false,
    "user": {},
    "userGroupAccesses": [
      { "id": "userGroupId", "access": "r-------" }
    ]
  }
}
```

### Access strings

| UI option | Access string | DHIS2 positions |
|----------|---------------|-----------------|
| None (private) | `--------` | — |
| View only | `r-------` | Pos 1: metadata read |
| Edit metadata only | `rw------` | Pos 1–2: metadata read+write; pos 3–4: no data access |
| Edit metadata and data entry | `rwrw----` | Pos 1–4: metadata + data read+write |

---

## API flow

1. **Apply sharing only when configured** — If `publicAccess === '--------'` and `userGroupAccesses.length === 0`, skip sharing API call (preserve existing).
2. **Fetch current sharing** — GET `/api/sharing?type=dataSet&id={id}` before updating.
3. **Merge safely** — Preserve `externalAccess`, `user`, `owner` from current; apply new `publicAccess` and `userGroupAccesses`.
4. **POST updated sharing** — Same URL with merged `object`.

---

## Sharing merge logic

| Field | Source | Notes |
|-------|--------|-------|
| `publicAccess` | UI selection | Overwrite |
| `userGroupAccesses` | UI selection | Replace entire list with user-selected groups |
| `externalAccess` | Current object | Preserve (default false) |
| `user` | Current object | Preserve (owner) |

---

## Wizard flow

1. Choose action (assign existing / create new / skip)
2. Dataset selection or creation + element scope
3. Org unit deployment
4. **Sharing & Access** (new step)
5. Confirm
6. Apply

---

## Partial success handling

When dataset operations succeed but sharing fails (e.g. permission error):

- **Done step** shows "Done with warnings" instead of "Done!"
- **Sharing errors** listed below the success message
- **Result message** still reflects successful dataset/element/org unit operations

---

## Files changed

| File | Change |
|------|--------|
| `src/modules/data-elements/hooks/useAssignDataset.ts` | Added `sharing` mode, `publicAccess`, `userGroupAccesses`, `userGroups`, `loadUserGroups`, `applySharingToDataSet`, merge logic, `sharingErrors` for partial success |
| `src/modules/data-elements/components/AssignDatasetModal.tsx` | Added `SharingStep`, sharing props to `ConfirmStep`, `DoneStep` partial success UI, footer note |
| `docs/features/assign-dataset-sharing.md` | Feature documentation |

---

## Manual test steps

1. **New dataset + public access**
   - Bulk create → Assign → Create new dataset → Org unit deployment (optional) → Sharing → set Public access to "View only" → Confirm & Apply.
   - Verify dataset created and sharing shows public view.

2. **New dataset + user groups**
   - Same flow → Sharing → add 1–2 user groups with View and edit → Confirm & Apply.
   - Verify dataset shared with selected groups.

3. **Existing dataset + update sharing**
   - Assign to existing dataset → Org unit deployment → Sharing → change public access or add groups → Confirm & Apply.
   - Verify sharing updated; existing sharing merged (externalAccess, user preserved).

4. **No sharing configured**
   - Complete flow without changing public access or adding user groups.
   - Verify workflow succeeds; no sharing API called; existing sharing preserved.

5. **Partial success (sharing fails)**
   - If possible, simulate sharing failure (e.g. insufficient permissions).
   - Verify "Done with warnings" and sharing error list shown.

6. **Back navigation**
   - From sharing, click Back → verify return to org unit deployment.
   - From confirm, click Back → verify return to sharing.
