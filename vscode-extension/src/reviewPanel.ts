import * as vscode from 'vscode'
import type { ReviewResult } from './api'

export class ReviewPanel {
  public static currentPanel: ReviewPanel | undefined
  private readonly _panel: vscode.WebviewPanel
  private readonly _editor: vscode.TextEditor
  private _disposables: vscode.Disposable[] = []

  public static createOrShow(extensionUri: vscode.Uri, editor: vscode.TextEditor): ReviewPanel {
    const column = vscode.ViewColumn.Beside

    if (ReviewPanel.currentPanel) {
      ReviewPanel.currentPanel._panel.reveal(column)
      ReviewPanel.currentPanel._updateEditor(editor)
      return ReviewPanel.currentPanel
    }

    const panel = vscode.window.createWebviewPanel(
      'codarisReview',
      'Codaris AI Review',
      column,
      { enableScripts: true, retainContextWhenHidden: true }
    )

    ReviewPanel.currentPanel = new ReviewPanel(panel, editor)
    return ReviewPanel.currentPanel
  }

  private constructor(panel: vscode.WebviewPanel, editor: vscode.TextEditor) {
    this._panel = panel
    this._editor = editor

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // Handle messages from webview (e.g. "jump to line")
    this._panel.webview.onDidReceiveMessage(
      (msg: { command: string; line: number }) => {
        if (msg.command === 'jumpToLine' && msg.line) {
          const lineIndex = msg.line - 1
          const range = new vscode.Range(lineIndex, 0, lineIndex, 0)
          vscode.window.showTextDocument(this._editor.document, {
            selection: range,
            viewColumn: vscode.ViewColumn.One,
          })
        }
      },
      null,
      this._disposables
    )
  }

  private _updateEditor(editor: vscode.TextEditor) {
    (this as any)._editor = editor
  }

  public showLoading() {
    this._panel.webview.html = getLoadingHtml()
  }

  public showResult(review: ReviewResult) {
    this._panel.webview.html = getResultHtml(review)
  }

  public showError(message: string) {
    this._panel.webview.html = getErrorHtml(message)
  }

  public dispose() {
    ReviewPanel.currentPanel = undefined
    this._panel.dispose()
    this._disposables.forEach(d => d.dispose())
  }
}

// ── HTML templates ──────────────────────────────────────────────────

function baseStyles(): string {
  return `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: var(--vscode-font-family), -apple-system, sans-serif;
        font-size: 13px;
        color: var(--vscode-foreground);
        background: var(--vscode-editor-background);
        padding: 16px;
        line-height: 1.5;
      }
      h1 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
      .muted { color: var(--vscode-descriptionForeground); font-size: 12px; }
      .badge {
        display: inline-block; font-size: 11px; font-weight: 600;
        padding: 2px 8px; border-radius: 999px; margin-right: 4px;
      }
      .badge-critical   { background: rgba(239,68,68,0.18);  color: #f87171; }
      .badge-warning    { background: rgba(245,158,11,0.18); color: #fbbf24; }
      .badge-info       { background: rgba(56,189,248,0.18); color: #7dd3fc; }
      .badge-suggestion { background: rgba(52,211,153,0.18); color: #6ee7b7; }
      .line-tag {
        display: inline-block; font-family: monospace; font-size: 11px;
        background: rgba(224,122,82,0.15); color: #e07a52;
        border: 1px solid rgba(224,122,82,0.3);
        padding: 1px 7px; border-radius: 4px; cursor: pointer;
        margin-left: 4px;
      }
      .line-tag:hover { background: rgba(224,122,82,0.28); }
      .card {
        background: var(--vscode-editor-inactiveSelectionBackground);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 8px; padding: 12px; margin-bottom: 10px;
      }
      .card-title { font-weight: 600; font-size: 12px; margin-bottom: 8px; color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: 0.05em; }
      .issue { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--vscode-panel-border); }
      .issue:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .issue-msg { margin: 6px 0 4px; font-size: 13px; }
      .suggestion { font-size: 12px; color: var(--vscode-descriptionForeground); margin: 4px 0; }
      pre {
        background: var(--vscode-textBlockQuote-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px; padding: 10px; margin-top: 6px;
        font-family: var(--vscode-editor-font-family), monospace;
        font-size: 12px; overflow-x: auto; white-space: pre-wrap;
        color: var(--vscode-foreground);
      }
      .positive { display: flex; gap: 8px; margin-bottom: 6px; color: #6ee7b7; font-size: 13px; }
      .recommendation { display: flex; gap: 8px; margin-bottom: 6px; font-size: 13px; }
      .score-row { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
      .score-circle {
        width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; font-weight: 700;
        border: 3px solid;
      }
      .divider { border: none; border-top: 1px solid var(--vscode-panel-border); margin: 14px 0; }
      .provider { font-size: 11px; color: var(--vscode-descriptionForeground); margin-top: 4px; }
      .error-box { color: #f87171; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 14px; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .spinner { width: 28px; height: 28px; border: 3px solid var(--vscode-panel-border); border-top-color: #e07a52; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
      .center { text-align: center; padding: 40px 0; }
    </style>
  `
}

function getLoadingHtml(): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles()}</head><body>
    <div class="center">
      <div class="spinner"></div>
      <h1>Reviewing your code…</h1>
      <p class="muted" style="margin-top:8px;">Powered by Gemini 2.5 Flash</p>
      <p class="muted" style="margin-top:4px;font-size:11px;">May take up to 20s on first run</p>
    </div>
  </body></html>`
}

function getErrorHtml(message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${baseStyles()}</head><body>
    <div class="error-box">
      <strong>Review failed</strong><br/>
      <span style="font-size:12px;margin-top:4px;display:block;">${escHtml(message)}</span>
    </div>
  </body></html>`
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

function escHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
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
      ${issue.suggestion ? `<p class="suggestion">💡 ${escHtml(issue.suggestion)}</p>` : ''}
      ${issue.fix ? `<pre>${escHtml(issue.fix)}</pre>` : ''}
    </div>
  `).join('')

  const positivesHtml = review.positives.map(p => `
    <div class="positive"><span>✅</span><span>${escHtml(p)}</span></div>
  `).join('')

  const suggestionsHtml = review.overallSuggestions.map(s => `
    <div class="recommendation"><span>💡</span><span>${escHtml(s)}</span></div>
  `).join('')

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    ${baseStyles()}
  </head>
  <body>
    <script>
      const vscode = acquireVsCodeApi();
      function jumpToLine(line) {
        vscode.postMessage({ command: 'jumpToLine', line });
      }
    </script>

    <!-- Score -->
    <div class="score-row">
      <div class="score-circle" style="color:${color};border-color:${color};">
        ${review.score}
      </div>
      <div>
        <h1>Code Review Complete</h1>
        <div class="muted" style="color:${color};font-weight:600;">${label}</div>
        <div class="provider">via ${escHtml(review.aiProvider)}</div>
      </div>
    </div>

    <p style="margin-bottom:14px;">${escHtml(review.summary)}</p>
    <hr class="divider"/>

    <!-- Issues -->
    ${review.issues.length > 0 ? `
      <div class="card">
        <div class="card-title">Issues · ${review.issues.length} found</div>
        ${issuesHtml}
      </div>
    ` : ''}

    <!-- Positives -->
    ${review.positives.length > 0 ? `
      <div class="card">
        <div class="card-title">What's good</div>
        ${positivesHtml}
      </div>
    ` : ''}

    <!-- Recommendations -->
    ${review.overallSuggestions.length > 0 ? `
      <div class="card">
        <div class="card-title">Recommendations</div>
        ${suggestionsHtml}
      </div>
    ` : ''}

    <p class="muted" style="text-align:center;margin-top:12px;">
      <a href="https://codaris-ai-review.vercel.app" style="color:#e07a52;">codaris-ai-review.vercel.app</a>
    </p>
  </body>
  </html>`
}
