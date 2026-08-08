/**
 * Canonical breakpoints (px), matching `tailwind.config.js`'s `theme.extend.screens`.
 *
 * `tailwind.config.js` is loaded by Node outside the Vite/ESM graph, so it can't `import`
 * this file directly — keep the two in sync by hand and treat this module as the source of
 * truth. Anything that picks its own breakpoints in JS (Swiper's `breakpoints` prop, mostly)
 * should read from here instead of hardcoding numbers, so the app never grows a breakpoint
 * that doesn't correspond to any Tailwind screen.
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
};

export default BREAKPOINTS;
