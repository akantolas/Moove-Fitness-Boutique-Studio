import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConditionalAnalytics } from './components/ConditionalAnalytics'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/Home'

// The homepage ships in the main bundle; the rest load when first visited.
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

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-moove-bg" aria-busy="true" />}>
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ConditionalAnalytics />
      <Routes>
        <Route element={<Layout />}>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
