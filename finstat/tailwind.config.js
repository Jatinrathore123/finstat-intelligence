/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F1F2EF',
        ink: '#10151F',
        navy: {
          DEFAULT: '#142441',
          light: '#22355C',
          dark: '#0A1220',
        },
        ledger: '#2F6F62',
        amber: '#B8860B',
        rose: '#A23B3B',
        line: '#D8D9D3',
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontFeatureSettings: {
        tabular: '"tnum" 1',
      },
    },
  },
  plugins: [],
}
