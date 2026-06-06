/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: '#4F46E5',
        secondary: '#6366F1',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.08)',
        float: '0 18px 55px rgba(15, 23, 42, 0.16)',
      },
      borderRadius: {
        card: '8px',
        panel: '12px',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        lift: {
          '0%': { transform: 'translateY(4px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        lift: 'lift 180ms ease-out',
      },
    },
  },
  plugins: [],
};
