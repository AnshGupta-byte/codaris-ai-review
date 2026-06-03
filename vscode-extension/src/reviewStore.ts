import { ReviewIssue } from './api'

export interface StoredFix {
  id: string
  line: number
  severity: string
  message: string
  fix: string
  applied: boolean
  skipped: boolean
}

export interface SuggestionState {
  fix: StoredFix | undefined
  currentPos: number   // 1-based display index
  total: number        // remaining (not applied, not skipped)
  hasUndo: boolean
}

class ReviewStore {
  private fixes: Map<string, StoredFix[]> = new Map()
  private currentIdx: Map<string, number> = new Map()  // index into active array
  private undoStack: Map<string, Array<{ uri: string; lineIdx: number; original: string }>> = new Map()

  setFixes(uri: string, issues: ReviewIssue[]) {
    const fixes: StoredFix[] = issues
      .filter(i => i.fix && i.line)
      .map((i, idx) => ({
        id:       `${uri}:${idx}`,
        line:     i.line!,
        severity: i.severity,
        message:  i.message,
        fix:      i.fix!,
        applied:  false,
        skipped:  false,
      }))
    this.fixes.set(uri, fixes)
    this.currentIdx.set(uri, 0)
    this.undoStack.set(uri, [])
  }

  getActive(uri: string): StoredFix[] {
    return this.fixes.get(uri)?.filter(f => !f.applied && !f.skipped) ?? []
  }

  getState(uri: string): SuggestionState {
    const active = this.getActive(uri)
    const idx    = Math.min(this.currentIdx.get(uri) ?? 0, Math.max(0, active.length - 1))
    return {
      fix:        active[idx],
      currentPos: active.length > 0 ? idx + 1 : 0,
      total:      active.length,
      hasUndo:    (this.undoStack.get(uri)?.length ?? 0) > 0,
    }
  }

  next(uri: string) {
    const active = this.getActive(uri)
    const cur    = this.currentIdx.get(uri) ?? 0
    this.currentIdx.set(uri, Math.min(cur + 1, Math.max(0, active.length - 1)))
  }

  prev(uri: string) {
    const cur = this.currentIdx.get(uri) ?? 0
    this.currentIdx.set(uri, Math.max(0, cur - 1))
  }

  markApplied(uri: string, id: string, lineIdx: number, original: string) {
    const fix = this.fixes.get(uri)?.find(f => f.id === id)
    if (fix) fix.applied = true
    // Push undo entry
    this.undoStack.get(uri)?.push({ uri, lineIdx, original })
    // Clamp index
    const active = this.getActive(uri)
    const cur    = this.currentIdx.get(uri) ?? 0
    if (cur >= active.length) this.currentIdx.set(uri, Math.max(0, active.length - 1))
  }

  markSkipped(uri: string, id: string) {
    const fix = this.fixes.get(uri)?.find(f => f.id === id)
    if (fix) fix.skipped = true
    const active = this.getActive(uri)
    const cur    = this.currentIdx.get(uri) ?? 0
    if (cur >= active.length) this.currentIdx.set(uri, Math.max(0, active.length - 1))
  }

  popUndo(uri: string): { lineIdx: number; original: string } | undefined {
    return this.undoStack.get(uri)?.pop()
  }

  clear(uri: string) {
    this.fixes.delete(uri)
    this.currentIdx.delete(uri)
    this.undoStack.delete(uri)
  }
}

export const reviewStore = new ReviewStore()
