import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, Github } from 'lucide-react'
import toast from 'react-hot-toast'
import CodeEditor from '@/features/editor/CodeEditor'
import ReviewPanel from '@/features/review/ReviewPanel'
import { useReviewStore } from '@/store/reviewStore'
import { useAuthStore } from '@/store/authStore'
import api from '@/api/axiosInstance'

const DEFAULT_CODE = `// Paste your code below and click "Review Code"
function fetchUserData(userId) {
  // This code has some issues — try reviewing it!
  const query = "SELECT * FROM users WHERE id = " + userId;
  var result = db.execute(query);
  
  if (result) {
    console.log("User found: " + result.password);
    return result;
  }
}
`

export default function ReviewPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const { currentReview, isReviewing, setReview, setReviewing } = useReviewStore()
  const { isAuthenticated } = useAuthStore()

  const handleReview = async () => {
    const trimmed = code.trim()
    if (!trimmed || trimmed === DEFAULT_CODE.trim()) {
      toast.error('Please paste your code first')
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
      toast.success('Review complete!')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Review failed. Check your API keys.'
      toast.error(msg)
    } finally {
      setReviewing(false)
    }
  }

  const issueLines = currentReview?.issues.map(i => i.line).filter(Boolean) as number[] || []

  return (
    <div className="flex flex-col h-screen pt-16">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-brand-navy2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-sm sm:text-base">
            Code <span className="gradient-text">Review</span>
          </h1>
          {!isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
              <AlertCircle size={11} />
              <span>Sign in to save history</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <a href="/api/auth/github" className="hidden sm:flex items-center gap-1.5 btn-ghost text-xs py-1.5 px-3">
              <Github size={13} /> Sign in
            </a>
          )}
          <button
            onClick={handleReview}
            disabled={isReviewing}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
          >
            {isReviewing ? (
              <><Loader2 size={15} className="animate-spin" /> Reviewing...</>
            ) : (
              <><Sparkles size={15} /> Review Code</>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 flex flex-col border-r border-white/[0.06] min-w-0">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            onLanguageChange={setLanguage}
            issueLines={issueLines}
          />
        </div>

        {/* Review Pane */}
        <div className="w-full sm:w-[420px] lg:w-[480px] flex flex-col bg-brand-navy2 flex-shrink-0 overflow-hidden">
          {isReviewing ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-brand-purple/30 border-t-brand-cyan animate-spin" />
                <Sparkles size={20} className="absolute inset-0 m-auto text-brand-cyan" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-300">Analyzing your code...</p>
                <p className="text-sm text-slate-500 mt-1">Gemini AI is reviewing</p>
              </div>
            </div>
          ) : currentReview ? (
            <ReviewPanel review={currentReview} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-cyan/10 to-brand-purple/10 border border-white/[0.06] flex items-center justify-center">
                <Sparkles size={28} className="text-brand-purple/60" />
              </div>
              <div>
                <p className="font-semibold text-slate-400">Ready to Review</p>
                <p className="text-sm mt-1 leading-relaxed">
                  Paste your code on the left and click<br />
                  <span className="text-brand-cyan font-medium">Review Code</span> to get AI feedback
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
