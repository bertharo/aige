/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        kinness: {
          accent: '#5B4FE8',
          'accent-light': '#EEEDFE',
          'accent-dark': '#3C3489',
          page: '#F7F7F6',
          muted: '#6B6B68',
        },
      },
      fontFamily: {
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        site: '1120px',
      },
    },
  },
  plugins: [],
};
