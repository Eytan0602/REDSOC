module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class', // <--- clave
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        'primary-light': '#f093fb',
        'dark-bg': '#000000',
        'dark-card': '#111111',
        'dark-border': '#1f1f1f',
        'dark-hover': '#222222',
        'gray-text': '#9CA3AF',
        'gray-secondary': '#4B5563',
        'white-smoke': '#fdfdfd96',
      },
    },
  },
  plugins: [],
};
