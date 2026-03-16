import type React from 'react'
import { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'
import { CircularLoader } from '@dhis2/ui'
import './i18n'
import './styles/global.css'
import { AppRoutes } from './routes'
import { useLocaleStore } from './store'

// ── Inner app — keyed by locale so all i18n.t() calls re-execute on lang change ──
const AppInner: React.FC = () => (
  <HashRouter>
    <Suspense fallback={<CircularLoader />}>
      <AppRoutes />
    </Suspense>
  </HashRouter>
)

// ── Root wrapper — subscribes to locale and remounts AppInner on change ──
const App: React.FC = () => {
  const locale = useLocaleStore()
  return <AppInner key={locale} />
}

export default App
