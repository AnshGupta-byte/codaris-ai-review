import { create } from 'zustand'

export interface ReviewIssue {
  line?: number
  severity: 'critical' | 'warning' | 'info' | 'suggestion'
  category: string
  message: string
  suggestion: string
}

export interface ReviewResult {
  _id?: string
  score: number
  summary: string
  issues: ReviewIssue[]
  positives: string[]
  overallSuggestions: string[]
  aiProvider: string
  language: string
  createdAt?: string
}

interface ReviewState {
  currentReview: ReviewResult | null
  isReviewing: boolean
  reviewHistory: ReviewResult[]
  setReview: (review: ReviewResult | null) => void
  setReviewing: (v: boolean) => void
  setHistory: (history: ReviewResult[]) => void
}

export const useReviewStore = create<ReviewState>((set) => ({
  currentReview: null,
  isReviewing: false,
  reviewHistory: [],
  setReview: (review) => set({ currentReview: review }),
  setReviewing: (v) => set({ isReviewing: v }),
  setHistory: (history) => set({ reviewHistory: history }),
}))
