/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        'primary': {
          50: '#FFF4F1',
          100: '#FFE8E1',
          200: '#FFD1C7',
          300: '#FFB4A3',
          400: '#FF8B6B',
          500: '#FF6B35',
          600: '#E55A2B',
          700: '#CC4A21',
          800: '#B33A17',
          900: '#992A0D',
        },
        'success': {
          50: '#F0F9F4',
          100: '#DCF4E6',
          200: '#BBE9CE',
          300: '#86DFAB',
          400: '#4CAF50',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        'accent': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FFD700',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        'neutral': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'food-mesh': 'radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgba(255, 107, 53, 0.3), 0 0 10px rgba(255, 107, 53, 0.2), 0 0 15px rgba(255, 107, 53, 0.1)',
          },
          '100%': { 
            boxShadow: '0 0 10px rgba(255, 107, 53, 0.5), 0 0 20px rgba(255, 107, 53, 0.3), 0 0 30px rgba(255, 107, 53, 0.2)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'web3-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 193, 7, 0.3), 0 0 40px rgba(76, 175, 80, 0.2)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(255, 193, 7, 0.5), 0 0 60px rgba(76, 175, 80, 0.3)',
            transform: 'scale(1.02)'
          }
        },
      },
      boxShadow: {
        'food': '0 4px 14px 0 rgba(255, 107, 53, 0.15)',
        'success': '0 4px 14px 0 rgba(76, 175, 80, 0.15)',
        'glow-sm': '0 0 10px rgba(255, 107, 53, 0.3)',
        'glow-md': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-lg': '0 0 30px rgba(255, 107, 53, 0.3)',
      },
    },
  },
  plugins: [],
};