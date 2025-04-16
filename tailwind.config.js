/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        background: "#f8fafc",
        "dark-primary": "#3b82f6",
        "dark-secondary": "#60a5fa",
        "dark-accent": "#93c5fd",
        "dark-background": "#111827",
      },
    },
  },
  plugins: [],
} 