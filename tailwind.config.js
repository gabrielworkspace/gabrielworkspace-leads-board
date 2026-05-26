/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#050505',
          800: '#0a0a0a',
          700: '#121212',
          600: '#1e1e1e',
        },
        primary: {
          400: '#C6F432',
          500: '#A3FF12',
          600: '#8BE600',
        },
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
