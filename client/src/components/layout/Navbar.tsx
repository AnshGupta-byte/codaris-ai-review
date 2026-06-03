import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Code2, Github, LogOut, ChevronDown, LayoutDashboard, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axiosInstance'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [showSignIn, setShowSignIn] = useState(false)
  const [remember, setRemember] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [slowWarn, setSlowWarn] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-brand-text font-semibold'
      : 'text-brand-secondary hover:text-brand-text'

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    toast.success('Signed out successfully.')
    navigate('/')
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSignIn(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => () => { if (slowTimer.current) clearTimeout(slowTimer.current) }, [])

  const BASE = import.meta.env.VITE_API_URL ?? ''
  const githubUrl = `${BASE}/api/auth/github?remember=${remember ? '1' : '0'}`

  const handleSignIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setSigningIn(true)
    setSlowWarn(false)
    // After 4s show the "server waking up" hint
    slowTimer.current = setTimeout(() => setSlowWarn(true), 4000)
    // Small delay so spinner renders before navigation
    setTimeout(() => { window.location.href = githubUrl }, 80)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-surface/95 backdrop-blur-sm border-b border-brand-border">
      <nav className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-brand-accent flex items-center justify-center">
            <Code2 size={14} className="text-white" />
          </div>
          <span className="font-semibold text-brand-text text-sm tracking-tight">
            Codaris <span className="text-brand-accent">AI</span>
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden sm:flex items-center gap-1">
          <Link to="/review" className={`text-sm px-3 py-1.5 rounded-md transition-colors ${isActive('/review')}`}>
            Review
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className={`text-sm px-3 py-1.5 rounded-md transition-colors ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Right — auth */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm text-brand-secondary hover:text-brand-text px-3 py-1.5 rounded-md hover:bg-brand-surface-2 transition-colors"
              >
                <img src={user.avatar} alt={user.username} className="w-5 h-5 rounded-full" />
                {user.username}
              </Link>
              <Link to="/dashboard" className="sm:hidden btn-ghost p-2">
                <LayoutDashboard size={16} />
              </Link>
              <button onClick={handleLogout} title="Sign out" className="btn-ghost p-2 hover:text-red-500">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowSignIn(s => !s)}
                className="btn-outline py-1.5 px-3.5 text-xs"
              >
                <Github size={14} />
                Sign in
                <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 ${showSignIn ? 'rotate-180' : ''}`} />
              </button>

              {showSignIn && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-72 card shadow-lg shadow-black/20 p-5 z-50 animate-fade-up">
                  <p className="font-semibold text-brand-text text-sm mb-0.5">Sign in</p>
                  <p className="text-xs text-brand-muted mb-4">Reviews are saved to your account.</p>

                  {/* Remember me */}
                  <label className="flex items-center gap-3 cursor-pointer mb-4 select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={remember}
                      onClick={() => setRemember(r => !r)}
                      className={`relative flex-shrink-0 w-10 h-[22px] rounded-full transition-colors duration-200 ${
                        remember ? 'bg-brand-accent' : 'bg-brand-border'
                      }`}
                    >
                      <span className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        remember ? 'translate-x-[18px]' : 'translate-x-0'
                      }`} />
                    </button>
                    <div>
                      <p className="text-sm text-brand-text font-medium leading-none mb-0.5">Remember me</p>
                      <p className="text-xs text-brand-muted">
                        {remember ? 'Stay signed in for 30 days' : 'Session only · 7 days'}
                      </p>
                    </div>
                  </label>

                  {/* GitHub sign-in button */}
                  <a
                    href={githubUrl}
                    onClick={handleSignIn}
                    className={`btn-primary w-full justify-center ${signingIn ? 'opacity-75 pointer-events-none' : ''}`}
                  >
                    {signingIn
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Github size={15} />
                    }
                    {signingIn ? 'Connecting…' : 'Continue with GitHub'}
                  </a>

                  {/* Shown after 4s if still loading — explains the delay */}
                  {signingIn && slowWarn && (
                    <p className="text-[11px] text-brand-muted text-center mt-2.5 leading-relaxed animate-fade-in">
                      ⏳ Server is waking up — takes ~15s on first visit
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
