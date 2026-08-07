import "./ProgressiveImage.css";

/**
 * Thin <img> wrapper with a CSS-only fade-in.
 *
 * Renders exactly one image pointing at the final source:
 *  - native `loading="lazy"` actually defers off-screen images (an earlier version
 *    preloaded every source via `new Image()`, so nothing was ever deferred);
 *  - one request per image instead of a preview plus the original;
 *  - stateless markup, so the prerendered HTML and the hydrated tree always match —
 *    a load-driven CSS class differed between the two and broke hydration.
 *
 * Pass `width`/`height` (or size the wrapper) to reserve space and avoid layout shift.
 */
const ProgressiveImage = ({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  style,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  width,
  height,
  onError,
  "aria-hidden": ariaHidden,
}) => {
  if (!src) {
    return null;
  }

  return (
    <span className={`progressive-image ${className}`.trim()} style={style}>
      <img
        src={src}
        alt={alt}
        className={`progressive-image__media ${imgClassName}`.trim()}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        width={width}
        height={height}
        aria-hidden={ariaHidden}
        onError={onError}
      />
    </span>
  );
};

export default ProgressiveImage;
