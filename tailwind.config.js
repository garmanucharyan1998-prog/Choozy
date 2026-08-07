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
        /* Contrast on white: 5.5:1 — passes WCAG AA for body text. */
        'text-muted': '#696969',
        /* Was #797979 (4.35:1), just under the 4.5:1 AA threshold. Now 5.5:1. */
        'text-service': '#696969',
      },
      borderRadius: {
        'pill': '35px',
      },
    },
  },
  plugins: [],
};
