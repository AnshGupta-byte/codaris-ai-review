import * as vscode from 'vscode'
import type { ReviewResult } from './api'
import type { SuggestionState } from './reviewStore'

export class ReviewPanel {
  public static currentPanel: ReviewPanel | undefined
  private readonly _panel: vscode.WebviewPanel
  private _editor: vscode.TextEditor
  private _disposables: vscode.Disposable[] = []

  // Callback for messages from the webview
  public onMessage?: (msg: Record<string, unknown>) => void

  public static createOrShow(extensionUri: vscode.Uri, editor: vscode.TextEditor): ReviewPanel {
    const column = vscode.ViewColumn.Beside
    if (ReviewPanel.currentPanel) {
      ReviewPanel.currentPanel._panel.reveal(column)
      ReviewPanel.currentPanel._editor = editor
      return ReviewPanel.currentPanel
    }
    const panel = vscode.window.createWebviewPanel(
      'codarisReview', 'Codaris AI Review', column,
      { enableScripts: true, retainContextWhenHidden: true }
    )
    ReviewPanel.currentPanel = new ReviewPanel(panel, editor)
    return ReviewPanel.currentPanel
  }

  private constructor(panel: vscode.WebviewPanel, editor: vscode.TextEditor) {
    this._panel = panel
    this._editor = editor
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)
    this._panel.webview.onDidReceiveMessage(
      (msg: Record<string, unknown>) => {
        if (msg.command === 'jumpToLine' && msg.line) {
          const lineIndex = (msg.line as number) - 1
          const range = new vscode.Range(lineIndex, 0, lineIndex, 0)
          vscode.window.showTextDocument(this._editor.document, {
            selection: range, viewColumn: vscode.ViewColumn.One,
          })
          return
        }
        // Forward all other messages to extension.ts handler
        this.onMessage?.(msg)
      },
      null, this._disposables
    )
  }

  /** Push suggestion state into the webview */
  public updateSuggestions(state: SuggestionState) {
    this._panel.webview.postMessage({ command: 'updateSuggestions', state })
  }

  public showLoading() { this._panel.webview.html = getLoadingHtml() }
  public showResult(review: ReviewResult) { this._panel.webview.html = getResultHtml(review) }
  public showError(message: string) { this._panel.webview.html = getErrorHtml(message) }

  public dispose() {
    ReviewPanel.currentPanel = undefined
    this._panel.dispose()
    this._disposables.forEach(d => d.dispose())
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function scoreColor(score: number): string {
  if (score >= 80) return '#34d399'
  if (score >= 60) return '#e07a52'
  if (score >= 40) return '#fbbf24'
  return '#f87171'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

function baseStyles(): string {
  return `<style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:var(--vscode-font-family),-apple-system,sans-serif;font-size:13px;
      color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:16px;line-height:1.5}
    h1{font-size:15px;font-weight:600;margin-bottom:4px}
    .muted{color:var(--vscode-descriptionForeground);font-size:12px}
    .badge{display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;margin-right:4px}
    .badge-critical{background:rgba(239,68,68,.18);color:#f87171}
    .badge-warning{background:rgba(245,158,11,.18);color:#fbbf24}
    .badge-info{background:rgba(56,189,248,.18);color:#7dd3fc}
    .badge-suggestion{background:rgba(52,211,153,.18);color:#6ee7b7}
    .line-tag{display:inline-block;font-family:monospace;font-size:11px;
      background:rgba(224,122,82,.15);color:#e07a52;border:1px solid rgba(224,122,82,.3);
      padding:1px 7px;border-radius:4px;cursor:pointer;margin-left:4px}
    .line-tag:hover{background:rgba(224,122,82,.28)}
    .card{background:var(--vscode-editor-inactiveSelectionBackground);
      border:1px solid var(--vscode-panel-border);border-radius:8px;padding:12px;margin-bottom:10px}
    .card-title{font-weight:600;font-size:11px;margin-bottom:8px;
      color:var(--vscode-descriptionForeground);text-transform:uppercase;letter-spacing:.05em}
    .issue{margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--vscode-panel-border)}
    .issue:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
    .issue-msg{margin:6px 0 4px;font-size:13px}
    .suggestion-text{font-size:12px;color:var(--vscode-descriptionForeground);margin:4px 0}
    pre{background:var(--vscode-textBlockQuote-background);border:1px solid var(--vscode-panel-border);
      border-radius:6px;padding:10px;margin-top:6px;font-family:var(--vscode-editor-font-family),monospace;
      font-size:12px;overflow-x:auto;white-space:pre-wrap;color:var(--vscode-foreground)}
    .positive,.recommendation{display:flex;gap:8px;margin-bottom:6px;font-size:13px}
    .positive{color:#6ee7b7}
    .score-row{display:flex;align-items:center;gap:16px;margin-bottom:14px}
    .score-circle{width:64px;height:64px;border-radius:50%;flex-shrink:0;display:flex;
      align-items:center;justify-content:center;font-size:20px;font-weight:700;border:3px solid}
    hr{border:none;border-top:1px solid var(--vscode-panel-border);margin:14px 0}
    .error-box{color:#f87171;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);
      border-radius:8px;padding:14px}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spinner{width:28px;height:28px;border:3px solid var(--vscode-panel-border);border-top-color:#e07a52;
      border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
    .center{text-align:center;padding:40px 0}

    /* ── Suggestion Navigator ── */
    #suggestion-panel{margin-top:4px}
    .sug-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
    .sug-title{font-weight:700;font-size:13px;color:#e07a52}
    .sug-counter{font-size:12px;font-weight:600;
      background:rgba(224,122,82,.15);color:#e07a52;
      border:1px solid rgba(224,122,82,.3);padding:2px 10px;border-radius:999px}
    .sug-body{background:var(--vscode-editor-inactiveSelectionBackground);
      border:1px solid var(--vscode-panel-border);border-radius:8px;padding:14px;margin-bottom:10px}
    .sug-meta{margin-bottom:8px}
    .sug-message{font-size:13px;font-weight:500;margin:6px 0 10px}
    .code-block-label{font-size:11px;font-weight:600;text-transform:uppercase;
      letter-spacing:.05em;color:var(--vscode-descriptionForeground);margin-bottom:4px}
    .code-current{border-left:3px solid #f87171}
    .code-fix{border-left:3px solid #34d399}
    .sug-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    button{cursor:pointer;border:none;border-radius:6px;font-size:12px;font-weight:600;
      padding:6px 14px;transition:opacity .15s}
    button:hover{opacity:.85}
    button:disabled{opacity:.4;cursor:not-allowed}
    .btn-apply{background:#e07a52;color:#fff}
    .btn-skip{background:var(--vscode-button-secondaryBackground,#444);
      color:var(--vscode-button-secondaryForeground,#eee)}
    .btn-nav{background:transparent;border:1px solid var(--vscode-panel-border);
      color:var(--vscode-foreground);padding:6px 10px}
    .btn-undo{background:rgba(59,130,246,.18);color:#7dd3fc;margin-top:4px;width:100%}
    .sug-empty{text-align:center;padding:24px;color:var(--vscode-descriptionForeground)}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .sug-body{animation:fadeIn .18s ease}
  </style>`
}

function getLoadingHtml(): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles()}</head><body>
    <div class="center">
      <div class="spinner"></div>
      <h1>Reviewing your code…</h1>
      <p class="muted" style="margin-top:8px">Powered by Gemini 2.5 Flash</p>
      <p class="muted" style="margin-top:4px;font-size:11px">May take up to 20s on first run</p>
    </div>
  </body></html>`
}

function getErrorHtml(message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles()}</head><body>
    <div class="error-box"><strong>Review failed</strong><br/>
      <span style="font-size:12px;margin-top:4px;display:block">${escHtml(message)}</span>
    </div>
  </body></html>`
}

function getResultHtml(review: ReviewResult): string {
  const color = scoreColor(review.score)
  const label = scoreLabel(review.score)

  const issuesHtml = review.issues.map(issue => `
    <div class="issue">
      <div>
        <span class="badge badge-${issue.severity}">${issue.severity}</span>
        ${issue.category ? `<span class="muted">${escHtml(issue.category)}</span>` : ''}
        ${issue.line ? `<span class="line-tag" onclick="jumpToLine(${issue.line})">Line ${issue.line}</span>` : ''}
      </div>
      <p class="issue-msg">${escHtml(issue.message)}</p>
      ${issue.suggestion ? `<p class="suggestion-text">💡 ${escHtml(issue.suggestion)}</p>` : ''}
    </div>`).join('')

  const positivesHtml = review.positives.map(p =>
    `<div class="positive"><span>✅</span><span>${escHtml(p)}</span></div>`).join('')

  const suggestionsHtml = review.overallSuggestions.map(s =>
    `<div class="recommendation"><span>💡</span><span>${escHtml(s)}</span></div>`).join('')

  return `<!DOCTYPE html>
  <html><head><meta charset="UTF-8">${baseStyles()}</head>
  <body>
  <script>
    const vscode = acquireVsCodeApi();
    function jumpToLine(line){ vscode.postMessage({command:'jumpToLine',line}) }
    function send(cmd){ vscode.postMessage({command:cmd}) }

    // Listen for suggestion state updates from extension
    window.addEventListener('message', e => {
      const msg = e.data
      if(msg.command === 'updateSuggestions') renderSuggestions(msg.state)
    })

    function renderSuggestions(state){
      const panel = document.getElementById('suggestion-panel')
      if(!panel) return

      if(!state || state.total === 0){
        panel.innerHTML = '<div class="sug-empty">✅ All suggestions reviewed</div>'
        return
      }

      const fix = state.fix
      if(!fix){ panel.innerHTML = ''; return }

      const badgeClass = 'badge-' + (fix.severity || 'info')

      panel.innerHTML = \`
        <div class="sug-header">
          <span class="sug-title">⚡ Fix Suggestions</span>
          <span class="sug-counter">\${state.currentPos} of \${state.total}</span>
        </div>
        <div class="sug-body">
          <div class="sug-meta">
            <span class="badge \${badgeClass}">\${fix.severity}</span>
            <span class="line-tag" onclick="jumpToLine(\${fix.line})">Line \${fix.line}</span>
          </div>
          <p class="sug-message">\${escapeHtml(fix.message)}</p>
          <div class="code-block-label">Current code</div>
          <pre class="code-current">\${escapeHtml(fix.currentCode || '(current line)')}</pre>
          <div class="code-block-label" style="margin-top:10px">Suggested fix</div>
          <pre class="code-fix">\${escapeHtml(fix.fix)}</pre>
        </div>
        <div class="sug-actions">
          <button class="btn-nav" onclick="send('prevFix')" \${state.currentPos <= 1 ? 'disabled' : ''}>← Prev</button>
          <button class="btn-skip" onclick="send('skipFix')">Skip</button>
          <button class="btn-apply" onclick="send('applyFix')">✓ Apply Fix</button>
          <button class="btn-nav" onclick="send('nextFix')" \${state.currentPos >= state.total ? 'disabled' : ''}>Next →</button>
        </div>
        \${state.hasUndo ? '<button class="btn-undo" onclick="send(\'undoFix\')">↩ Undo Last Fix</button>' : ''}
      \`
    }

    function escapeHtml(s){
      return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }
  </script>

  <!-- Score -->
  <div class="score-row">
    <div class="score-circle" style="color:${color};border-color:${color}">${review.score}</div>
    <div>
      <h1>Code Review Complete</h1>
      <div style="color:${color};font-weight:600;font-size:13px">${label}</div>
      <div class="muted">via ${escHtml(review.aiProvider)}</div>
    </div>
  </div>
  <p style="margin-bottom:14px">${escHtml(review.summary)}</p>
  <hr/>

  ${review.issues.length > 0 ? `
    <div class="card">
      <div class="card-title">Issues · ${review.issues.length} found</div>
      ${issuesHtml}
    </div>` : ''}

  ${review.positives.length > 0 ? `
    <div class="card">
      <div class="card-title">What's good</div>
      ${positivesHtml}
    </div>` : ''}

  ${review.overallSuggestions.length > 0 ? `
    <div class="card">
      <div class="card-title">Recommendations</div>
      ${suggestionsHtml}
    </div>` : ''}

  <!-- Suggestion Navigator — populated by JS after extension sends state -->
  <div id="suggestion-panel"></div>

  <p class="muted" style="text-align:center;margin-top:16px;font-size:11px">
    <a href="https://codaris-ai-review.vercel.app" style="color:#e07a52">codaris-ai-review.vercel.app</a>
  </p>
  </body></html>`
}
