import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import HomePage from '@/pages/HomePage'
import ReviewPage from '@/pages/ReviewPage'
import DashboardPage from '@/pages/DashboardPage'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import { useAuthStore } from '@/store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <div className="min-h-screen bg-brand-navy">
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
