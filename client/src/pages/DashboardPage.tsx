import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Code2, TrendingUp, BarChart3, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useReviewStore } from '@/store/reviewStore'
import { IssueBadge } from '@/features/review/IssueBadge'
import ScoreRing from '@/features/review/ScoreRing'
import api from '@/api/axiosInstance'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
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
  const avgScore  = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + (r.score || 0), 0) / reviews.length)
    : 0
  const totalIssues = reviews.reduce((s, r) => s + (r.issues?.length || 0), 0)

  const stats = [
    { label: 'Total reviews',  value: reviews.length,       suffix: '',     icon: <Code2 size={16} /> },
    { label: 'Average score',  value: avgScore,              suffix: '/100', icon: <TrendingUp size={16} /> },
    { label: 'Issues caught',  value: totalIssues,           suffix: '',     icon: <BarChart3 size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-brand-bg pt-20 pb-16 px-5">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ──────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="heading-serif text-3xl sm:text-4xl text-brand-text">Dashboard</h1>
            {user && (
              <p className="text-sm text-brand-secondary mt-1">
                Welcome back, <span className="font-medium text-brand-text">{user.username}</span>
              </p>
            )}
          </div>
          <Link to="/review" className="btn-primary text-sm py-2">
            New review
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Stats ───────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="card p-4 sm:p-5">
              <div className="flex items-center gap-2 text-brand-muted mb-3">
                {s.icon}
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-brand-text font-serif">
                {s.value}
                <span className="text-sm font-sans font-normal text-brand-muted">{s.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Review history ───────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-brand-muted mb-4">
            Review history
          </h2>

          {isLoading ? (
            <div className="card p-10 text-center text-brand-muted">
              <div className="w-7 h-7 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading reviews…</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="card p-14 text-center">
              <Code2 size={32} className="mx-auto mb-4 text-brand-border-strong" />
              <p className="font-semibold text-brand-secondary">No reviews yet</p>
              <p className="text-sm text-brand-muted mt-1 mb-5">
                Your review history will appear here.
              </p>
              <Link to="/review" className="btn-primary inline-flex text-sm">
                Review code
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden bg-brand-surface">
              {reviews.map((review, i) => (
                <div key={review._id || i} className="flex items-center gap-4 px-5 py-4 hover:bg-brand-surface-2 transition-colors">
                  <ScoreRing score={review.score} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="lang-tag">{review.language}</span>
                      {review.createdAt && (
                        <span className="flex items-center gap-1 text-xs text-brand-muted">
                          <Clock size={10} />
                          {formatDate(review.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-brand-secondary leading-relaxed line-clamp-2">
                      {review.summary}
                    </p>
                    {review.issues?.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {(['critical','warning','info','suggestion'] as const)
                          .filter(sev => review.issues.some((iss: any) => iss.severity === sev))
                          .map(sev => {
                            const count = review.issues.filter((iss: any) => iss.severity === sev).length
                            return (
                              <span key={sev} className="flex items-center gap-1 text-xs text-brand-muted">
                                <IssueBadge severity={sev} showLabel={false} />
                                {count}
                              </span>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
