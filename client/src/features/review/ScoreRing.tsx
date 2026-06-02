interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

function getColor(score: number) {
  if (score >= 80) return '#16a34a'   // green
  if (score >= 60) return '#d97706'   // amber
  if (score >= 40) return '#ea580c'   // orange
  return '#dc2626'                    // red
}

function getLabel(score: number) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

export default function ScoreRing({ score, size = 80, strokeWidth = 8 }: ScoreRingProps) {
  const r     = (size - strokeWidth) / 2
  const circ  = 2 * Math.PI * r
  const filled = circ * (Math.min(100, Math.max(0, score)) / 100)
  const gap   = circ - filled
  const color = getColor(score)
  const label = getLabel(score)

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track ring */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#e8e3dc" strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        {/* Score number — counter-rotated so it reads upright */}
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          style={{
            transform:       `rotate(90deg)`,
            transformOrigin: `${size / 2}px ${size / 2}px`,
            fontSize:        `${size * 0.26}px`,
            fontWeight:      700,
            fill:            '#1c1917',   /* dark — readable on white/light bg */
            fontFamily:      'Inter, sans-serif',
          }}
        >
          {score}
        </text>
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
