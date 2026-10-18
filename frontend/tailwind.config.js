/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#43A047',
        },
        secondary: {
          DEFAULT: '#A5D6A7',
          light: '#C8E6C9',
          dark: '#81C784',
        },
        accent: {
          DEFAULT: '#FFB300',
          hover: '#FFA000',
          light: '#FFE082',
        },
        bgLight: '#FAFAFA',
        darkBg: '#121212',
        darkCard: '#1E1E1E',
        darkText: '#E0E0E0',
        darkTextSec: '#B0B0B0',
        darkBorder: '#333333',
      },
      fontFamily: {
        sans: ['Poppins', 'Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(46, 125, 50, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(46, 125, 50, 0.16)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
