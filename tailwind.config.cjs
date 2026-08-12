/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',          // 添加这一行
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A84FF',
          hover: '#0066CC',
        },
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
      },
    },
  },
  plugins: [],
};