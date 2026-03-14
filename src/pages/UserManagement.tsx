import type React from 'react'
import i18n from '@dhis2/d2-i18n'
const UserManagement: React.FC = () => (
  <div data-testid="page-UserManagement">
    <h1>{i18n.t('User Management')}</h1>
    <p>{i18n.t('This module is under construction.')}</p>
  </div>
)
export default UserManagement
