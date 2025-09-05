/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 10%, 95%)',
        accent: 'hsl(30, 100%, 60%)',
        primary: 'hsl(220, 60%, 50%)',
        success: 'hsl(130, 60%, 45%)',
        surface: 'hsl(0, 0%, 100%)',
        destructive: 'hsl(0, 70%, 50%)',
        textPrimary: 'hsl(220, 15%, 25%)',
        textSecondary: 'hsl(220, 10%, 45%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(220, 15%, 25%, 0.1)',
        'modal': '0 12px 32px hsla(220, 15%, 25%, 0.2)',
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.75rem' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', color: 'hsl(220, 10%, 45%)' }],
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 300ms ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}