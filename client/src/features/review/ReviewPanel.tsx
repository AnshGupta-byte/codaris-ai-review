import { CheckCircle, Lightbulb, Bot } from 'lucide-react'
import type { ReviewResult } from '@/store/reviewStore'
import ScoreRing from './ScoreRing'
import { IssueCard, IssueBadge } from './IssueBadge'

interface ReviewPanelProps {
  review: ReviewResult
}

export default function ReviewPanel({ review }: ReviewPanelProps) {
  const counts = {
    critical:   review.issues.filter(i => i.severity === 'critical').length,
    warning:    review.issues.filter(i => i.severity === 'warning').length,
    info:       review.issues.filter(i => i.severity === 'info').length,
    suggestion: review.issues.filter(i => i.severity === 'suggestion').length,
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-4 p-4">
      {/* Header: Score + Summary */}
      <div className="card p-5">
        <div className="flex items-center gap-5">
          <ScoreRing score={review.score} size={110} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={14} className="text-brand-cyan" />
              <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">
                AI Review · {review.aiProvider}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">{review.summary}</p>
          </div>
        </div>

        {/* Severity breakdown */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
          {(['critical','warning','info','suggestion'] as const).map(sev => (
            <div key={sev} className="text-center">
              <div className="text-lg font-bold text-white">{counts[sev]}</div>
              <IssueBadge severity={sev} />
            </div>
          ))}
        </div>
      </div>

      {/* Issues List */}
      {review.issues.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            Issues ({review.issues.length})
          </h3>
          <div className="space-y-2">
            {review.issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Positives */}
      {review.positives.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            ✅ What's Good
          </h3>
          <div className="card p-4 space-y-2">
            {review.positives.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Suggestions */}
      {review.overallSuggestions.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
            💡 Recommendations
          </h3>
          <div className="card p-4 space-y-2">
            {review.overallSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Lightbulb size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
