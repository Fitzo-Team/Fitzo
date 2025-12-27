/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#10002B',    // Tło całej aplikacji (Najciemniejszy)
          card: '#240046',    // Tło kafelków
          accent: '#3C096C',  // Ciemniejszy akcent
          primary: '#5A189A', // Główny fiolet
          vivid: '#7B2CBF',   // Żywy fiolet (do wykresów/ważnych ikon)
          light: '#9D4EDD',   // Jaśniejszy fiolet
          muted: '#C77DFF',   // Tekst drugorzędny (etykiety)
          text: '#E0AAFF',    // Główny tekst (Najjaśniejszy)
          flame: '#FF9100',
        },
      },
    },
  },
  plugins: [],
}