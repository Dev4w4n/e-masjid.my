/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // TV display specific configurations
      screens: {
        'tv': '1920px',      // Standard Full HD TV
        'tv-4k': '3840px',   // 4K TV displays
      },
      
      // Animation configurations for smooth 60fps
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-left': 'slideLeft 0.5s ease-in-out',
        'slide-right': 'slideRight 0.5s ease-in-out',
        'prayer-pulse': 'prayerPulse 2s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'slide-in-bottom-right': 'slide-in-bottom-right 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        prayerPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.95)' },
        },
        'slide-in-bottom-right': {
          '0%': { transform: 'translate(100%, 100%)', opacity: '0' },
          '100%': { transform: 'translate(0, 0)', opacity: '1' },
        }
      },
      
      // Typography optimized for TV viewing distance
      fontSize: {
        'tv-xs': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        'tv-sm': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        'tv-base': ['2rem', { lineHeight: '2.5rem' }],      // 32px
        'tv-lg': ['2.5rem', { lineHeight: '3rem' }],        // 40px
        'tv-xl': ['3rem', { lineHeight: '3.5rem' }],        // 48px
        'tv-2xl': ['4rem', { lineHeight: '4.5rem' }],       // 64px
        'tv-3xl': ['5rem', { lineHeight: '5.5rem' }],       // 80px
      },
      
      // Prayer time overlay positioning
      spacing: {
        'prayer-offset': '2rem',
      },
      
      // Colors for Islamic content and readability
      colors: {
        islamic: {
          green: {
            50: '#f0f9f0',
            100: '#dcf2dc',
            200: '#bce5bc',
            300: '#8dd48d',
            400: '#5cb85c',
            500: '#3c8f3c',
            600: '#2d712d',
            700: '#1f5a1f',
            800: '#164316',
            900: '#0d2f0d',
            DEFAULT: '#006633', // Legacy default
          },
          gold: {
            50: '#fefdf5',
            100: '#fdf9e6',
            200: '#faf0c7',
            300: '#f6e39e',
            400: '#f0d065',
            500: '#e8bc3a',
            600: '#d4a017',
            700: '#b8860b',
            800: '#8b6914',
            900: '#6b5016',
            DEFAULT: '#FFD700', // Legacy default
          },
          cream: {
            50: '#fffef9',
            100: '#fffcf0',
            200: '#fef8e1',
            300: '#fcf0c2',
            400: '#f8e5a3',
            500: '#f2d784',
            600: '#e8c547',
            700: '#d4a017',
            800: '#a67c00',
            900: '#7a5c00',
          },
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          'dark-green': '#004422',
        },
        display: {
          bg: '#000000',
          overlay: 'rgba(0, 0, 0, 0.7)',
          text: '#FFFFFF',
          'text-secondary': '#E5E5E5',
        }
      },
      
      fontFamily: {
        'arabic': ['Amiri', 'serif'],
        'islamic': ['Scheherazade New', 'serif'],
      },

      backgroundImage: {
        'islamic-pattern': "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"pattern\" x=\"0\" y=\"0\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><polygon fill=\"%23065f46\" fill-opacity=\"0.05\" points=\"10,0 20,10 10,20 0,10\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23pattern)\"/></svg>')",
        'mosque-silhouette': "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 100\"><path fill=\"%23065f46\" fill-opacity=\"0.08\" d=\"M30 80h8V65c0-4 4-8 8-8s8 4 8 8v15h12V55c0-8 8-16 16-16s16 8 16 16v25h12V65c0-4 4-8 8-8s8 4 8 8v15h8L130 45L100 25L70 45z\"/><circle fill=\"%23065f46\" fill-opacity=\"0.12\" cx=\"100\" cy=\"28\" r=\"6\"/><circle fill=\"%23065f46\" fill-opacity=\"0.1\" cx=\"70\" cy=\"35\" r=\"3\"/><circle fill=\"%23065f46\" fill-opacity=\"0.1\" cx=\"130\" cy=\"35\" r=\"3\"/><path fill=\"%23065f46\" fill-opacity=\"0.06\" d=\"M85 50h30v25H85z\"/></svg>')",
      },

      // Z-index layers for display system
      zIndex: {
        'content': '10',
        'prayer-overlay': '20',
        'error-overlay': '30',
      },
    },
  },
  plugins: [
    // Ensure no conflicting plugins that might affect performance
  ],
}
