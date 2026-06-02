import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import HomePage from '@/pages/HomePage'
import ReviewPage from '@/pages/ReviewPage'
import DashboardPage from '@/pages/DashboardPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axiosInstance'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  const { setUser, logout } = useAuthStore()

  // Validate session once on app load — only update state if it actually changes
  useEffect(() => {
    let cancelled = false
    api.get('/auth/me')
      .then(({ data }) => { if (!cancelled) setUser(data.user) })
      .catch(() => {
        // Only clear state if we previously thought user was logged in
        if (!cancelled && useAuthStore.getState().isAuthenticated) logout()
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
