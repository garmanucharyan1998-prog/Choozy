/**
 * The number that identifies one product everywhere on the comparison page — on its card, on its
 * column header, in the chart legends and on every bar lane.
 *
 * Colour alone could not do this job. Two of the four series colours (the amber and the teal)
 * cannot carry legible white text, so a filled badge would have made the one element that
 * identifies a lane the one element nobody could read; and a reader who cannot separate the
 * greens gets nothing from a swatch. The ring carries the series colour for people who can use
 * it, and the digit carries the identity for everyone.
 *
 * Extracted from `CompareBars`, where it started life, once the product cards and the table's
 * column headers needed the same token: a product that is "2" in the chart and unnumbered in the
 * table is two products as far as a reader scanning between them is concerned.
 */
export const CompareSeriesToken = ({ index, color, className = "" }) => (
  <span
    className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-bold leading-none text-navy ${className}`.trim()}
    style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }}
    aria-hidden="true"
  >
    {index + 1}
  </span>
);

export default CompareSeriesToken;
