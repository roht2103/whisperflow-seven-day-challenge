/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#08090c',
          card: '#0e1117',
          surface: '#121620',
          elevated: '#171c28',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        amber: {
          glow: '#ffaa1d',
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#b45309',
        },
        cyan: {
          glow: '#00f2ff',
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0e7490',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Syne', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'amber-glow': '0 0 35px -5px rgba(245, 158, 11, 0.35)',
        'cyan-glow': '0 0 35px -5px rgba(6, 182, 212, 0.35)',
        'funnel-glow': '0 20px 60px -10px rgba(245, 158, 11, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

