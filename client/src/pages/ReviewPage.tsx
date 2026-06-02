import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, Github } from 'lucide-react'
import toast from 'react-hot-toast'
import CodeEditor from '@/features/editor/CodeEditor'
import ReviewPanel from '@/features/review/ReviewPanel'
import { useReviewStore } from '@/store/reviewStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axiosInstance'

const DEFAULT_CODE = `// Paste your code here and click "Review Code"
`

export default function ReviewPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const { currentReview, isReviewing, setReview, setReviewing } = useReviewStore()
  const { isAuthenticated } = useAuthStore()

  const handleReview = async () => {
    const trimmed = code.trim()
    if (!trimmed || trimmed === DEFAULT_CODE.trim()) {
      toast.error('Please paste your own code first')
      return
    }
    if (trimmed.length < 10) {
      toast.error('Code is too short to review')
      return
    }
    setReviewing(true)
    setReview(null)
    try {
      const { data } = await api.post('/review', { code: trimmed, language })
      setReview({ ...data, language })
      toast.success('Review complete')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Review failed. Please try again.')
    } finally {
      setReviewing(false)
    }
  }

  const issueLines = currentReview?.issues.map(i => i.line).filter(Boolean) as number[] || []
  const BASE = import.meta.env.VITE_API_URL ?? ''

  return (
    <div className="flex flex-col h-screen pt-14">

      {/* ── Toolbar ──────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-brand-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-brand-text">Code Review</span>
          {!isAuthenticated && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-brand-muted border border-brand-border rounded-md px-2 py-1">
              <AlertCircle size={11} />
              Sign in to save history
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <a
              href={`${BASE}/api/auth/github`}
              className="hidden sm:flex btn-outline py-1.5 px-3 text-xs"
            >
              <Github size={13} />
              Sign in
            </a>
          )}
          <button
            onClick={handleReview}
            disabled={isReviewing}
            className="btn-primary py-1.5 px-4 text-sm"
          >
            {isReviewing ? (
              <><Loader2 size={14} className="animate-spin" /> Reviewing…</>
            ) : (
              <><Sparkles size={14} /> Review Code</>
            )}
          </button>
        </div>
      </div>

      {/* ── Split pane ───────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Editor */}
        <div className="flex-1 flex flex-col border-r border-brand-border min-w-0">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            issueLines={issueLines}
          />
        </div>

        {/* Review panel */}
        <div className="w-full sm:w-[420px] lg:w-[460px] flex flex-col bg-brand-surface flex-shrink-0 overflow-hidden">
          {isReviewing ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-brand-secondary">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-brand-border border-t-brand-accent animate-spin" />
                <Sparkles size={16} className="absolute inset-0 m-auto text-brand-accent" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-brand-text">Analysing your code…</p>
                <p className="text-xs text-brand-muted mt-1">Powered by Gemini AI</p>
              </div>
            </div>
          ) : currentReview ? (
            <ReviewPanel review={currentReview} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8 text-brand-muted">
              <div className="w-12 h-12 rounded-xl border border-brand-border bg-brand-surface-2
                              flex items-center justify-center">
                <Sparkles size={22} className="text-brand-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-secondary">Ready to review</p>
                <p className="text-xs mt-1 leading-relaxed">
                  Paste your code on the left, then click{' '}
                  <span className="text-brand-accent font-medium">Review Code</span>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
