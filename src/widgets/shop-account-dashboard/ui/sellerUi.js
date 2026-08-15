/**
 * The seller workspace's shared surface vocabulary.
 *
 * Not a design system — a short list of the class strings that have to be identical across the
 * sidebar, the toolbar, the table and the card list, kept in one place so "the focus ring" and
 * "a panel" mean one thing here instead of six near-identical ones (§40, §42, §43).
 *
 * Values come from the app's existing palette (`tailwind.config.js`) plus the neutral greys the
 * dashboard already used; nothing new was invented for this file.
 */

/** Every interactive control in the workspace shows the same ring. */
export const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-active-blue";

/** A panel: one hairline border, one very soft shadow. No stacked elevation anywhere (§43). */
const SURFACE = "rounded-[12px] border border-[#e1e6ef] bg-white";
export const SURFACE_RAISED = `${SURFACE} shadow-sm`;

/** Quiet fill used for table headers, toolbars and read-only strips. */
export const SUBTLE_FILL = "bg-[#f8fafc]";
export const HAIRLINE = "border-[#eef1f6]";

export const BUTTON_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-[10px] bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-active-blue ${FOCUS_RING}`;

export const BUTTON_SECONDARY = `inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#b8c8e8] bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-[#f4f6fb] ${FOCUS_RING}`;

export const BUTTON_GHOST = `inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-link-blue transition hover:bg-hover-blue ${FOCUS_RING}`;

/**
 * 32px clears the 24px WCAG 2.2 AA floor for a small target and is what a dense table row can
 * afford — three of them plus a divider is 121px of a column that also has to hold its padding.
 * The phone's card list passes `h-9 w-9` instead, where the row has the room and the finger
 * needs it.
 */
export const ICON_BUTTON = `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${FOCUS_RING}`;

export const FIELD =
  "box-border h-11 w-full min-w-0 max-w-full rounded-[10px] border border-[#b8c8e8] bg-white px-3 text-sm text-text-dark outline-none transition focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40";

/** Semantic fills, each with a text colour that clears AA on it. */
export const TONE = {
  positive: { fill: "bg-[#dcfce7]", text: "text-[#166534]", dot: "bg-[#16a34a]" },
  neutral: { fill: "bg-[#eef1f6]", text: "text-[#475569]", dot: "bg-[#94a3b8]" },
  warning: { fill: "bg-[#fef3c7]", text: "text-[#92400e]", dot: "bg-[#d97706]" },
  critical: { fill: "bg-[#fee2e2]", text: "text-[#991b1b]", dot: "bg-[#dc2626]" },
};

/**
 * Motion is opt-in per element rather than global, and every animated element pairs its
 * transition with `motion-reduce:transition-none` so a visitor who asked for less gets it (§34).
 */
export const MOTION_SAFE = "motion-reduce:transition-none motion-reduce:transform-none";
