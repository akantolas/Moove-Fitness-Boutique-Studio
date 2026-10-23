import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConditionalAnalytics } from './components/ConditionalAnalytics'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { PosingAuthProvider } from './contexts/PosingAuthContext'
import { PosingBookingStickyProvider } from './contexts/PosingBookingStickyContext'
import { HomePage } from './pages/Home'
import { PosingPage } from './pages/Posing'
import { PosingForgotPasswordPage, PosingLoginPage, PosingResetPasswordPage, PosingSignupPage } from './pages/PosingAuth'
import { PosingOAuthCallbackPage, PosingOAuthReturnGuard } from './pages/PosingOAuthCallback'

// Landing and sign-in pages ship in the main bundle; the rest load when first visited.
function lazyPage<K extends string>(
  load: () => Promise<Record<K, ComponentType>>,
  name: K,
) {
  return lazy(() => load().then((module) => ({ default: module[name] })))
}

const ClassesPage = lazyPage(() => import('./pages/Classes'), 'ClassesPage')
const AboutPage = lazyPage(() => import('./pages/About'), 'AboutPage')
const ContactPage = lazyPage(() => import('./pages/Contact'), 'ContactPage')
const CookiesPage = lazyPage(() => import('./pages/Cookies'), 'CookiesPage')
const PrivacyPage = lazyPage(() => import('./pages/Privacy'), 'PrivacyPage')
const ServiceTermsPage = lazyPage(() => import('./pages/ServiceTerms'), 'ServiceTermsPage')
const TermsOfUsePage = lazyPage(() => import('./pages/TermsOfUse'), 'TermsOfUsePage')
const ProgramsUnderProcessing = lazyPage(
  () => import('./pages/ProgramsUnderProcessing'),
  'ProgramsUnderProcessing',
)
const ProgramAccessPage = lazyPage(() => import('./pages/ProgramAccess'), 'ProgramAccessPage')
const PosingAboutPage = lazyPage(() => import('./pages/PosingAbout'), 'PosingAboutPage')
const PosingAccountPage = lazyPage(() => import('./pages/PosingAccount'), 'PosingAccountPage')
const PosingAccountSettingsPage = lazyPage(
  () => import('./pages/PosingAccountSettings'),
  'PosingAccountSettingsPage',
)
const PosingAdminPage = lazyPage(() => import('./pages/PosingAdmin'), 'PosingAdminPage')

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-[#08080c]" aria-busy="true" />}>
      {children}
    </Suspense>
  )
}

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
            <Route path="/mathimata" element={<Page><ClassesPage /></Page>} />
            <Route path="/sxetika" element={<Page><AboutPage /></Page>} />
            <Route path="/epikoinonia" element={<Page><ContactPage /></Page>} />
            <Route path="/cookies" element={<Page><CookiesPage /></Page>} />
            <Route path="/privacy" element={<Page><PrivacyPage /></Page>} />
            <Route path="/terms" element={<Page><TermsOfUsePage /></Page>} />
            <Route path="/service-terms" element={<Page><ServiceTermsPage /></Page>} />
            <Route path="/programmata" element={<Page><ProgramsUnderProcessing /></Page>} />
            <Route path="/programmata/access/:token" element={<Page><ProgramAccessPage /></Page>} />
            <Route path="/posing" element={<PosingPage />} />
            <Route path="/posing/about" element={<Page><PosingAboutPage /></Page>} />
            <Route path="/posing/login" element={<PosingLoginPage />} />
            <Route path="/posing/signup" element={<PosingSignupPage />} />
            <Route path="/posing/auth/callback" element={<PosingOAuthCallbackPage />} />
            <Route path="/posing/forgot-password" element={<PosingForgotPasswordPage />} />
            <Route path="/posing/reset-password" element={<PosingResetPasswordPage />} />
            <Route path="/posing/account" element={<Page><PosingAccountPage /></Page>} />
            <Route path="/posing/account/settings" element={<Page><PosingAccountSettingsPage /></Page>} />
            <Route path="/posing/admin" element={<Page><PosingAdminPage /></Page>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PosingAuthProvider>
    </BrowserRouter>
  )
}
