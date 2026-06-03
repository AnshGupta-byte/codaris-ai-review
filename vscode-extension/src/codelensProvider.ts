import * as vscode from 'vscode'
import { reviewStore, StoredFix } from './reviewStore'

export class CodarisCodeLensProvider implements vscode.CodeLensProvider {
  private _onChange = new vscode.EventEmitter<void>()
  readonly onDidChangeCodeLenses = this._onChange.event

  refresh() { this._onChange.fire() }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const uri = document.uri.toString()
    const fixes = reviewStore.getActive(uri)
    const lenses: vscode.CodeLens[] = []

    for (const fix of fixes) {
      const lineIdx = Math.max(0, fix.line - 1)
      // Guard: document may not have that many lines
      if (lineIdx >= document.lineCount) continue
      const range = new vscode.Range(lineIdx, 0, lineIdx, 0)

      lenses.push(new vscode.CodeLens(range, {
        title: '$(sparkle) Apply AI Fix',
        tooltip: fix.message,
        command: 'codaris.applyFix',
        arguments: [document.uri, fix],
      }))

      lenses.push(new vscode.CodeLens(range, {
        title: '$(close) Skip',
        tooltip: 'Dismiss this suggestion',
        command: 'codaris.skipFix',
        arguments: [document.uri, fix],
      }))
    }

    // Summary lens at the top of file if there are multiple fixes
    const active = reviewStore.getActive(uri)
    if (active.length > 1) {
      const topRange = new vscode.Range(0, 0, 0, 0)
      lenses.unshift(new vscode.CodeLens(topRange, {
        title: `$(robot) Codaris AI — ${active.length} fix${active.length > 1 ? 'es' : ''} available · Apply all`,
        command: 'codaris.applyAllFixes',
        arguments: [document.uri],
      }))
    }

    return lenses
  }
}
