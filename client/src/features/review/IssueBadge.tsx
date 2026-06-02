import type { ReviewIssue } from '@/store/reviewStore'

type Severity = 'critical' | 'warning' | 'info' | 'suggestion'

const CONFIG: Record<Severity, { label: string; className: string; icon: string }> = {
  critical:   { label: 'Critical',   className: 'badge-critical',   icon: '🔴' },
  warning:    { label: 'Warning',    className: 'badge-warning',    icon: '🟠' },
  info:       { label: 'Info',       className: 'badge-info',       icon: '🔵' },
  suggestion: { label: 'Suggestion', className: 'badge-suggestion', icon: '🟢' },
}

interface IssueBadgeProps {
  severity: Severity
  showLabel?: boolean
}

export function IssueBadge({ severity, showLabel = true }: IssueBadgeProps) {
  const cfg = CONFIG[severity] || CONFIG.info
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}>
      <span>{cfg.icon}</span>
      {showLabel && <span>{cfg.label}</span>}
    </span>
  )
}

interface IssueCardProps {
  issue: ReviewIssue
  index: number
}

export function IssueCard({ issue, index }: IssueCardProps) {
  return (
    <div className="card p-4 space-y-2 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <IssueBadge severity={issue.severity} />
          {issue.line && (
            <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded">
              Line {issue.line}
            </span>
          )}
          {issue.category && (
            <span className="text-xs text-slate-500 capitalize">{issue.category}</span>
          )}
        </div>
        <span className="text-xs text-slate-600 flex-shrink-0">#{index + 1}</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{issue.message}</p>
      {issue.suggestion && (
        <div className="bg-brand-cyan/5 border border-brand-cyan/15 rounded-lg px-3 py-2">
          <p className="text-xs text-brand-cyan/80 font-semibold mb-0.5">💡 Suggestion</p>
          <p className="text-xs text-slate-400 leading-relaxed">{issue.suggestion}</p>
        </div>
      )}
    </div>
  )
}
