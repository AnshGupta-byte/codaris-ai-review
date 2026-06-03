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
  javascript: 'javascript',
  javascriptreact: 'javascript',
  typescript: 'typescript',
  typescriptreact: 'typescript',
  python: 'python',
  java: 'java',
  go: 'go',
  rust: 'rust',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  html: 'html',
  css: 'css',
  sql: 'sql',
  shellscript: 'bash',
  bash: 'bash',
}

export function callReviewApi(baseUrl: string, code: string, vscodeLang: string): Promise<ReviewResult> {
  const language = LANG_MAP[vscodeLang] ?? 'javascript'
  const body = JSON.stringify({ code, language })

  return new Promise((resolve, reject) => {
    const url = new URL('/api/review', baseUrl)
    const isHttps = url.protocol === 'https:'
    const lib = isHttps ? https : http

    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 60000, // 60s — Render cold start can be slow
      },
      (res) => {
        let data = ''
        res.on('data', chunk => (data += chunk))
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.success === false) {
              reject(new Error(json.message ?? 'API error'))
            } else {
              resolve(json.review ?? json)
            }
          } catch {
            reject(new Error('Invalid response from Codaris API'))
          }
        })
      }
    )

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out — server may be waking up, try again in 15s'))
    })

    req.write(body)
    req.end()
  })
}
