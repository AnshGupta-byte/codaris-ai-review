import { CheckCircle, Lightbulb, Sparkles } from 'lucide-react'
import type { ReviewResult } from '@/store/reviewStore'
import ScoreRing from './ScoreRing'
import { IssueCard, IssueBadge } from './IssueBadge'

export default function ReviewPanel({ review }: { review: ReviewResult }) {
  const counts = {
    critical:   review.issues.filter(i => i.severity === 'critical').length,
    warning:    review.issues.filter(i => i.severity === 'warning').length,
    info:       review.issues.filter(i => i.severity === 'info').length,
    suggestion: review.issues.filter(i => i.severity === 'suggestion').length,
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-brand-surface">

      {/* ── Score header ─────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-brand-border">
        <div className="flex items-center gap-4">
          <ScoreRing score={review.score} size={90} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-brand-accent" />
              <span className="text-xs font-semibold text-brand-accent uppercase tracking-wider">
                AI Review
              </span>
              <span className="text-xs text-brand-muted">· {review.aiProvider}</span>
            </div>
            <p className="text-sm text-brand-text leading-relaxed">{review.summary}</p>
          </div>
        </div>

        {/* Severity summary row */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-brand-border">
          {(['critical','warning','info','suggestion'] as const).map(sev => (
            <div key={sev} className="text-center">
              <div className="text-lg font-bold text-brand-text">{counts[sev]}</div>
              <IssueBadge severity={sev} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Issues list ──────────────────────────── */}
      {review.issues.length > 0 && (
        <div className="px-4 py-4 border-b border-brand-border">
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-3">
            Issues · {review.issues.length} found
          </h3>
          <div className="space-y-3">
            {review.issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── What's good ──────────────────────────── */}
      {review.positives.length > 0 && (
        <div className="px-4 py-4 border-b border-brand-border">
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-3">
            What's good
          </h3>
          <div className="space-y-2">
            {review.positives.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-brand-text leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ──────────────────────── */}
      {review.overallSuggestions.length > 0 && (
        <div className="px-4 py-4">
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-widest mb-3">
            Recommendations
          </h3>
          <div className="space-y-2">
            {review.overallSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Lightbulb size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-brand-text leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
