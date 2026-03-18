# Feature: Org Unit Deployment in Assign-to-Dataset Workflow

**Date:** 2025-03-18  
**Module:** Data Element Engineering (Bulk Create → Assign to Dataset)

---

## Summary

The "Assign to dataset" workflow now includes an optional **Org unit deployment** step. After selecting or creating a dataset and choosing data elements, users can deploy the dataset to:

- **Specific existing organisation units**
- **Existing organisation unit groups** (members resolved at apply time)

Only **existing** org units are supported. No org unit creation in this flow.

---

## report-fbr-mali-app Reference

### Org units to dataset (SyncDataSet.js)

| Aspect | Details |
|--------|---------|
| **Function** | `updateOu(myDataSet, missingOrgunits)` |
| **API** | GET `dataSets/{id}` with `fields: ":all"` → append to `organisationUnits` → PUT |
| **Merge strategy** | Append only; `dataSetOrgunits = new Set(dataSet.organisationUnits.map(ou => ou.id))`; for each missing OU, if `!dataSetOrgunits.has(missingOu.id)` then push |
| **Payload** | Full dataset object with `organisationUnits` array |
| **Safeguard** | Never overwrite; only append new org units |

### Org unit groups (SyncProgramGroups.js)

- Modifies **org unit group membership** (add/remove org units to groups), not dataset assignment.
- GET `organisationUnitGroups/{id}` → modify `organisationUnits` → PUT.

### Resolving group members (Dhis2.js)

- `getOrgunitsForGroup(ancestorId, groupId)`: GET `organisationUnits?filter=organisationUnitGroups.id:eq:{groupId}&filter=ancestors.id:eq:{ancestorId}`.
- For dataset deployment we use: GET `organisationUnitGroups/{id}?fields=organisationUnits[id]` to get member IDs.

---

## dhis2-nexadmin Implementation

### Design considerations

1. **Dataset–org unit relationship** — Org units are assigned to **datasets**, not data elements.
2. **Merge, never replace** — Existing dataset `organisationUnits` are preserved; new ones are appended.
3. **Full payload** — Same GET → merge → PUT pattern as data elements; `mergeMode: 'REPLACE'` with full dataset.
4. **Group resolution** — Resolve group members via `organisationUnitGroups/{id}?fields=organisationUnits[id]` before apply.
5. **Deduplication** — Selected org units + resolved from groups, deduped by ID.

### Wizard flow

1. Choose action (assign existing / create new / skip)
2. Dataset selection or creation + element scope
3. **Org unit deployment** (new step)
4. Confirm
5. Apply

### API flow

**Existing datasets:**

1. GET `dataSets/{id}` with `fields: ':owner'` (includes `organisationUnits`, `dataSetElements`)
2. Merge data elements: append new `dataSetElements` (with `dataElement`, `categoryCombo`, `dataSet`)
3. Merge org units: append new `organisationUnits` (with `{ id }`)
4. PUT `dataSets/{id}` with `mergeMode: 'REPLACE'`

**New dataset:**

1. POST `dataSets` with `dataSetElements`, optional `organisationUnits`
2. `organisationUnits` included in create payload when user selected org units/groups

**Group member resolution:**

- GET `organisationUnitGroups/{id}?fields=organisationUnits[id]` for each selected group
- Collect all `organisationUnits[].id`, deduplicate
- Merge with specifically selected org unit IDs

---

## Files changed

| File | Change |
|------|--------|
| `src/modules/data-elements/hooks/useAssignDataset.ts` | Added `orgUnitDeployment` mode, state for org units/groups, `loadOrgUnitsAndGroups`, `resolveOrgUnitIdsFromGroups`, merge logic in `executeAssignExisting` and `executeCreateNew` |
| `src/modules/data-elements/components/AssignDatasetModal.tsx` | Added `OrgUnitDeploymentStep`, step flow, confirm with org unit counts, footer note |
| `docs/features/assign-dataset-org-unit-deployment.md` | Feature documentation |

---

## Safeguards

- **No org unit selected** — Workflow succeeds; deployment step is optional.
- **Group with zero members** — Warning shown; no org units deployed from that group.
- **Deduplication** — Selected org units + resolved from groups merged and deduped by ID.
- **Existing dataset org units** — Never removed; only new org units appended.
- **Data elements** — Existing `dataSetElements` preserved; only new ones appended.

---

## Manual test steps

1. **New dataset + specific org units**
   - Bulk create data elements → Assign → Create new dataset → Org unit deployment → select 2 existing org units → Confirm & Apply.
   - Verify dataset created with elements and 2 org units.

2. **New dataset + org unit group**
   - Same flow → select 1 existing org unit group → Confirm & Apply.
   - Verify dataset deployed to all members of that group.

3. **Existing dataset + merge org units**
   - Assign to existing dataset that already has org units → Org unit deployment → select more org units → Confirm & Apply.
   - Verify existing org units unchanged; new ones added.

4. **No org units selected**
   - Complete flow without selecting any org units or groups.
   - Verify workflow succeeds; dataset created/updated with elements only.

5. **Group with zero members**
   - Select an org unit group that has no members.
   - Proceed to confirm; verify warning is shown.
   - Apply; verify workflow succeeds with 0 org units from groups.

6. **Back navigation**
   - From org unit deployment, click Back → verify return to dataset selection/create.
   - From confirm, click Back → verify return to org unit deployment.
