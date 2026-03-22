/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark:    '#0a0a0a',
        surface: '#141414',
        card:    '#1a1a1a',
        border:  '#2a2a2a',
        accent:  '#e50914',
        gold:    '#f5c518',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};