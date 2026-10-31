/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        solar: {
          orange: '#F47C45',
          hover: '#E96D37',
          cream: '#F7F3E9',
          white: '#FFFFFF',
          charcoal: '#29343A',
          muted: '#7C817F',
          grey: '#EAE6DC',
          border: '#E6E1D7',
          success: '#23865B',
          warning: '#D99A35',
          error: '#D9534F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(41, 52, 58, 0.06)',
        panel: '0 8px 24px rgba(41, 52, 58, 0.08)',
      },
    },
  },
  plugins: [],
};
