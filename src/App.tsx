import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import { ClassesPage } from './pages/Classes'
import { SchedulePage } from './pages/Schedule'
import { PricingPage } from './pages/Pricing'
import { AboutPage } from './pages/About'
import { ContactPage } from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mathimata" element={<ClassesPage />} />
          <Route path="/programma" element={<SchedulePage />} />
          <Route path="/times" element={<PricingPage />} />
          <Route path="/sxetika" element={<AboutPage />} />
          <Route path="/epikoinonia" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
