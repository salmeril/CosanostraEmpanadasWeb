import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import CareersPage from './pages/CareersPage.jsx'
import './styles.css'
import { initAnalytics } from './lib/analytics.js'

initAnalytics()

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const page = normalizedPath === '/trabaja-con-nosotros' ? <CareersPage /> : <App />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {page}
  </StrictMode>,
)
