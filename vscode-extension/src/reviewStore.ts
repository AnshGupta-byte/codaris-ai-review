import { ReviewIssue } from './api'

export interface StoredFix {
  id: string
  line: number
  message: string
  fix: string
  applied: boolean
  skipped: boolean
}

class ReviewStore {
  private fixes: Map<string, StoredFix[]> = new Map()

  setFixes(uri: string, issues: ReviewIssue[]) {
    const fixes: StoredFix[] = issues
      .filter(i => i.fix && i.line)
      .map((i, idx) => ({
        id:      `${uri}:${idx}`,
        line:    i.line!,
        message: i.message,
        fix:     i.fix!,
        applied: false,
        skipped: false,
      }))
    this.fixes.set(uri, fixes)
  }

  getActive(uri: string): StoredFix[] {
    return this.fixes.get(uri)?.filter(f => !f.applied && !f.skipped) ?? []
  }

  getAll(uri: string): StoredFix[] {
    return this.fixes.get(uri) ?? []
  }

  markApplied(uri: string, id: string) {
    const fix = this.fixes.get(uri)?.find(f => f.id === id)
    if (fix) fix.applied = true
  }

  markSkipped(uri: string, id: string) {
    const fix = this.fixes.get(uri)?.find(f => f.id === id)
    if (fix) fix.skipped = true
  }

  clear(uri: string) {
    this.fixes.delete(uri)
  }

  hasFixes(uri: string): boolean {
    return (this.getActive(uri).length) > 0
  }
}

export const reviewStore = new ReviewStore()
