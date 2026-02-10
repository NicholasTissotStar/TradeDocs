module.exports = {
  theme: {
    extend: {
      colors: {
        customBlue: '#1DA1F2',
        customPink: '#FF61A6',
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              color: '#1DA1F2',
            },
            p: {
              color: '#333',
            },
          },
        },
      },
      boxShadow: {
        'custom-light': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 4px 8px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};