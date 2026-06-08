/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        base: '#FBF8F3',
        cream: '#E8DDD0',
        surface: '#FFFFFF',
        mocha: '#542E1D',
        accent: '#A67C52',
        'accent-soft': '#C9A57E',
        ink: '#542E1D',
        muted: '#542E1D',
      },
      fontFamily: {
        script: ['"Pinyon Script"', 'cursive'],
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(60, 40, 20, 0.06)',
        card: '0 4px 24px rgba(60, 40, 20, 0.06)',
      },
    },
  },
  plugins: [],
}
