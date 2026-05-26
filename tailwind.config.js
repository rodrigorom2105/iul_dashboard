/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#0f1117',
        card: '#1a1d27',
        border: '#2d3148',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'green-active': '#22c55e',
        'red-clockout': '#ef4444',
        'blue-accent': '#3b82f6',
        'yellow-open': '#fef08a',
        'yellow-open-bg': '#422006',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

