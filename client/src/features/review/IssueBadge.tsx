import type { ReviewIssue } from '@/store/reviewStore'

type Severity = 'critical' | 'warning' | 'info' | 'suggestion'

const CONFIG: Record<Severity, { label: string; badgeClass: string }> = {
  critical:   { label: 'Critical',   badgeClass: 'badge-critical'   },
  warning:    { label: 'Warning',    badgeClass: 'badge-warning'    },
  info:       { label: 'Info',       badgeClass: 'badge-info'       },
  suggestion: { label: 'Suggestion', badgeClass: 'badge-suggestion' },
}

export function IssueBadge({ severity, showLabel = true }: { severity: Severity; showLabel?: boolean }) {
  const cfg = CONFIG[severity] || CONFIG.info
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
      {showLabel && cfg.label}
    </span>
  )
}

export function IssueCard({ issue, index }: { issue: ReviewIssue; index: number }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface overflow-hidden">

      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <IssueBadge severity={issue.severity} />
          {issue.line && (
            <span className="font-mono text-xs font-semibold text-brand-accent bg-brand-accent-light border border-brand-accent-border px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(224,122,82,0.12)', borderColor: 'rgba(224,122,82,0.25)' }}>
              Line {issue.line}
            </span>
          )}
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
        <p className="text-sm text-brand-text leading-relaxed">{issue.message}</p>
      </div>

      {/* Suggestion */}
      {issue.suggestion && (
        <div className="mx-4 mb-3 rounded-lg border border-brand-border bg-brand-surface-2 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted mb-1">Fix suggestion</p>
          <p className="text-sm text-brand-secondary leading-relaxed">{issue.suggestion}</p>
        </div>
      )}

      {/* Fix code block */}
      {(issue as any).fix && (
        <div className="mx-4 mb-4 rounded-lg border border-brand-border overflow-hidden">
          <div className="flex items-center px-3 py-1.5 bg-brand-surface-2 border-b border-brand-border">
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">Replace with</span>
          </div>
          <pre className="px-3 py-2.5 bg-brand-code text-brand-secondary text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {(issue as any).fix}
          </pre>
        </div>
      )}
    </div>
  )
}
