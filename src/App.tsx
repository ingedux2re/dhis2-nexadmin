import type React from 'react'
import { Suspense, useState, useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { CircularLoader } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import './i18n'
import './styles/global.css'
import { AppRoutes } from './routes'

// ── App ── listens to i18next languageChanged event and increments a render
//    counter so every i18n.t() call re-executes with the new language.
//    Using an event-based approach avoids unmounting the component tree
//    (which would re-trigger the ME_QUERY useEffect and reset the locale). ──
const App: React.FC = () => {
  const [, setRenderCount] = useState(0)

  useEffect(() => {
    const forceRender = () => setRenderCount((n) => n + 1)
    i18n.on('languageChanged', forceRender)
    return () => {
      i18n.off('languageChanged', forceRender)
    }
  }, [])

  return (
    <HashRouter>
      <Suspense fallback={<CircularLoader />}>
        <AppRoutes />
      </Suspense>
    </HashRouter>
  )
}

export default App
