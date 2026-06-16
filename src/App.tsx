import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import { ClassesPage } from './pages/Classes'
import { AboutPage } from './pages/About'
import { ContactPage } from './pages/Contact'
import { PosingPage } from './pages/Posing'

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mathimata" element={<ClassesPage />} />
          <Route path="/sxetika" element={<AboutPage />} />
          <Route path="/epikoinonia" element={<ContactPage />} />
          <Route path="/posing" element={<PosingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
