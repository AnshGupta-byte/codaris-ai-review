import * as vscode from 'vscode'
import { ReviewPanel } from './reviewPanel'
import { callReviewApi, ReviewResult } from './api'
import { reviewStore } from './reviewStore'
import { CodarisCodeLensProvider } from './codelensProvider'

const codeLensProvider = new CodarisCodeLensProvider()

export function activate(context: vscode.ExtensionContext) {

  // Register CodeLens for all files
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider)
  )

  // ── Review Selected Code ────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.reviewSelection', async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) { vscode.window.showErrorMessage('Codaris AI: No active editor.'); return }
      const code = editor.document.getText(
        editor.selection.isEmpty ? undefined : editor.selection
      )
      if (!code.trim()) { vscode.window.showWarningMessage('Codaris AI: No code selected.'); return }
      await runReview(context, code, editor.document.languageId, editor)
    })
  )

  // ── Review Entire File ──────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.reviewFile', async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) { vscode.window.showErrorMessage('Codaris AI: No active editor.'); return }
      const code = editor.document.getText()
      if (!code.trim()) { vscode.window.showWarningMessage('Codaris AI: File is empty.'); return }
      await runReview(context, code, editor.document.languageId, editor)
    })
  )

  // ── Apply fix (CodeLens button — kept for backward compat) ──────
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.applyFix', () => { /* handled via panel */ })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.skipFix', () => { /* handled via panel */ })
  )
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.applyAllFixes', () => { /* handled via panel */ })
  )
}

// ── Run a review ────────────────────────────────────────────────────────────
async function runReview(
  context: vscode.ExtensionContext,
  code: string,
  language: string,
  editor: vscode.TextEditor
) {
  const panel = ReviewPanel.createOrShow(context.extensionUri, editor)
  panel.showLoading()

  try {
    const apiUrl = vscode.workspace.getConfiguration('codaris').get<string>('apiUrl')
      ?? 'https://codaris-api.onrender.com'

    const result = await callReviewApi(apiUrl, code, language)
    panel.showResult(result)

    const uri = editor.document.uri.toString()

    // Enrich issues with current line text so panel can show diff
    const enriched = result.issues.map(issue => ({
      ...issue,
      currentCode: issue.line
        ? editor.document.lineAt(Math.max(0, issue.line - 1)).text.trim()
        : '',
    }))

    reviewStore.setFixes(uri, enriched as any)
    codeLensProvider.refresh()

    // Push initial state to panel
    pushState(panel, uri)

    // Wire panel messages → commands
    panel.onMessage = async (msg) => {
      const m = msg as { command: string }
      switch (m.command) {
        case 'applyFix':   await handleApply(panel, editor); break
        case 'skipFix':    handleSkip(panel, editor); break
        case 'undoFix':    await handleUndo(panel, editor); break
        case 'nextFix':    reviewStore.next(uri); pushState(panel, uri); codeLensProvider.refresh(); break
        case 'prevFix':    reviewStore.prev(uri); pushState(panel, uri); codeLensProvider.refresh(); break
      }
    }

  } catch (err: any) {
    panel.showError(err?.message ?? 'Unknown error')
    vscode.window.showErrorMessage(`Codaris AI: ${err?.message ?? 'Review failed'}`)
  }
}

// ── Push current suggestion state to the panel ──────────────────────────────
function pushState(panel: ReviewPanel, uri: string) {
  panel.updateSuggestions(reviewStore.getState(uri))
}

// ── Apply current fix ────────────────────────────────────────────────────────
async function handleApply(panel: ReviewPanel, editor: vscode.TextEditor) {
  const uri   = editor.document.uri.toString()
  const state = reviewStore.getState(uri)
  const fix   = state.fix
  if (!fix) return

  const lineIdx = Math.max(0, fix.line - 1)
  const doc     = editor.document
  if (lineIdx >= doc.lineCount) return

  const currentLine   = doc.lineAt(lineIdx).text
  const indent        = currentLine.match(/^(\s*)/)?.[1] ?? ''
  const fixLines      = fix.fix.split('\n')
  const reindented    = fixLines.map((l, i) => i === 0 ? indent + l.trimStart() : l).join('\n')
  const originalText  = currentLine

  const edit = new vscode.WorkspaceEdit()
  edit.replace(editor.document.uri, doc.lineAt(lineIdx).range, reindented)
  const ok = await vscode.workspace.applyEdit(edit)

  if (ok) {
    reviewStore.markApplied(uri, fix.id, lineIdx, originalText)
    codeLensProvider.refresh()
    vscode.window.setStatusBarMessage('$(check) Codaris: Fix applied', 3000)
  } else {
    vscode.window.showErrorMessage('Codaris AI: Could not apply fix.')
  }

  pushState(panel, uri)
}

// ── Skip current fix ─────────────────────────────────────────────────────────
function handleSkip(panel: ReviewPanel, editor: vscode.TextEditor) {
  const uri   = editor.document.uri.toString()
  const state = reviewStore.getState(uri)
  const fix   = state.fix
  if (fix) {
    reviewStore.markSkipped(uri, fix.id)
    codeLensProvider.refresh()
  }
  pushState(panel, uri)
}

// ── Undo last applied fix ────────────────────────────────────────────────────
async function handleUndo(panel: ReviewPanel, editor: vscode.TextEditor) {
  const uri   = editor.document.uri.toString()
  const entry = reviewStore.popUndo(uri)
  if (!entry) { vscode.window.showInformationMessage('Nothing to undo.'); return }

  const doc = editor.document
  if (entry.lineIdx >= doc.lineCount) return

  const edit = new vscode.WorkspaceEdit()
  edit.replace(editor.document.uri, doc.lineAt(entry.lineIdx).range, entry.original)
  const ok = await vscode.workspace.applyEdit(edit)

  if (ok) {
    // Re-activate that fix in the store by clearing its applied flag
    const fixes = (reviewStore as any).fixes?.get(uri) as Array<any> | undefined
    if (fixes) {
      const match = fixes.find((f: any) => f.applied && f.line === entry.lineIdx + 1)
      if (match) { match.applied = false }
    }
    codeLensProvider.refresh()
    vscode.window.setStatusBarMessage('$(discard) Codaris: Fix undone', 3000)
  }

  pushState(panel, uri)
}

export function deactivate() {}
