import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConditionalAnalytics } from './components/ConditionalAnalytics'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { PosingAuthProvider } from './contexts/PosingAuthContext'
import { PosingBookingStickyProvider } from './contexts/PosingBookingStickyContext'
import { HomePage } from './pages/Home'
import { ClassesPage } from './pages/Classes'
import { AboutPage } from './pages/About'
import { ContactPage } from './pages/Contact'
import { CookiesPage } from './pages/Cookies'
import { PrivacyPage } from './pages/Privacy'
import { ServiceTermsPage } from './pages/ServiceTerms'
import { TermsOfUsePage } from './pages/TermsOfUse'
import { ProgramsPage } from './pages/Programs'
import { ProgramAccessPage } from './pages/ProgramAccess'
import { PosingPage } from './pages/Posing'
import { PosingAboutPage } from './pages/PosingAbout'
import { PosingForgotPasswordPage, PosingLoginPage, PosingResetPasswordPage, PosingSignupPage } from './pages/PosingAuth'
import { PosingOAuthCallbackPage, PosingOAuthReturnGuard } from './pages/PosingOAuthCallback'
import { PosingAccountPage } from './pages/PosingAccount'
import { PosingAccountSettingsPage } from './pages/PosingAccountSettings'
import { PosingAdminPage } from './pages/PosingAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PosingAuthProvider>
        <ConditionalAnalytics />
        <PosingOAuthReturnGuard />
        <Routes>
          <Route
            element={
              <PosingBookingStickyProvider>
                <Layout />
              </PosingBookingStickyProvider>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/mathimata" element={<ClassesPage />} />
            <Route path="/sxetika" element={<AboutPage />} />
            <Route path="/epikoinonia" element={<ContactPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/service-terms" element={<ServiceTermsPage />} />
            <Route path="/programmata" element={<ProgramsPage />} />
            <Route path="/programmata/access/:token" element={<ProgramAccessPage />} />
            <Route path="/posing" element={<PosingPage />} />
            <Route path="/posing/about" element={<PosingAboutPage />} />
            <Route path="/posing/login" element={<PosingLoginPage />} />
            <Route path="/posing/signup" element={<PosingSignupPage />} />
            <Route path="/posing/auth/callback" element={<PosingOAuthCallbackPage />} />
            <Route path="/posing/forgot-password" element={<PosingForgotPasswordPage />} />
            <Route path="/posing/reset-password" element={<PosingResetPasswordPage />} />
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
