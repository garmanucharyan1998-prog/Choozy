import {
  clampUnit,
  labelLayout,
  polarToCartesian,
  polygonPoints,
  ringPoints,
  wrapLabel,
} from "./radarMath";

/**
 * A comparison radar drawn as plain SVG.
 *
 * Nothing here measures the DOM, so the whole chart exists in the server's HTML — the reason it
 * is hand-drawn rather than handed to recharts, whose `ResponsiveContainer` needs a measured
 * box and would render nothing on the server and then pop in on hydration. `/compare/<a>-vs-<b>`
 * is an indexable page; a chart that only appears after hydration is a chart the crawler never
 * sees, and a layout shift for everyone else.
 *
 * Sizing is the `viewBox`'s job: `width: 100%` with `height: auto` lets the browser derive the
 * height from the aspect ratio, so the chart scales from a 320px phone to a desktop card with no
 * JavaScript and no breakpoints. Labels are real `<text>` nodes, so they inherit the page font in
 * all three locales — a canvas chart would need the font plumbed in by hand and would hand a
 * screen reader nothing at all.
 *
 * This component knows nothing about products: it lives in `shared/ui`, which may not import
 * `entities`, and takes already-normalized scores. `widgets/product-compare/ui/CompareRadar`
 * is where products, colours and translations meet it.
 */

const VIEWBOX_WIDTH = 360;
const VIEWBOX_HEIGHT = 268;
const CENTER_X = 180;
const CENTER_Y = 126;
const RADIUS = 88;
/**
 * Labels ride outside the outer ring, and the `viewBox` is wider than the chart is tall to leave
 * room for them: the two side spokes carry the longest words, and Armenian runs ~1.5x the length
 * of the same label in English.
 */
const LABEL_RADIUS = 104;
const RING_LEVELS = 4;

const GRID_STROKE = "#dde3f8";
const LABEL_FILL = "#696969";
const LABEL_FONT_SIZE = 10;
const LINE_HEIGHT = "1.05em";

/**
 * Where a label's *first* line starts, so that a one- or two-line label still reads as belonging
 * to its own spoke: an "above" label grows upward from the point, a "below" one downward, and a
 * side label centres on it.
 */
const firstLineDy = (vertical, lineCount) => {
  if (vertical === "above") return lineCount > 1 ? "-1.05em" : "0em";
  if (vertical === "below") return "0.85em";
  return lineCount > 1 ? "-0.2em" : "0.32em";
};

/**
 * @param {{
 *   axes: { id: string, label: string }[],
 *   items: { id: string, label: string, color: string, values: number[] }[],
 *   ariaLabel: string,
 * }} props — `values` are 0–1 scores, one per axis, in axis order.
 */
export const RadarChart = ({ axes = [], items = [], ariaLabel }) => {
  const axisCount = axes.length;
  const drawable = items.filter((item) => Array.isArray(item.values));

  /**
   * Below three axes the outline degenerates into a line or a point — a shape that reads as a
   * broken chart rather than as a comparison, so there is nothing worth drawing.
   */
  if (axisCount < 3 || drawable.length === 0) return null;

  const rings = Array.from({ length: RING_LEVELS }, (_, index) => index + 1);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className="block h-auto w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <g aria-hidden="true">
        {rings.map((level) => (
          <polygon
            key={`ring-${level}`}
            points={ringPoints(level, RING_LEVELS, CENTER_X, CENTER_Y, RADIUS, axisCount)}
            fill="none"
            stroke={GRID_STROKE}
            strokeWidth="1"
          />
        ))}

        {axes.map((axis, index) => {
          const { x, y } = labelLayout(index, axisCount, CENTER_X, CENTER_Y, RADIUS);
          return (
            <line
              key={`spoke-${axis.id}`}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={x}
              y2={y}
              stroke={GRID_STROKE}
              strokeWidth="1"
            />
          );
        })}
      </g>

      {/**
       * Outlines paint in selection order and each is translucent, so an overlap stays legible
       * as an overlap rather than as whichever product happened to be added last.
       */}
      {drawable.map((item) => (
        <polygon
          key={`area-${item.id}`}
          points={polygonPoints(item.values, CENTER_X, CENTER_Y, RADIUS, axisCount)}
          fill={item.color}
          fillOpacity="0.28"
          stroke={item.color}
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <title>{item.label}</title>
        </polygon>
      ))}

      {/** Vertices, so two outlines that nearly coincide on an axis still read as two. */}
      {drawable.map((item) =>
        axes.map((axis, index) => {
          const { x, y } = polarToCartesian(
            CENTER_X,
            CENTER_Y,
            RADIUS * clampUnit(item.values[index]),
            index,
            axisCount,
          );
          return (
            <circle
              key={`dot-${item.id}-${axis.id}`}
              cx={x}
              cy={y}
              r="2.2"
              fill={item.color}
              aria-hidden="true"
            />
          );
        }),
      )}

      <g aria-hidden="true">
        {axes.map((axis, index) => {
          const { x, y, anchor, vertical } = labelLayout(
            index,
            axisCount,
            CENTER_X,
            CENTER_Y,
            LABEL_RADIUS,
          );
          const lines = wrapLabel(axis.label);
          return (
            <text
              key={`label-${axis.id}`}
              x={x}
              y={y}
              textAnchor={anchor}
              fontSize={LABEL_FONT_SIZE}
              fontWeight="600"
              fill={LABEL_FILL}
            >
              {lines.map((line, lineIndex) => (
                <tspan
                  key={line}
                  x={x}
                  dy={lineIndex === 0 ? firstLineDy(vertical, lines.length) : LINE_HEIGHT}
                >
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </g>
    </svg>
  );
};

export default RadarChart;
