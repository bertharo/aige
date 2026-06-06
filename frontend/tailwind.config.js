module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kinness: {
          primary: '#5A4FF7',
          accent: '#EEEDFE',
          text: '#0a0a0a',
        },
        landing: {
          accent: '#5B4FE8',
          'accent-light': '#EEEDFE',
          'accent-dark': '#3C3489',
          muted: '#6B6B68',
          page: '#F7F7F6',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      maxWidth: {
        landing: '1120px',
      },
      minHeight: {
        tap: '44px',
      },
    },
  },
  plugins: [],
};
