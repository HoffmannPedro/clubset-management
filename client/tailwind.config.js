/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0E1110",
        surface: "#161A18",
        border: "#262B28",
        text: "#E6EAE7",
        textMuted: "#A0A6A2",
        primary: "#2FA86E",
        secondary: "#C96A3D",
        terciary: "#4FA3A5",
        btn: "#2FA86E",
        btnHover: "#278E5E",
        btnText: "#0E1110",
      },
    },
  },
  plugins: [],
}