/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          primary: '#123B35',
          'primary-dark': '#0A2420',
          'primary-light': '#1A534B',
          secondary: '#16A36A',
          'secondary-hover': '#128254',
          'secondary-light': '#E8F7F0',
          accent: '#F4B740',
          'accent-hover': '#DF9E27',
          'accent-light': '#FEF8EB',
          bg: '#F7F9F8',
          surface: '#FFFFFF',
          text: '#1F2937',
          'text-muted': '#6B7280',
          'text-light': '#9CA3AF',
          border: '#E5E7EB',
          'border-focus': '#16A36A',
          info: '#2563EB',
          'info-light': '#EFF6FF',
          warning: '#DC6B35',
          'warning-light': '#FEF2EC',
          danger: '#DC2626',
          'danger-light': '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(18, 59, 53, 0.05), 0 1px 2px -1px rgba(18, 59, 53, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(18, 59, 53, 0.08), 0 4px 6px -4px rgba(18, 59, 53, 0.04)',
        modal: '0 20px 25px -5px rgba(18, 59, 53, 0.15), 0 8px 10px -6px rgba(18, 59, 53, 0.1)',
      },
    },
  },
  plugins: [],
}
