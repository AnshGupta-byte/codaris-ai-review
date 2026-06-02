import { Link, useLocation } from 'react-router-dom'
import { Code2, LayoutDashboard, Github, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axiosInstance'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path ? 'text-brand-cyan' : 'text-slate-400 hover:text-slate-200'

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      logout()
      toast.success('Signed out successfully')
    } catch {
      logout()
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-brand-navy/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center shadow-lg shadow-brand-cyan/20">
            <Code2 size={16} className="text-white" />
          </div>
          <span className="font-black text-lg tracking-tight">
            CODARIS <span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link to="/review" className={`text-sm font-medium transition-colors ${isActive('/review')}`}>
            Review Code
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full ring-2 ring-brand-purple/40" />
                <span className="font-medium text-slate-300">{user.username}</span>
              </div>
              <Link to="/dashboard" className="sm:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <LayoutDashboard size={18} />
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors" title="Sign out">
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <a
              href={`${import.meta.env.VITE_API_URL ?? ''}/api/auth/github`}
              className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
            >
              <Github size={16} />
              <span className="hidden sm:inline">Sign in with GitHub</span>
              <span className="sm:hidden">Sign in</span>
            </a>
          )}
        </div>
      </nav>
    </header>
  )
}
