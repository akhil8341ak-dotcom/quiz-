/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#6C47FF',
          600: '#5835E5',
          700: '#4C1D95',
          electric: '#3B82F6',
          pink: '#FF4D8D',
          yellow: '#FFC83D',
          mint: '#14D9B0',
        },
        dark: {
          bg: '#0F0D23',
          surface: '#171338',
          card: '#1F1A45',
          cardHover: '#282257',
          border: '#312C5E',
          textMuted: '#948EB5',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(108, 71, 255, 0.4)',
        'glow-pink': '0 0 25px -5px rgba(255, 77, 141, 0.4)',
        'glow-mint': '0 0 25px -5px rgba(20, 217, 176, 0.4)',
        'glow-yellow': '0 0 25px -5px rgba(255, 200, 61, 0.4)',
        'card-soft': '0 10px 30px -10px rgba(30, 27, 58, 0.08), 0 4px 10px -2px rgba(30, 27, 58, 0.03)',
        'card-dark': '0 15px 35px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
