/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          light: '#A5B4FC',
          dark: '#4338CA',
          subtle: '#EEF2FF',
        },
        surface: '#FFFFFF',
        surfaceAlt: '#F2F2F7',
        border: '#E5E5EA',
        text: '#1C1C1E',
        textSecondary: '#6E6E73',
        success: '#34C759',
        warning: '#FF9F0A',
        danger: '#FF3B30',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
