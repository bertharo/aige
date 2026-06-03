module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kinness: {
          primary: '#2D6A4F',
          accent: '#95D5B2',
          text: '#1B1B1B',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      minHeight: {
        tap: '44px',
      },
    },
  },
  plugins: [],
};
