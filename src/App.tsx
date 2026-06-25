import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConditionalAnalytics } from './components/ConditionalAnalytics'
import { Layout } from './components/Layout'
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

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
