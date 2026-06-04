import * as vscode from 'vscode'
import { ReviewPanel } from './reviewPanel'
import { callReviewApi } from './api'
import { reviewStore, StoredFix } from './reviewStore'
import { CodarisCodeLensProvider } from './codelensProvider'

const codeLensProvider = new CodarisCodeLensProvider()

export function activate(context: vscode.ExtensionContext) {

  // ── CodeLens provider ───────────────────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider)
  )

  // ── Review Selected Code ────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.reviewSelection', async () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) { vscode.window.showErrorMessage('Codaris AI: No active editor.'); return }
      const code = editor.document.getText(editor.selection.isEmpty ? undefined : editor.selection)
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

  // ── Apply Fix — called from CodeLens (uri, fix) ─────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.applyFix',
      async (uri?: vscode.Uri, fix?: StoredFix) => {
        const editor = uri
          ? await getEditorForUri(uri)
          : vscode.window.activeTextEditor
        if (!editor) return
        const uriStr = editor.document.uri.toString()
        const target = fix ?? reviewStore.getState(uriStr).fix
        if (!target) { vscode.window.showInformationMessage('No fix to apply.'); return }
        await doApplyFix(editor, target)
      }
    )
  )

  // ── Skip Fix — called from CodeLens (uri, fix) ──────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.skipFix',
      (_uri?: vscode.Uri, fix?: StoredFix) => {
        const editor = vscode.window.activeTextEditor
        const uri = _uri?.toString() ?? editor?.document.uri.toString()
        if (!uri) return
        const target = fix ?? reviewStore.getState(uri).fix
        if (!target) return
        reviewStore.markSkipped(uri, target.id)
        codeLensProvider.refresh()
        ReviewPanel.currentPanel?.updateSuggestions(reviewStore.getState(uri))
        vscode.window.setStatusBarMessage('$(close) Codaris: Fix skipped', 2000)
      }
    )
  )

  // ── Apply All Fixes ─────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand('codaris.applyAllFixes',
      async (uri?: vscode.Uri) => {
        const editor = uri
          ? await getEditorForUri(uri)
          : vscode.window.activeTextEditor
        if (!editor) return
        const uriStr = editor.document.uri.toString()
        const fixes = [...reviewStore.getActive(uriStr)].sort((a, b) => b.line - a.line)
        if (!fixes.length) { vscode.window.showInformationMessage('No pending fixes.'); return }
        for (const fix of fixes) await doApplyFix(editor, fix, true)
        vscode.window.setStatusBarMessage(`$(check) Codaris: ${fixes.length} fixes applied`, 4000)
      }
    )
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getEditorForUri(uri: vscode.Uri): Promise<vscode.TextEditor | undefined> {
  const visible = vscode.window.visibleTextEditors
    .find(e => e.document.uri.toString() === uri.toString())
  if (visible) return visible
  const doc = await vscode.workspace.openTextDocument(uri)
  return vscode.window.showTextDocument(doc, vscode.ViewColumn.One)
}

async function doApplyFix(
  editor: vscode.TextEditor,
  fix: StoredFix,
  silent = false
) {
  const doc    = editor.document
  const lineIdx = Math.max(0, fix.line - 1)
  if (lineIdx >= doc.lineCount) return

  const currentLine  = doc.lineAt(lineIdx).text
  const indent       = currentLine.match(/^(\s*)/)?.[1] ?? ''
  const reindented   = fix.fix.split('\n')
    .map((l, i) => i === 0 ? indent + l.trimStart() : l)
    .join('\n')
  const originalText = currentLine

  // Highlight the target line before applying
  if (!silent) {
    const range = new vscode.Range(lineIdx, 0, lineIdx, currentLine.length)
    editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
  }

  const edit = new vscode.WorkspaceEdit()
  edit.replace(editor.document.uri, doc.lineAt(lineIdx).range, reindented)
  const ok = await vscode.workspace.applyEdit(edit)

  if (ok) {
    const uri = editor.document.uri.toString()
    reviewStore.markApplied(uri, fix.id, lineIdx, originalText)
    codeLensProvider.refresh()
    ReviewPanel.currentPanel?.updateSuggestions(reviewStore.getState(uri))
    if (!silent) vscode.window.setStatusBarMessage('$(check) Codaris: Fix applied', 3000)
  } else {
    vscode.window.showErrorMessage('Codaris AI: Could not apply fix.')
  }
}

// ── Run a full review ─────────────────────────────────────────────────────────
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
    const uri    = editor.document.uri.toString()

    // Attach current line text so panel can show a diff
    const enriched = result.issues.map(issue => ({
      ...issue,
      currentCode: issue.line
        ? editor.document.lineAt(Math.max(0, issue.line - 1)).text.trim()
        : '',
    }))

    reviewStore.setFixes(uri, enriched as any)
    codeLensProvider.refresh()

    // Bake initial state into HTML (avoids postMessage race condition)
    const initialState = reviewStore.getState(uri)
    panel.showResult(result, initialState)

    // Handle messages from the Codaris panel buttons
    panel.onMessage = async (msg) => {
      switch ((msg as { command: string }).command) {

        case 'applyFix': {
          const st = reviewStore.getState(uri)
          if (st.fix) await doApplyFix(editor, st.fix)
          break
        }
        case 'skipFix': {
          const st = reviewStore.getState(uri)
          if (st.fix) {
            reviewStore.markSkipped(uri, st.fix.id)
            codeLensProvider.refresh()
            panel.updateSuggestions(reviewStore.getState(uri))
            vscode.window.setStatusBarMessage('$(close) Codaris: Fix skipped', 2000)
          }
          break
        }
        case 'undoFix': {
          const entry = reviewStore.popUndo(uri)
          if (!entry) { vscode.window.showInformationMessage('Nothing to undo.'); break }
          const doc = editor.document
          if (entry.lineIdx >= doc.lineCount) break
          const edit = new vscode.WorkspaceEdit()
          edit.replace(editor.document.uri, doc.lineAt(entry.lineIdx).range, entry.original)
          const ok = await vscode.workspace.applyEdit(edit)
          if (ok) {
            // Re-activate the undone fix in the store
            const all = (reviewStore as any).fixes?.get(uri) as Array<any> | undefined
            const match = all?.find((f: any) => f.applied && f.line === entry.lineIdx + 1)
            if (match) match.applied = false
            codeLensProvider.refresh()
            panel.updateSuggestions(reviewStore.getState(uri))
            vscode.window.setStatusBarMessage('$(discard) Codaris: Fix undone', 3000)
          }
          break
        }
        case 'nextFix':
          reviewStore.next(uri)
          panel.updateSuggestions(reviewStore.getState(uri))
          break
        case 'prevFix':
          reviewStore.prev(uri)
          panel.updateSuggestions(reviewStore.getState(uri))
          break
      }
    }

  } catch (err: any) {
    panel.showError(err?.message ?? 'Unknown error')
    vscode.window.showErrorMessage(`Codaris AI: ${err?.message ?? 'Review failed'}`)
  }
}

export function deactivate() {}
