import * as vscode from 'vscode'
import { ReviewPanel } from './reviewPanel'
import { callReviewApi } from './api'

export function activate(context: vscode.ExtensionContext) {

  // ── Review Selected Code ────────────────────────────────────────
  const reviewSelection = vscode.commands.registerCommand('codaris.reviewSelection', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('Codaris AI: No active editor found.')
      return
    }

    const selection = editor.selection
    const code = editor.document.getText(selection.isEmpty ? undefined : selection)
    const language = editor.document.languageId

    if (!code.trim()) {
      vscode.window.showWarningMessage('Codaris AI: No code to review. Select some code first.')
      return
    }

    await runReview(context, code, language, editor)
  })

  // ── Review Entire File ──────────────────────────────────────────
  const reviewFile = vscode.commands.registerCommand('codaris.reviewFile', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('Codaris AI: No active editor found.')
      return
    }

    const code = editor.document.getText()
    const language = editor.document.languageId

    if (!code.trim()) {
      vscode.window.showWarningMessage('Codaris AI: File is empty.')
      return
    }

    await runReview(context, code, language, editor)
  })

  context.subscriptions.push(reviewSelection, reviewFile)
}

async function runReview(
  context: vscode.ExtensionContext,
  code: string,
  language: string,
  editor: vscode.TextEditor
) {
  // Open the panel immediately with a loading state
  const panel = ReviewPanel.createOrShow(context.extensionUri, editor)
  panel.showLoading()

  try {
    const apiUrl = vscode.workspace.getConfiguration('codaris').get<string>('apiUrl')
      ?? 'https://codaris-ai-review.onrender.com'

    const result = await callReviewApi(apiUrl, code, language)
    panel.showResult(result)
  } catch (err: any) {
    panel.showError(err?.message ?? 'Unknown error')
    vscode.window.showErrorMessage(`Codaris AI: ${err?.message ?? 'Review failed'}`)
  }
}

export function deactivate() {}
