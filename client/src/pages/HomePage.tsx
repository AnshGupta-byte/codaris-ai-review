import { Link } from 'react-router-dom'
import { Code2, Zap, Shield, BarChart3, Github, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  { icon: <Zap size={20} className="text-brand-cyan" />, title: 'Instant AI Review', desc: 'Paste code and get detailed feedback in seconds powered by Gemini 2.5 Flash.' },
  { icon: <Shield size={20} className="text-brand-purple" />, title: 'Security Analysis', desc: 'Detect SQL injection, XSS, auth flaws, and 50+ vulnerability patterns.' },
  { icon: <BarChart3 size={20} className="text-brand-pink" />, title: 'Quality Score', desc: 'Get a 0–100 quality score with detailed breakdown by category.' },
  { icon: <Code2 size={20} className="text-emerald-400" />, title: '15+ Languages', desc: 'JS, TS, Python, Java, Go, Rust, C++, PHP, Ruby, Swift, Kotlin, and more.' },
]

const SAMPLE_ISSUES = [
  { severity: 'critical', message: 'SQL injection vulnerability on line 4 — use parameterized queries' },
  { severity: 'warning', message: 'Missing null check before accessing user.email' },
  { severity: 'suggestion', message: 'Consider extracting this logic into a reusable utility function' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-purple/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="section-tag mb-4">AI-Powered · Free · No Credit Card</div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[1.08]">
            Code Smarter with<br />
            <span className="gradient-text">AI Code Review</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Paste any code snippet and get instant, actionable feedback — security issues, performance tips, best practices, and a quality score.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/review" className="btn-primary flex items-center gap-2 text-base px-7 py-3">
              Start Reviewing Free <ArrowRight size={18} />
            </Link>
            <a href="/api/auth/github" className="btn-ghost flex items-center gap-2 text-base px-7 py-3">
              <Github size={18} /> Sign in with GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="section-tag">FEATURES</div>
          <h2 className="text-3xl font-bold mt-2">Everything you need for <span className="gradient-text">better code</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-5 hover:border-white/15 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-semibold text-slate-200 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Review Preview */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-sm font-semibold text-brand-cyan">Sample Review Output</span>
          </div>
          <div className="space-y-3">
            {SAMPLE_ISSUES.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-sm mt-0.5">
                  {issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟠' : '🟢'}
                </span>
                <p className="text-sm text-slate-300">{issue.message}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle size={16} />
              <span>2 positives found</span>
            </div>
            <span className="text-2xl font-black text-white">Score: <span className="gradient-text">72</span></span>
          </div>
        </div>
      </section>
    </div>
  )
}
