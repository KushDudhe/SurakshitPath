/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { bg: '#09090B', surface: '#0F0F11', accent: '#00C3C9', muted: '#969696' },
      fontFamily: { sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
