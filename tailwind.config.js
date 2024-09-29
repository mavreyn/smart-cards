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
          DEFAULT: '#1D4ED8', // Replace this with your desired primary color
          dark: '#0F1A77',    // Optional: dark variant
          light: '#5A95E6',   // Optional: light variant
        },
      },
      keyframes: {
        upDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(30px)' }, // Adjust the height as needed
        },
      },
      animation: {
        upDown: 'upDown 4s ease-in-out infinite', // Adjust duration and timing as needed
      },
    },
  },
  plugins: [],
}
