/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        secondary: "#151312",
        primary: {
          600: "#E50914",
          700: "#B2070F",
          800: "#8A0000",
        },
        light: {
          100: "#F5F5F5",
          200: "#EAEAEA",
          300: "#D9D9D9",
          400: "#BFBFBF",
          500: "#F3F4F6",
        },
      
        background: {
          dark: "#141414",
          light: "#FFFFFF",
        },
        dark: {
          100: "#221F3D",
          200: "#0F0D23",
        },
        accent: "#AB8BFF",
        yellow: "#FACC15", 
        green: "#34D399",
      },
    },
  },
  plugins: [],
};
