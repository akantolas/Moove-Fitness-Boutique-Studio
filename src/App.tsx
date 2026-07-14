import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConditionalAnalytics } from './components/ConditionalAnalytics'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { PosingAuthProvider } from './contexts/PosingAuthContext'
import { HomePage } from './pages/Home'
import { ClassesPage } from './pages/Classes'
import { AboutPage } from './pages/About'
import { ContactPage } from './pages/Contact'
import { CookiesPage } from './pages/Cookies'
import { PrivacyPage } from './pages/Privacy'
import { ServiceTermsPage } from './pages/ServiceTerms'
import { TermsOfUsePage } from './pages/TermsOfUse'
import { PosingPage } from './pages/Posing'
import { PosingAboutPage } from './pages/PosingAbout'
import { PosingLoginPage, PosingSignupPage } from './pages/PosingAuth'
import { PosingAccountPage } from './pages/PosingAccount'
import { PosingAccountSettingsPage } from './pages/PosingAccountSettings'
import { PosingAdminPage } from './pages/PosingAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PosingAuthProvider>
        <ConditionalAnalytics />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/mathimata" element={<ClassesPage />} />
            <Route path="/sxetika" element={<AboutPage />} />
            <Route path="/epikoinonia" element={<ContactPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/service-terms" element={<ServiceTermsPage />} />
            <Route path="/posing" element={<PosingPage />} />
            <Route path="/posing/about" element={<PosingAboutPage />} />
            <Route path="/posing/login" element={<PosingLoginPage />} />
            <Route path="/posing/signup" element={<PosingSignupPage />} />
            <Route path="/posing/account" element={<PosingAccountPage />} />
            <Route path="/posing/account/settings" element={<PosingAccountSettingsPage />} />
            <Route path="/posing/admin" element={<PosingAdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PosingAuthProvider>
    </BrowserRouter>
  )
}
