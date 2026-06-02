interface ScoreRingProps {
  score: number
  size?: number
}

function getScoreColor(score: number) {
  if (score >= 80) return { stroke: '#34d399', text: 'text-emerald-400', label: 'Excellent' }
  if (score >= 60) return { stroke: '#00e5ff', text: 'text-brand-cyan', label: 'Good' }
  if (score >= 40) return { stroke: '#fb923c', text: 'text-orange-400', label: 'Fair' }
  return { stroke: '#f87171', text: 'text-red-400', label: 'Poor' }
}

export default function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.min(100, Math.max(0, score))
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference
  const { stroke, text, label } = getScoreColor(clampedScore)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={stroke} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${stroke}80)` }}
        />
        {/* Score text (rotate back) */}
        <text
          x="50%" y="50%"
          dominantBaseline="middle" textAnchor="middle"
          fill="white" fontSize="22" fontWeight="800" fontFamily="Outfit, sans-serif"
          transform={`rotate(90, ${size / 2}, ${size / 2})`}
        >
          {clampedScore}
        </text>
      </svg>
      <span className={`text-xs font-bold uppercase tracking-wider ${text}`}>{label}</span>
    </div>
  )
}
