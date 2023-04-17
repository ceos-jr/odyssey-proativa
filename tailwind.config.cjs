/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2196f2",
        secondary: "#ffc107",
        terciary: "#2860ff",
        accent: "#ff9100",
      },
      fontFamily: {
        inter: ["var(--font-inter)", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
