/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./assets/**/*.{js,jsx,ts,tsx}",
    "./templates/**/*.html.twig",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00f5d4",
        "secondary": "#ff9f1c",
        "background-light": "#f8f9fa",
        "background-dark": "#ffffff",
        "card-bg": "#ffffff",
        "text-main": "#1a1f2c",
        "text-muted": "#64748b"
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
