import { Link } from 'react-router-dom'
import { ArrowRight, Github, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const FEATURES = [
  {
    icon: <Zap size={18} />,
    title: 'Instant feedback',
    desc: 'Powered by Gemini 2.5 Flash. Paste code, get a detailed review in seconds.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'Security analysis',
    desc: 'Detects SQL injection, XSS, auth flaws, and 50+ vulnerability patterns automatically.',
  },
  {
    icon: <BarChart3 size={18} />,
    title: 'Quality scoring',
    desc: 'A 0–100 quality score with per-category breakdown — readability, performance, security.',
  },
  {
    icon: <Globe size={18} />,
    title: '15+ languages',
    desc: 'JavaScript, TypeScript, Python, Go, Rust, Java, C++, PHP, Ruby, Swift, and more.',
  },
]

const SAMPLE_ISSUES = [
  { type: 'critical', text: 'SQL injection on line 4 — use parameterised queries instead of string concatenation.' },
  { type: 'warning',  text: 'Missing null check before accessing user.email — will throw on unauthenticated requests.' },
  { type: 'info',     text: 'console.log leaks sensitive data in production. Remove or guard behind NODE_ENV.' },
  { type: 'good',     text: 'Error handling pattern is consistent and idiomatic.' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const BASE = import.meta.env.VITE_API_URL ?? ''

  return (
    <div className="min-h-screen bg-brand-bg">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-5 text-center">
        <div className="max-w-2xl mx-auto animate-fade-up">

          <span className="label-upper">AI Code Review · Free · No credit card</span>

          <h1 className="heading-serif text-5xl sm:text-6xl md:text-7xl text-brand-text mt-4 mb-5">
            Write better code,<br />
            <em className="text-brand-accent not-italic">faster.</em>
          </h1>

          <p className="text-base sm:text-lg text-brand-secondary leading-relaxed max-w-lg mx-auto mb-9">
            Paste any code snippet and get instant, actionable feedback —
            security issues, performance tips, best practices, and a quality score.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/review" className="btn-primary px-6 py-3 text-sm sm:text-base">
              Start reviewing free
              <ArrowRight size={16} />
            </Link>
            {!isAuthenticated && (
              <a
                href={`${BASE}/api/auth/github`}
                className="btn-outline px-6 py-3 text-sm sm:text-base"
              >
                <Github size={16} />
                Sign in with GitHub
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="border-t border-brand-border" />
      </div>

      {/* ── Sample Review ──────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <span className="section-label">See it in action</span>
          <h2 className="heading-serif text-3xl sm:text-4xl text-brand-text mb-8">
            Real feedback, instantly.
          </h2>

          <div className="card overflow-hidden">
            {/* Fake file header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-border bg-brand-surface-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              </div>
              <span className="font-mono text-xs text-brand-muted ml-1">fetchUser.js</span>
            </div>

            {/* Code preview */}
            <div className="bg-brand-code px-5 py-4 overflow-x-auto">
              <pre className="font-mono text-xs sm:text-sm leading-6 text-stone-300">
{`function fetchUserData(userId) {
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  const result = db.execute(query);
  console.log("User found: " + result.password);
  return result;
}`}
              </pre>
            </div>

            {/* Issues */}
            <div className="divide-y divide-brand-border">
              {SAMPLE_ISSUES.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="mt-px text-sm flex-shrink-0">
                    {issue.type === 'critical' ? '🔴'
                     : issue.type === 'warning'  ? '🟡'
                     : issue.type === 'info'     ? '🔵' : '✅'}
                  </span>
                  <p className="text-sm text-brand-secondary leading-relaxed">{issue.text}</p>
                </div>
              ))}
            </div>

            {/* Score footer */}
            <div className="flex items-center justify-between px-5 py-4 bg-brand-surface-2 border-t border-brand-border">
              <span className="text-sm text-brand-muted">3 issues · 1 positive</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-secondary">Quality score</span>
                <span className="font-serif text-2xl font-semibold text-brand-accent">72</span>
                <span className="text-sm text-brand-muted">/100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="border-t border-brand-border" />
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <span className="section-label">Features</span>
          <h2 className="heading-serif text-3xl sm:text-4xl text-brand-text mb-10">
            Everything you need.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-hover p-5">
                <div className="w-9 h-9 rounded-lg border border-brand-border bg-brand-surface-2
                                flex items-center justify-center text-brand-accent mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-brand-text text-sm mb-1.5">{f.title}</h3>
                <p className="text-sm text-brand-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="card p-10 sm:p-14 text-center bg-brand-accent-light border-brand-accent-border">
            <h2 className="heading-serif text-3xl sm:text-4xl text-brand-text mb-4">
              Ready to review your code?
            </h2>
            <p className="text-brand-secondary mb-8 max-w-md mx-auto">
              No signup required. Paste your code and get a full AI review in seconds.
            </p>
            <Link to="/review" className="btn-primary px-7 py-3 text-base">
              Start reviewing free
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-brand-border bg-brand-surface-2">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">

            {/* Left — branding */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-brand-accent flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="font-semibold text-brand-text text-sm">Codaris AI</span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed max-w-xs">
                Free AI-powered code review. Instant feedback on security,
                performance, and code quality.
              </p>
            </div>

            {/* Right — creator + links */}
            <div className="flex flex-col sm:items-end gap-3">
              <p className="text-xs text-brand-muted">
                Built by{' '}
                <a
                  href="https://www.linkedin.com/in/anshkrgupta/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-text hover:text-brand-accent transition-colors"
                >
                  Ansh Kumar Gupta
                </a>
              </p>

              {/* Social / contact links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/anshkrgupta/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors"
                >
                  {/* LinkedIn icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                  LinkedIn
                </a>

                <span className="text-brand-border">·</span>

                <a
                  href="https://github.com/AnshGupta-byte"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors"
                >
                  <Github size={13} />
                  GitHub
                </a>

                <span className="text-brand-border">·</span>

                <a
                  href="mailto:anshg397@gmail.com"
                  title="Send feedback"
                  className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-accent transition-colors"
                >
                  {/* Mail icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Feedback
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-brand-border mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-muted">
            <span>© 2026 Codaris AI · Free & open source</span>
            <Link to="/review" className="hover:text-brand-text transition-colors">
              Start reviewing →
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
