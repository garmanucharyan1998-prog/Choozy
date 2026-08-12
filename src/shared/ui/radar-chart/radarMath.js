/**
 * The geometry behind the comparison radar, kept as pure functions so the shape can be asserted
 * without a DOM and so the component next door reads as markup rather than trigonometry.
 *
 * Every coordinate comes from a fixed `viewBox`, never from a measured element. A chart that
 * measures its container renders at zero size on the server and pops into place on hydration —
 * which is precisely what `/compare/<a>-vs-<b>` cannot afford, since those pages are indexable
 * and their chart has to exist in the server's HTML. It is also why recharts (already a
 * dependency, and used for the price history via `ResponsiveContainer`) is deliberately not
 * used here.
 */

/** SVG's y axis grows downward, and an axis list reads clockwise from straight up. */
const ANGLE_OFFSET = -Math.PI / 2;

/**
 * Two decimals sits well under a device pixel at this size, and keeps the emitted `points`
 * attributes short — a polygon's worth of unrounded floats is ~4x the bytes for no visible gain
 * on a page whose whole point is being cheap to serve.
 */
const round = (value) => Math.round(value * 100) / 100;

/**
 * Scores arrive normalized, but a caller that hands over a raw value would otherwise draw a
 * vertex outside the grid and silently break the chart's scale.
 */
export const clampUnit = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

export const axisAngle = (index, axisCount) => ANGLE_OFFSET + (index * 2 * Math.PI) / axisCount;

export const polarToCartesian = (cx, cy, radius, index, axisCount) => {
  const angle = axisAngle(index, axisCount);
  return { x: round(cx + radius * Math.cos(angle)), y: round(cy + radius * Math.sin(angle)) };
};

/** One product's outline: its own score along each axis, in axis order. */
export const polygonPoints = (values, cx, cy, radius, axisCount) =>
  Array.from({ length: axisCount }, (_, index) => {
    const { x, y } = polarToCartesian(cx, cy, radius * clampUnit(values[index]), index, axisCount);
    return `${x},${y}`;
  }).join(" ");

/** One background grid ring, at `level` of `levels` counting outward from the centre. */
export const ringPoints = (level, levels, cx, cy, radius, axisCount) => {
  const ringRadius = radius * (level / levels);
  return Array.from({ length: axisCount }, (_, index) => {
    const { x, y } = polarToCartesian(cx, cy, ringRadius, index, axisCount);
    return `${x},${y}`;
  }).join(" ");
};

/**
 * Where an axis label sits and which way it hangs off its spoke. A label on the left of the
 * chart has to grow leftward and one on the right rightward, or long words lie across the
 * polygon they are supposed to be labelling.
 *
 * `vertical` is a band, not a sign: on a pentagon the two upper-side spokes point only slightly
 * upward, and treating them as "above" would lift their labels off their own spokes. Only a
 * spoke in the top or bottom fifth of the circle gets the shifted baseline.
 */
export const labelLayout = (index, axisCount, cx, cy, radius) => {
  const { x, y } = polarToCartesian(cx, cy, radius, index, axisCount);
  const dx = x - cx;
  const dy = y - cy;
  /** A one-unit band around the centre line, so a spoke vertical within rounding reads as vertical. */
  const anchor = Math.abs(dx) < 1 ? "middle" : dx > 0 ? "start" : "end";
  const ratio = radius === 0 ? 0 : dy / radius;
  const vertical = ratio < -0.5 ? "above" : ratio > 0.5 ? "below" : "middle";
  return { x, y, anchor, vertical };
};

/**
 * Splits a label across at most two lines. SVG `<text>` does not wrap, and the three locales
 * behave differently here: English "Refresh rate" and Russian are two words and split cleanly,
 * while the Armenian for the same attribute is a single word that must be left whole rather
 * than broken mid-word. A single long word therefore stays on one line by design — the fix for
 * that case is a shorter translation, not a hyphenation algorithm.
 */
export const wrapLabel = (label, maxChars = 10) => {
  const text = typeof label === "string" ? label.trim() : "";
  if (!text) return [];
  if (text.length <= maxChars || !text.includes(" ")) return [text];

  const words = text.split(/\s+/);
  const middle = Math.ceil(words.length / 2);
  const first = words.slice(0, middle).join(" ");
  const second = words.slice(middle).join(" ");
  return second ? [first, second] : [first];
};
