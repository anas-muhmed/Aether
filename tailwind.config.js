/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101114',
        paper: '#f7f7f4',
        aether: '#365cff',
        acid: '#d9ff64',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        float: '0 22px 70px rgba(16, 17, 20, 0.12)',
        glow: '0 0 60px rgba(54, 92, 255, 0.25)',
      },
    },
  },
  plugins: [],
}
