import type React from 'react'
import { Suspense } from 'react'
import { CircularLoader } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { Sidebar } from '../Sidebar/Sidebar'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className={styles.shell} data-testid="app-shell">
    <header className={styles.topBar}>
      <span className={styles.appName}>{i18n.t('DHIS2 NexAdmin')}</span>
      <LanguageSwitcher />
    </header>
    <div className={styles.body}>
      <Sidebar />
      <main className={styles.main} data-testid="main-content">
        <Suspense fallback={<CircularLoader />}>{children}</Suspense>
      </main>
    </div>
  </div>
)

export default Layout
