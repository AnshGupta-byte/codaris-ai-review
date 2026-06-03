import * as vscode from 'vscode'
import { ReviewPanel } from './reviewPanel'
import { callReviewApi, ReviewResult } from './api'
import { reviewStore, StoredFix } from './reviewStore'
import { CodarisCodeLensProvider } from './codelensProvider'

// Singleton CodeLens provider so commands can trigger refresh
const codeLensProvider = new CodarisCodeLensProvider()

export function activate(context: vscode.ExtensionContext) {

  // ── Register CodeLens provider for ALL languages ────────────────
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider)
  )

  // ── Review Selected Code ────────────────────────────────────────
  const reviewSelection = vscode.commands.registerCommand('codaris.reviewSelection', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) { vscode.window.showErrorMessage('Codaris AI: No active editor.'); return }

    const selection = editor.selection
    const code = editor.document.getText(selection.isEmpty ? undefined : selection)
    const language = editor.document.languageId

    if (!code.trim()) {
      vscode.window.showWarningMessage('Codaris AI: No code selected.')
      return
    }

    await runReview(context, code, language, editor)
  })

  // ── Review Entire File ──────────────────────────────────────────
  const reviewFile = vscode.commands.registerCommand('codaris.reviewFile', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) { vscode.window.showErrorMessage('Codaris AI: No active editor.'); return }

    const code = editor.document.getText()
    const language = editor.document.languageId

    if (!code.trim()) { vscode.window.showWarningMessage('Codaris AI: File is empty.'); return }

    await runReview(context, code, language, editor)
  })

  // ── Apply a single fix ──────────────────────────────────────────
  const applyFix = vscode.commands.registerCommand('codaris.applyFix',
    async (uri: vscode.Uri, fix: StoredFix) => {
      const document = await vscode.workspace.openTextDocument(uri)
      const lineIdx = Math.max(0, fix.line - 1)

      if (lineIdx >= document.lineCount) {
        vscode.window.showWarningMessage('Codaris AI: Line not found in document.')
        return
      }

      const currentLine = document.lineAt(lineIdx).text
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? ''

      // Re-indent fix to match current line's indentation
      const fixLines = fix.fix.split('\n')
      const reindented = fixLines
        .map((l, i) => i === 0 ? indent + l.trimStart() : l)
        .join('\n')

      // Show diff-style confirmation dialog
      const choice = await vscode.window.showInformationMessage(
        `Apply fix for: "${fix.message.slice(0, 80)}"?`,
        {
          modal: true,
          detail:
            `─── Current (line ${fix.line}) ───\n${currentLine}\n\n─── Proposed fix ───\n${reindented}`,
        },
        'Apply Fix',
        'Skip'
      )

      if (choice === 'Apply Fix') {
        const lineRange = document.lineAt(lineIdx).range
        const edit = new vscode.WorkspaceEdit()
        edit.replace(uri, lineRange, reindented)
        const success = await vscode.workspace.applyEdit(edit)

        if (success) {
          reviewStore.markApplied(uri.toString(), fix.id)
          codeLensProvider.refresh()
          vscode.window.setStatusBarMessage('$(check) Codaris: Fix applied', 3000)
        } else {
          vscode.window.showErrorMessage('Codaris AI: Could not apply fix.')
        }
      } else {
        // Skip — dismiss lens
        reviewStore.markSkipped(uri.toString(), fix.id)
        codeLensProvider.refresh()
      }
    }
  )

  // ── Skip a single fix ───────────────────────────────────────────
  const skipFix = vscode.commands.registerCommand('codaris.skipFix',
    async (uri: vscode.Uri, fix: StoredFix) => {
      reviewStore.markSkipped(uri.toString(), fix.id)
      codeLensProvider.refresh()
    }
  )

  // ── Apply ALL pending fixes ─────────────────────────────────────
  const applyAllFixes = vscode.commands.registerCommand('codaris.applyAllFixes',
    async (uri: vscode.Uri) => {
      const fixes = reviewStore.getActive(uri.toString())
      if (!fixes.length) { vscode.window.showInformationMessage('No pending fixes.'); return }

      const choice = await vscode.window.showInformationMessage(
        `Apply all ${fixes.length} AI fixes?`,
        { modal: true, detail: fixes.map(f => `• Line ${f.line}: ${f.message.slice(0, 60)}`).join('\n') },
        'Apply All',
        'Review One by One',
        'Cancel'
      )

      if (choice === 'Apply All') {
        const document = await vscode.workspace.openTextDocument(uri)
        const edit = new vscode.WorkspaceEdit()
        let applied = 0

        // Sort descending by line so edits don't shift line numbers
        const sorted = [...fixes].sort((a, b) => b.line - a.line)

        for (const fix of sorted) {
          const lineIdx = Math.max(0, fix.line - 1)
          if (lineIdx >= document.lineCount) continue
          const currentLine = document.lineAt(lineIdx).text
          const indent = currentLine.match(/^(\s*)/)?.[1] ?? ''
          const fixLines = fix.fix.split('\n')
          const reindented = fixLines.map((l, i) => i === 0 ? indent + l.trimStart() : l).join('\n')
          edit.replace(uri, document.lineAt(lineIdx).range, reindented)
          reviewStore.markApplied(uri.toString(), fix.id)
          applied++
        }

        await vscode.workspace.applyEdit(edit)
        codeLensProvider.refresh()
        vscode.window.setStatusBarMessage(`$(check) Codaris: ${applied} fixes applied`, 4000)

      } else if (choice === 'Review One by One') {
        // Chain through each fix sequentially
        for (const fix of fixes) {
          await vscode.commands.executeCommand('codaris.applyFix', uri, fix)
        }
      }
    }
  )

  context.subscriptions.push(reviewSelection, reviewFile, applyFix, skipFix, applyAllFixes)
}

// ── Run a review ───────────────────────────────────────────────────────────────
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

    // Store fixes and add CodeLens to the editor
    const uri = editor.document.uri.toString()
    reviewStore.setFixes(uri, result.issues)
    codeLensProvider.refresh()

    const fixCount = reviewStore.getActive(uri).length
    if (fixCount > 0) {
      const action = await vscode.window.showInformationMessage(
        `Codaris AI found ${fixCount} auto-fixable issue${fixCount > 1 ? 's' : ''}.`,
        'Apply All Fixes',
        'Review One by One'
      )
      if (action === 'Apply All Fixes') {
        await vscode.commands.executeCommand('codaris.applyAllFixes', editor.document.uri)
      } else if (action === 'Review One by One') {
        const fixes = reviewStore.getActive(uri)
        for (const fix of fixes) {
          await vscode.commands.executeCommand('codaris.applyFix', editor.document.uri, fix)
        }
      }
    }

  } catch (err: any) {
    panel.showError(err?.message ?? 'Unknown error')
    vscode.window.showErrorMessage(`Codaris AI: ${err?.message ?? 'Review failed'}`)
  }
}

export function deactivate() {}
