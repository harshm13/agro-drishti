/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32', // Forest Green
          dark: '#1B5E20',
          light: '#4CAF50',
          50: '#F1F8E9',
          100: '#DCEDC8',
          200: '#C5E1A5',
          300: '#A5D6A7',
          400: '#81C784',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#144617',
          900: '#0B290D',
        },
        secondary: {
          DEFAULT: '#A5D6A7', // Light Green
          light: '#C8E6C9',
          dark: '#81C784',
        },
        accent: {
          DEFAULT: '#FFB300', // Amber
          light: '#FFD54F',
          dark: '#FF8F00',
        },
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          surface: '#252525',
          border: '#333333',
          text: '#E0E0E0',
          muted: '#A0A0A0',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Noto Sans Devanagari', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(46, 125, 50, 0.4)',
        'glow-accent': '0 0 25px -5px rgba(255, 179, 0, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'laser': 'laserSweep 2.2s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'sound-wave': 'soundWave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        laserSweep: {
          '0%': { top: '0%', opacity: '0.9' },
          '50%': { top: '96%', opacity: '1' },
          '100%': { top: '0%', opacity: '0.9' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(76, 175, 80, 0)' },
        },
        soundWave: {
          '0%': { height: '6px' },
          '100%': { height: '24px' },
        },
      },
    },
  },
  plugins: [],
};
