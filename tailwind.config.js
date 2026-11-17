/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      // Followly's own typefaces, loaded in src/hooks/use-app-fonts.ts.
      fontFamily: {
        sans: ['FollowlySans-Regular'],
        medium: ['FollowlySans-Medium'],
        semibold: ['FollowlySans-SemiBold'],
        display: ['FollowlyDisplay-Bold'],
        black: ['FollowlyDisplay-Black'],
      },
      // Keep these values aligned with src/theme/colors.ts.
      colors: {
        background: '#000000',
        'background-secondary': '#000000',
        'background-tertiary': '#0A0A0A',
        surface: '#121212',
        'surface-raised': '#262626',
        'surface-elevated': '#363636',
        primary: '#0095F6',
        'primary-dark': '#0074CC',
        'sun-yellow': '#FEDA75',
        'sun-orange': '#FA7E1E',
        accent: '#D62976',
        violet: '#962FBF',
        teal: '#4F5BD5',
        success: '#58C322',
        danger: '#ED4956',
        warning: '#FFB547',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A8A8A8',
        'text-muted': '#737373',
        border: '#262626',
        'border-strong': '#363636',
      },
    },
  },
  plugins: [],
};
