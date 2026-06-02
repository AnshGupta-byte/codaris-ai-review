import type { ReviewIssue } from '@/store/reviewStore'

type Severity = 'critical' | 'warning' | 'info' | 'suggestion'

const CONFIG: Record<Severity, { label: string; badgeClass: string; lineClass: string; fixBg: string }> = {
  critical:   { label: 'Critical',   badgeClass: 'badge-critical',   lineClass: 'border-red-200 bg-red-50',    fixBg: 'bg-red-50 border-red-100'    },
  warning:    { label: 'Warning',    badgeClass: 'badge-warning',    lineClass: 'border-amber-200 bg-amber-50', fixBg: 'bg-amber-50 border-amber-100' },
  info:       { label: 'Info',       badgeClass: 'badge-info',       lineClass: 'border-sky-200 bg-sky-50',     fixBg: 'bg-sky-50 border-sky-100'     },
  suggestion: { label: 'Suggestion', badgeClass: 'badge-suggestion', lineClass: 'border-emerald-200 bg-emerald-50', fixBg: 'bg-emerald-50 border-emerald-100' },
}

interface IssueBadgeProps {
  severity: Severity
  showLabel?: boolean
}

export function IssueBadge({ severity, showLabel = true }: IssueBadgeProps) {
  const cfg = CONFIG[severity] || CONFIG.info
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
      {showLabel && cfg.label}
    </span>
  )
}

interface IssueCardProps {
  issue: ReviewIssue
  index: number
}

export function IssueCard({ issue, index }: IssueCardProps) {
  const cfg = CONFIG[issue.severity] || CONFIG.info

  return (
    <div className="border border-brand-border rounded-xl overflow-hidden bg-brand-surface">

      {/* Issue header */}
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <IssueBadge severity={issue.severity} />

          {/* Line number — prominent */}
          {issue.line && (
            <span className="font-mono text-xs font-semibold text-brand-accent bg-brand-accent-light border border-brand-accent-border px-2 py-0.5 rounded-md">
              Line {issue.line}
            </span>
          )}

          {/* Category */}
          {issue.category && (
            <span className="text-xs text-brand-muted capitalize bg-brand-surface-2 border border-brand-border px-2 py-0.5 rounded-md">
              {issue.category}
            </span>
          )}
        </div>
        <span className="text-[10px] text-brand-muted flex-shrink-0 mt-0.5">#{index + 1}</span>
      </div>

      {/* Message */}
      <div className="px-4 pb-3">
        <p className="text-sm text-brand-text leading-relaxed font-medium">{issue.message}</p>
      </div>

      {/* Suggestion */}
      {issue.suggestion && (
        <div className="mx-4 mb-3 rounded-lg border border-brand-border bg-brand-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted mb-1">Fix suggestion</p>
          <p className="text-sm text-brand-secondary leading-relaxed">{issue.suggestion}</p>
        </div>
      )}

      {/* Fix code block — if AI returned a code replacement */}
      {(issue as any).fix && (
        <div className="mx-4 mb-4 rounded-lg border border-brand-border overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-code border-b border-[#3a3631]">
            <span className="text-[10px] font-semibold text-[#9d9890] uppercase tracking-wider">Replace with</span>
          </div>
          <pre className="px-3 py-2.5 bg-[#1e1b18] text-[#e8e3dc] text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {(issue as any).fix}
          </pre>
        </div>
      )}
    </div>
  )
}
