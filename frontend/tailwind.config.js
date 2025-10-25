/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ghost-purple': '#667eea',
        'ghost-dark': '#764ba2',
      }
    },
  },
  plugins: [],
}