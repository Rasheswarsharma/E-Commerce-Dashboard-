import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth }    from './store/AuthContext'
import { ThemeProvider, useTheme }  from './store/ThemeContext'
import { DatasetProvider }          from './store/DatasetContext'
import DashboardLayout              from './components/layout/DashboardLayout'
import { LoginPage, RegisterPage }  from './components/auth/AuthPages'
import OverviewPage                 from './pages/OverviewPage'
import SalesPage                    from './pages/SalesPage'
import { ProductsPage, CustomersPage, ProfitPage, RegionsPage, ForecastPage } from './pages/AnalyticsPages'
import UploadPage                   from './pages/UploadPage'
import ReportsPage                  from './pages/ReportsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const navigate = useNavigate()
  const { toggle } = useTheme()

  useEffect(() => {
    // Global ripple handler
    const handleRipple = (e) => {
      const btn = e.target.closest('button, .btn-primary, .btn-secondary, .btn-ghost, a')
      if (!btn) return

      if (window.getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative'
      }
      if (window.getComputedStyle(btn).overflow !== 'hidden') {
        btn.style.overflow = 'hidden'
      }

      const ripple = document.createElement('span')
      ripple.className = 'ui-ripple'

      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`

      btn.appendChild(ripple)

      setTimeout(() => ripple.remove(), 600)
    }

    // Global keyboard shortcuts handler
    const handleShortcuts = (e) => {
      // Focus search input on '/'
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault()
        const searchInput = document.querySelector('header input[type="text"]')
        if (searchInput) searchInput.focus()
      }

      // Alt combinations
      if (e.altKey) {
        const key = e.key.toLowerCase()
        if (key === 't') { e.preventDefault(); toggle() }
        else if (key === 'o') { e.preventDefault(); navigate('/') }
        else if (key === 's') { e.preventDefault(); navigate('/sales') }
        else if (key === 'p') { e.preventDefault(); navigate('/products') }
        else if (key === 'c') { e.preventDefault(); navigate('/customers') }
        else if (key === 'u') { e.preventDefault(); navigate('/upload') }
        else if (key === 'r') { e.preventDefault(); navigate('/reports') }
      }
    }

    document.addEventListener('click', handleRipple)
    document.addEventListener('keydown', handleShortcuts)

    return () => {
      document.removeEventListener('click', handleRipple)
      document.removeEventListener('keydown', handleShortcuts)
    }
  }, [navigate, toggle])

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index        element={<OverviewPage />} />
        <Route path="sales"     element={<SalesPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="profit"    element={<ProfitPage />} />
        <Route path="regions"   element={<RegionsPage />} />
        <Route path="forecast"  element={<ForecastPage />} />
        <Route path="upload"    element={<UploadPage />} />
        <Route path="reports"   element={<ReportsPage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DatasetProvider>
          <AppRoutes />
        </DatasetProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
