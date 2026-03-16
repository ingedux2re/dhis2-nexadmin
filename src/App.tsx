import type React from 'react'
import { Suspense } from 'react'
import { HashRouter } from 'react-router-dom'
import { CircularLoader } from '@dhis2/ui'
import './i18n'
import './styles/global.css'
import { AppRoutes } from './routes'

const App: React.FC = () => (
  <HashRouter>
    <Suspense fallback={<CircularLoader />}>
      <AppRoutes />
    </Suspense>
  </HashRouter>
)

export default App
