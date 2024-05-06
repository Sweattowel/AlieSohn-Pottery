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
      'RED': '#FF0000',
      'GREY': "#eacebe",
      'LIGHT': '#F8F7F2',
      'DARK': '#22577A',
      'HIGHLIGHT': '#FB3640',

      'TEXT': '#8ca9d3',
      'BACKGROUND': '#dc2626',
      'SELECTED': '#dc2626',
    },
    extend: {},
  },
  plugins: [],
}

