import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Code2, LayoutDashboard, Github, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axiosInstance'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [showSignIn, setShowSignIn] = useState(false)
  const [remember, setRemember] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) =>
    location.pathname === path ? 'text-brand-cyan' : 'text-slate-400 hover:text-slate-200'

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    logout()
    toast.success('Signed out. See you soon! 👋')
    navigate('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSignIn(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const BASE = import.meta.env.VITE_API_URL ?? ''
  const githubUrl = `${BASE}/api/auth/github?remember=${remember ? '1' : '0'}`

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

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-7 h-7 rounded-full ring-2 ring-brand-purple/40"
                />
                <span className="font-medium text-slate-300">{user.username}</span>
              </div>
              <Link to="/dashboard" className="sm:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <LayoutDashboard size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Sign in button */}
              <button
                onClick={() => setShowSignIn(!showSignIn)}
                className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
              >
                <Github size={16} />
                <span className="hidden sm:inline">Sign in</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${showSignIn ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Sign-in dropdown card */}
              {showSignIn && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-xl border border-white/10 bg-[#0d0f1e] shadow-2xl shadow-black/60 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <Github size={17} className="text-brand-cyan" />
                    <span className="font-semibold text-white text-sm">Sign in with GitHub</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Your reviews will be saved to your account.
                  </p>

                  {/* Remember me toggle */}
                  <label className="flex items-center gap-3 cursor-pointer mb-5 select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={remember}
                      onClick={() => setRemember(!remember)}
                      className={`relative flex-shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 ${
                        remember ? 'bg-brand-cyan' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          remember ? 'translate-x-[22px]' : 'translate-x-[3px]'
                        }`}
                      />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Remember me</p>
                      <p className="text-xs text-slate-500">
                        {remember ? 'Stay signed in for 30 days' : 'Session only (7 days)'}
                      </p>
                    </div>
                  </label>

                  {/* Continue button */}
                  <a
                    href={githubUrl}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-brand-cyan to-brand-purple text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <Github size={16} />
                    Continue with GitHub
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
