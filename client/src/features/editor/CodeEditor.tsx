import Editor from '@monaco-editor/react'

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
]

const PLACEHOLDER: Record<string, string> = {
  javascript: `// Paste your JavaScript code here for review
function fetchUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.execute(query);
}`,
  python: `# Paste your Python code here for review
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query)`,
  typescript: `// Paste your TypeScript code here for review
async function fetchData(url: string) {
  const response = await fetch(url)
  const data = await response.json()
  return data
}`,
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  onLanguageChange: (lang: string) => void
  issueLines?: number[]
}

export default function CodeEditor({ value, onChange, language, onLanguageChange, issueLines = [] }: CodeEditorProps) {
  const placeholder = PLACEHOLDER[language] || `// Paste your ${language} code here for AI review`

  return (
    <div className="flex flex-col h-full">
      {/* Language Selector */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-brand-navy3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-lg px-3 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan/40
                       cursor-pointer transition-colors hover:bg-white/10"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} className="bg-brand-navy3">
                {l.label}
              </option>
            ))}
          </select>
        </div>
        {issueLines.length > 0 && (
          <span className="text-xs text-orange-400 font-medium">
            {issueLines.length} issue{issueLines.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 monaco-editor-container">
        <Editor
          height="100%"
          language={language}
          value={value || placeholder}
          theme="vs-dark"
          onChange={(val) => onChange(val || '')}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: { enabled: true },
            suggest: { showKeywords: true },
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}

export { LANGUAGES }
