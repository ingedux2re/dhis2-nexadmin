import type React from 'react'
import { Suspense } from 'react'
import { HeaderBar, CircularLoader } from '@dhis2/ui'
import { Sidebar } from '../Sidebar/Sidebar'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className={styles.shell} data-testid="app-shell">
    <HeaderBar appName="DHIS2 NexAdmin" />
    <div className={styles.body}>
      <Sidebar />
      <main className={styles.main} data-testid="main-content">
        <Suspense fallback={<CircularLoader />}>{children}</Suspense>
      </main>
    </div>
  </div>
)

export default Layout
