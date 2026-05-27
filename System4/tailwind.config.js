/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#090b10',
          900: '#10141b',
          800: '#161c26',
          700: '#1e2633',
          600: '#273043',
        },
        emerald: {
          400: '#41f2b2',
          500: '#1bd993',
          600: '#16b17a',
        },
        pulseblue: {
          400: '#63a3ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        amberglow: {
          400: '#f6c453',
          500: '#f59e0b',
          600: '#d97706',
        },
        redglow: {
          400: '#ff7a85',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(79, 210, 170, 0.35)',
        card: '0 30px 80px -60px rgba(0, 0, 0, 0.8)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at top, rgba(79, 210, 170, 0.18), transparent 55%)',
        'mesh': 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(245, 158, 11, 0.2), transparent 40%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.12), transparent 45%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        shimmer: 'shimmer 10s ease infinite',
      },
    },
  },
  plugins: [],
}

