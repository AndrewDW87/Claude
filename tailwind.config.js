/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B2545',
          50: '#E8EEF5',
          100: '#C5D3E5',
          200: '#8FAAC9',
          300: '#5981AD',
          400: '#2E5A8E',
          500: '#0B2545',
          600: '#091E38',
          700: '#07172B',
          800: '#04101E',
          900: '#020810',
        },
        coral: {
          DEFAULT: '#E76F51',
          50: '#FDF2EF',
          100: '#FAE0D9',
          200: '#F5C0B2',
          300: '#F09F8B',
          400: '#EB8764',
          500: '#E76F51',
          600: '#D4573A',
          700: '#A9432D',
          800: '#7D3020',
          900: '#521D13',
        },
        cream: '#FAFAF7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
