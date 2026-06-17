import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CookieConsentProvider } from './cookies/CookieConsentProvider'
import { I18nProvider } from './i18n/I18nProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <CookieConsentProvider>
        <App />
      </CookieConsentProvider>
    </I18nProvider>
  </StrictMode>,
)
