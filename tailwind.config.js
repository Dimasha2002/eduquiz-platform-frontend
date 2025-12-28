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
          DEFAULT: '#dc2626', // red-600
          dark: '#991b1b', // red-800
          light: '#f87171', // red-400
        },
        secondary: {
          DEFAULT: '#fbbf24', // yellow-400
          dark: '#f59e0b', // yellow-500
          light: '#fde68a', // yellow-200
        },
      },
    },
  },
  plugins: [],
}
