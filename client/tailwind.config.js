/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:              '#1c1917',
          surface:         '#252220',
          'surface-2':     '#2e2b28',
          border:          '#3a3631',
          'border-strong': '#504a44',
          text:            '#f5f0e8',
          secondary:       '#c8c0b8',
          muted:           '#9d9890',
          accent:          '#e07a52',
          'accent-hover':  '#c96442',
          'accent-light':  'rgba(224,122,82,0.12)',
          'accent-border': 'rgba(224,122,82,0.28)',
          code:            '#141210',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in':  'fadeIn 0.35s ease forwards',
        'fade-up':  'fadeUp 0.45s ease forwards',
        'spin-slow':'spin 2.5s linear infinite',
        'glow':     'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:    { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        glowPulse: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
}
