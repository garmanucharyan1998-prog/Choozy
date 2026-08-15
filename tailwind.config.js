const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['MontserratArm', 'Montserrat', 'sans-serif'],
        system: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      /*
       * Keep in sync with src/shared/config/breakpoints.js — this file is loaded by
       * Node outside the Vite/ESM graph, so it can't import that module directly.
       */
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
      /*
       * The one motion in the app that says something rather than decorates: a bar that owns the
       * bottom edge of the screen — the compare tray, the seller's bulk action bar — arrives from
       * below, so it reads as sliding into the corner it lives in rather than appearing on top of
       * the content. 180ms is under the threshold where a transition starts to feel like a wait.
       *
       * Every user of this pairs it with `motion-reduce:animate-none`; nothing here animates for
       * a visitor who asked for less motion.
       */
      keyframes: {
        'rise-in': {
          from: { transform: 'translateY(0.75rem)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'rise-in': 'rise-in 180ms ease-out',
      },
    },
  },
  plugins: [
    /*
     * `short` — a viewport too short to spend on pinned chrome: a phone held sideways, or a
     * desktop window squashed to the same shape. Measured on a 667x375 landscape phone: the
     * pinned header holds 180px and the fixed bottom nav another 92px, leaving 103px of the 375
     * for the page itself. 500px clears every phone in portrait (the shortest common one is
     * 568px tall) and every tablet and desktop window, so it only takes effect where the trade
     * is actually bad.
     *
     * Registered as a variant rather than as a `screens` entry, and that is not cosmetic.
     * Tailwind disables the whole `min-[...]`/`max-[...]` arbitrary-breakpoint family as soon
     * as ONE screen is declared as an object — it warns "The `min-*` and `max-*` variants are
     * not supported with a `screens` configuration containing objects" and then silently emits
     * nothing for them. `short: { raw: ... }` was that object, so every `min-[425px]:` and
     * `min-[560px]:` class in this codebase compiled to no CSS at all: the seller dashboard's
     * "Add product" button was meant to stop being full-width at 425px and never did, at any
     * width. Declared here, the arbitrary breakpoints work.
     *
     * One thing does change: a plugin variant is emitted *before* the width screens rather than
     * after `2xl`, so a `short:` utility no longer outranks a same-property `md:`/`lg:` one at
     * equal specificity. Nothing in this codebase pairs them — `short:` is used twice, both
     * times against a base utility (`sticky` in SiteShell, `scroll-mt-[…]` in
     * ProductCompareWidget), and base utilities are emitted before every media block.
     */
    plugin(({ addVariant }) => {
      addVariant('short', '@media (max-height: 500px)');
    }),
  ],
};
