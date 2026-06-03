import * as https from 'https'
import * as http from 'http'

export interface ReviewIssue {
  line?: number
  severity: 'critical' | 'warning' | 'info' | 'suggestion'
  category?: string
  message: string
  suggestion?: string
  fix?: string
}

export interface ReviewResult {
  score: number
  summary: string
  issues: ReviewIssue[]
  positives: string[]
  overallSuggestions: string[]
  aiProvider: string
}

// Maps VS Code languageId → Codaris language name
const LANG_MAP: Record<string, string> = {
  javascript:       'javascript',
  javascriptreact:  'javascript',
  typescript:       'typescript',
  typescriptreact:  'typescript',
  python:           'python',
  java:             'java',
  go:               'go',
  rust:             'rust',
  cpp:              'cpp',
  c:                'c',
  csharp:           'csharp',
  php:              'php',
  ruby:             'ruby',
  swift:            'swift',
  kotlin:           'kotlin',
  html:             'html',
  css:              'css',
  sql:              'sql',
  shellscript:      'bash',
  bash:             'bash',
}

export function callReviewApi(baseUrl: string, code: string, vscodeLang: string): Promise<ReviewResult> {
  const language = LANG_MAP[vscodeLang] ?? 'javascript'
  const body = JSON.stringify({ code, language })

  return new Promise((resolve, reject) => {
    const url = new URL('/api/review', baseUrl)
    const isHttps = url.protocol === 'https:'
    const lib = isHttps ? https : http

    const options = {
      hostname: url.hostname,
      port: url.port ? parseInt(url.port) : (isHttps ? 443 : 80),
      path: '/api/review',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/json',
      },
      timeout: 60000, // 60s — Render cold start can be slow
    }

    const req = lib.request(options, (res) => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => {
        // Non-200 status
        if (res.statusCode && res.statusCode >= 400) {
          let msg = `Server error (${res.statusCode})`
          try {
            const errJson = JSON.parse(data)
            msg = errJson.message || errJson.error || msg
          } catch { /* body was not JSON */ }
          return reject(new Error(msg))
        }

        // Parse JSON response
        try {
          const json = JSON.parse(data)

          if (json.success === false) {
            return reject(new Error(json.message ?? 'API returned an error'))
          }

          // Response is spread directly: { success, reviewId, score, summary, issues, ... }
          const result: ReviewResult = {
            score:               json.score              ?? 0,
            summary:             json.summary            ?? '',
            issues:              json.issues             ?? [],
            positives:           json.positives          ?? [],
            overallSuggestions:  json.overallSuggestions ?? [],
            aiProvider:          json.aiProvider         ?? 'gemini',
          }

          resolve(result)
        } catch {
          // Server returned non-JSON (e.g. Render wakeup HTML page)
          const preview = data.slice(0, 120).replace(/\n/g, ' ')
          reject(new Error(
            data.includes('<!DOCTYPE') || data.includes('<html')
              ? 'Server is waking up — please try again in 15 seconds'
              : `Unexpected response: ${preview}`
          ))
        }
      })
    })

    req.on('error', (err) => reject(new Error(`Network error: ${err.message}`)))
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out — server may be waking up, please try again'))
    })

    req.write(body)
    req.end()
  })
}
