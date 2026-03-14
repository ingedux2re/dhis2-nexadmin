import './i18n'
import i18n from '@dhis2/d2-i18n'
import { Suspense } from 'react'
import { CircularLoader } from '@dhis2/ui'
import { useLocale } from './hooks/useLocale'

const AppPlaceholder = () => {
  const { currentLocale } = useLocale()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 16,
        fontFamily: 'system-ui, sans-serif',
        background: '#f4f6f8',
      }}
    >
      <div style={{ fontSize: 48 }}>⚡</div>
      <h1 style={{ margin: 0, fontSize: 24, color: '#1a237e' }}>{i18n.t('DHIS2 NexAdmin')}</h1>
      <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
        {i18n.t('IS Administration Toolkit · Phase 0 scaffold')}
      </p>
      <p style={{ margin: 0, color: '#aaa', fontSize: 12 }}>
        {i18n.t('Active locale:')}: <code>{currentLocale}</code>
      </p>
    </div>
  )
}

const App = () => (
  <Suspense
    fallback={
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularLoader />
      </div>
    }
  >
    <AppPlaceholder />
  </Suspense>
)

export default App
