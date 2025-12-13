/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Open E Masjid primary colors
        'primary': {
          50: '#e6f4ff',
          100: '#bae0ff',
          200: '#91ccff',
          300: '#6bb8ff',
          400: '#5aa8f7',
          500: '#338CF5', // Main primary blue
          600: '#2b7acc',
          700: '#0070F4', // Button blue
          800: '#154179',
          900: '#0d2a52',
          950: '#051426',
        },
        'secondary': {
          50: '#e6fcf9',
          100: '#b3f5e8',
          200: '#80eed7',
          300: '#6eecce',
          400: '#5de3c3',
          500: '#4FD1C5', // Main teal
          600: '#3bb8ad',
          700: '#2ba68e',
          800: '#1d7a6f',
          900: '#0f4e47',
          950: '#062220',
        },
        // Legacy Islamic theme colors (kept for backwards compatibility)
        'islamic-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        'islamic-gold': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        'islamic-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'islamic': '0.25rem', // 4px
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.04)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.04)',
        'xl': '0 20px 25px -5px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
