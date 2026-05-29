/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c10',
        elev: '#11141b',
        'elev-2': '#161a23',
        hover: '#1b2030',
        border: '#232838',
        'border-strong': '#2e3447',
        text: '#e7ebf3',
        'text-2': '#8b93a7',
        'text-3': '#5c637a',
        accent: '#34d399',
        'accent-strong': '#10b981',
        warn: '#fbbf24',
        neg: '#f87171',
        info: '#818cf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        base: ['13px', { lineHeight: '1.45' }],
      },
    },
  },
  plugins: [],
}
