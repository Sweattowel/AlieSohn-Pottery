/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/**/*.html",
    "./src/**/*.js",
    "./src/**/*.jsx",
    "./src/**/*.ts",
    "./src/**/*.tsx",
  ],
  theme: {
    colors: {
      'BLACK': '#000000',
      'WHITE': '#ffffff',
      'TEXT': '#8ca9d3',
      'BACKGROUND': '#dc2626',
      'SELECTED': '#dc2626',
    },
    extend: {},
  },
  plugins: [],
}

