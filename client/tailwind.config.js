/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:            '#faf9f7',
          surface:       '#ffffff',
          'surface-2':   '#f5f2ee',
          border:        '#e8e3dc',
          'border-strong':'#ccc5bb',
          text:          '#1c1917',
          secondary:     '#78716c',
          muted:         '#a8a29e',
          accent:        '#c96442',
          'accent-hover':'#a8502f',
          'accent-light':'#fef3ee',
          'accent-border':'#fcd9c8',
          code:          '#1e1b18',
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
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
