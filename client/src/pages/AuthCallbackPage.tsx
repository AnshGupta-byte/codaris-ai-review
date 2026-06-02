import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axiosInstance'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const success = params.get('success')
    const error = params.get('error')

    if (error) {
      toast.error('GitHub login failed. Please try again.')
      navigate('/')
      return
    }

    if (success === 'true') {
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data.user)
          toast.success(`Welcome, ${data.user.username}!`)
          navigate('/dashboard')
        })
        .catch(() => {
          toast.error('Failed to load user profile')
          navigate('/')
        })
    } else {
      navigate('/')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 font-medium">Completing sign in...</p>
      </div>
    </div>
  )
}
