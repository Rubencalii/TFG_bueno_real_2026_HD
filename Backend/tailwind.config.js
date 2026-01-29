/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./assets/**/*.{js,jsx,ts,tsx}",
    "./templates/**/*.html.twig",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales según diseño.md
        "primary": {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        "secondary": {
          DEFAULT: "#F97316",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
        },
        
        // Sistema semáforo
        "semaforo": {
          "verde": "#10B981",
          "amarillo": "#F59E0B",
          "rojo": "#EF4444",
        },
        
        // Alertas
        "alerta": {
          "critica": "#DC2626",
          "exito": "#059669",
          "info": "#2563EB",
          "advertencia": "#F59E0B",
        },

        // Textos y fondos
        "background-light": "#F9FAFB",
        "background-dark": "#1F2937",
        "card-bg": "#FFFFFF",
        "text-main": "#1F2937",
        "text-muted": "#6B7280",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
