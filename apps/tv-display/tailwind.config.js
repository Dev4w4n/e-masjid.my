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
          green: '#006633',
          gold: '#FFD700',
          'dark-green': '#004422',
        },
        display: {
          bg: '#000000',
          overlay: 'rgba(0, 0, 0, 0.7)',
          text: '#FFFFFF',
          'text-secondary': '#E5E5E5',
        }
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