/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['MontserratArm', 'Montserrat', 'sans-serif'],
        system: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
      maxWidth: {
        'site': '1800px',
      },
      colors: {
        navy: '#152147',
        'navy-light': '#2f4eb4',
        'link-blue': '#43579c',
        'active-blue': '#3a4fe0',
        'accent-blue': '#dce3ff',
        'border-blue': '#dde3f8',
        'hover-blue': '#e8efff',
        'subtle-bg': '#f2f4f9',
        'input-bg': '#f1f3f6',
        'card-bg': '#f6f6f6',
        'section-bg': '#f9f9f9',
        'text-dark': '#1f2937',
        'text-muted': '#696969',
        'text-service': '#797979',
      },
      borderRadius: {
        'pill': '35px',
      },
    },
  },
  plugins: [],
};
