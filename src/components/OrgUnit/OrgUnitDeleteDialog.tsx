// src/components/OrgUnit/OrgUnitDeleteDialog.tsx
import {
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  ButtonStrip,
  Button,
  NoticeBox,
  CircularLoader,
} from '@dhis2/ui'
import type { OrgUnitListItem } from '../../types/orgUnit'
import i18n from '@dhis2/d2-i18n'

interface OrgUnitDeleteDialogProps {
  orgUnit: OrgUnitListItem
  deleting: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

// [1] signature corrigée : string | null | undefined (plus Error)
// [1] corps corrigé : inspecte la string directement, plus .message
const isConflict = (e: string | null | undefined): boolean =>
  !!e && (e.includes('409') || e.toLowerCase().includes('conflict'))

// [2] syntaxe corrigée : export const + flèche (mélanger function/=> était invalide)
// [3] type OrgUnitDeleteDialogProps ajouté sur les paramètres
export const OrgUnitDeleteDialog = ({
  orgUnit,
  deleting,
  error,
  onConfirm,
  onClose,
}: OrgUnitDeleteDialogProps) => (
  <Modal onClose={onClose} small dataTest="orgunit-delete-dialog">
    <ModalTitle>{i18n.t('Delete organisation unit')}</ModalTitle>

    <ModalContent>
      {error && (
        <NoticeBox
          error
          title={
            isConflict(error)
              ? i18n.t('Cannot delete — org unit has children or associated data')
              : i18n.t('Delete failed')
          }
        >
          {
            isConflict(error)
              ? i18n.t(
                  'This organisation unit cannot be deleted because it has child units or associated data. Remove all associations first.'
                )
              : error /* [4] error est déjà la string — plus error.message */
          }
        </NoticeBox>
      )}

      {!error && (
        <p>
          {i18n.t('Are you sure you want to delete {{name}}? This action cannot be undone.', {
            name: orgUnit.name,
          })}
        </p>
      )}
    </ModalContent>

    <ModalActions>
      <ButtonStrip end>
        <Button secondary onClick={onClose} disabled={deleting} dataTest="delete-dialog-cancel">
          {isConflict(error) ? i18n.t('Close') : i18n.t('Cancel')}
        </Button>

        {!isConflict(error) && (
          <Button
            destructive
            onClick={onConfirm}
            disabled={deleting}
            dataTest="delete-dialog-confirm"
          >
            {deleting ? (
              <>
                <CircularLoader small />
                {i18n.t('Deleting…')}
              </>
            ) : (
              i18n.t('Delete')
            )}
          </Button>
        )}
      </ButtonStrip>
    </ModalActions>
  </Modal>
)
