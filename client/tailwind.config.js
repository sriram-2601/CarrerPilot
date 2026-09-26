/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#18212f',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#18212f',
          950: '#0f172a'
        },
        paper: {
          DEFAULT: '#f7f8f3',
          light: '#ffffff',
          dark: '#eef0e6'
        },
        moss: {
          DEFAULT: '#1f7a5c',
          light: '#2ba079',
          dark: '#165741',
          subtle: '#e8f5f0'
        },
        coral: {
          DEFAULT: '#d55c45',
          light: '#e07662',
          dark: '#a8412c',
          subtle: '#fdf2f0'
        },
        gold: {
          DEFAULT: '#c28a21',
          light: '#dca437',
          dark: '#966914',
          subtle: '#fcf7ec'
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(24, 33, 47, 0.08)',
        'elevated': '0 10px 30px -5px rgba(24, 33, 47, 0.12)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};
