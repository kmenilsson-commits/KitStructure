/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sw: {
          orange: '#E85D04',
          'orange-light': '#FB8500',
          dark: '#1a1a2e',
          'dark-mid': '#2d2d44',
        },
      },
    },
  },
  plugins: [],
}
