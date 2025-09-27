/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fbd7ad',
          300: '#f8ba79',
          400: '#f59343',
          500: '#f2741e',
          600: '#e35a14',
          700: '#bc4413',
          800: '#963717',
          900: '#792f16',
        },
      },
    },
  },
  plugins: [],
}
