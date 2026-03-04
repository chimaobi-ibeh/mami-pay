/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#075f47',
          dark: '#064e3b',
          light: '#0a7a5c',
        }
      }
    },
  },
  plugins: [],
}
