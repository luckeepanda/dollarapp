/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Blue color scheme based on provided palette
        'royal-blue': {
          DEFAULT: '#2B69E5',
          100: '#061430',
          200: '#0c2860',
          300: '#123c90',
          400: '#1850c0',
          500: '#2b69e5',
          600: '#5486ea',
          700: '#7fa4ef',
          800: '#aac3f4',
          900: '#d4e1fa'
        },
        'steel-blue': {
          DEFAULT: '#2F79CF',
          100: '#09182a',
          200: '#133153',
          300: '#1c497d',
          400: '#2662a6',
          500: '#2f79cf',
          600: '#5995d9',
          700: '#82afe3',
          800: '#accaec',
          900: '#d5e4f6'
        },
        'off-white': {
          DEFAULT: '#FEFEFE',
          100: '#333333',
          200: '#666666',
          300: '#999999',
          400: '#cccccc',
          500: '#fefefe',
          600: '#ffffff',
          700: '#ffffff',
          800: '#ffffff',
          900: '#ffffff'
        }
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
};