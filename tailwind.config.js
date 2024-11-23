/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class', // Habilitamos el modo oscuro
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003D5B',
          dark: '#3b82f6'  // azul más brillante para modo oscuro
        },
        secondary: {
          DEFAULT: '#FF6B2B',
          dark: '#f97316'  // naranja más brillante para modo oscuro
        },
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          surface: '#334155',
          text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1'
          },
          border: '#475569'
        }
      },
      keyframes: {
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        modalIn: 'modalIn 0.2s ease-out'
      }
    },
  },
  plugins: [],
}