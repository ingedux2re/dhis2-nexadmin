import type { ReactNode, FC } from 'react'
import { Suspense } from 'react'
import { CircularLoader } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { Sidebar } from '../Sidebar/Sidebar'
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ children }) => (
  <div className={styles.shell} data-testid="app-shell">
    <header className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <div className={styles.logoMark} aria-hidden="true">
          <span>{i18n.t('NX')}</span>
        </div>
        <span className={styles.appName}>
          {i18n.t('DHIS2')} <em>{i18n.t('NexAdmin')}</em>
        </span>
      </div>
      <div className={styles.topBarRight}>
        <LanguageSwitcher />
      </div>
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
