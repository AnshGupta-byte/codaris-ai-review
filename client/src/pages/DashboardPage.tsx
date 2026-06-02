import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BarChart3, Code2, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useReviewStore } from '@/store/reviewStore'
import { IssueBadge } from '@/features/review/IssueBadge'
import ScoreRing from '@/features/review/ScoreRing'
import api from '@/api/axiosInstance'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setHistory, reviewHistory } = useReviewStore()

  const { data, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await api.get('/review?page=1&limit=20')
      return res.data
    },
  })

  useEffect(() => {
    if (data?.data) setHistory(data.data)
  }, [data, setHistory])

  const reviews = reviewHistory
  const avgScore = reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + (r.score || 0), 0) / reviews.length) : 0
  const totalIssues = reviews.reduce((s, r) => s + (r.issues?.length || 0), 0)

  const stats = [
    { label: 'Total Reviews', value: reviews.length, icon: <Code2 size={18} className="text-brand-cyan" /> },
    { label: 'Avg Score', value: avgScore, icon: <TrendingUp size={18} className="text-brand-purple" />, suffix: '/100' },
    { label: 'Issues Found', value: totalIssues, icon: <BarChart3 size={18} className="text-brand-pink" /> },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Dashboard <span className="gradient-text">↗</span>
          </h1>
          {user && (
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, <span className="text-slate-200 font-medium">{user.username}</span>
            </p>
          )}
        </div>
        <Link to="/review" className="btn-primary flex items-center gap-2 text-sm">
          New Review <ArrowRight size={15} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="card p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{s.icon}</div>
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {s.value}<span className="text-sm text-slate-400 font-normal">{s.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review History */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Review History</h2>
        {isLoading ? (
          <div className="card p-8 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">
            <Code2 size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-slate-400">No reviews yet</p>
            <p className="text-sm mt-1">Submit your first code review to see history here</p>
            <Link to="/review" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              Review Code <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <div key={review._id || i} className="card p-4 sm:p-5 hover:border-white/15 transition-colors">
                <div className="flex items-center gap-4">
                  <ScoreRing score={review.score} size={70} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded capitalize">
                        {review.language}
                      </span>
                      {review.createdAt && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={11} />
                          {formatDate(review.createdAt)}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{review.summary}</p>
                    {review.issues?.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {(['critical','warning','info','suggestion'] as const)
                          .filter(sev => review.issues.some(i => i.severity === sev))
                          .map(sev => {
                            const count = review.issues.filter(i => i.severity === sev).length
                            return (
                              <span key={sev} className="flex items-center gap-1">
                                <IssueBadge severity={sev} showLabel={false} />
                                <span className="text-xs text-slate-500">{count}</span>
                              </span>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
