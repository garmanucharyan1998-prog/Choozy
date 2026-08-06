import { useEffect, useState } from "react";
import { resolveProgressiveImageSources } from "shared/lib/progressiveImageSrc";
import "./ProgressiveImage.css";

/**
 * Shows a compressed preview first, then swaps to the original high-quality
 * image once it has fully loaded.
 */
const ProgressiveImage = ({
  src,
  lowSrc: lowSrcProp,
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
  const { highSrc, lowSrc } = resolveProgressiveImageSources(src, lowSrcProp);
  const [displaySrc, setDisplaySrc] = useState(lowSrc || highSrc);
  const [isHighReady, setIsHighReady] = useState(!lowSrc);
  const [lowFailed, setLowFailed] = useState(false);

  useEffect(() => {
    const next = resolveProgressiveImageSources(src, lowSrcProp);
    setDisplaySrc(next.lowSrc || next.highSrc);
    setIsHighReady(!next.lowSrc);
    setLowFailed(false);

    if (!next.highSrc) {
      return undefined;
    }

    let cancelled = false;
    const preloader = new Image();

    preloader.onload = () => {
      if (cancelled) return;
      setDisplaySrc(next.highSrc);
      setIsHighReady(true);
    };

    preloader.onerror = () => {
      if (cancelled) return;
      setDisplaySrc(next.highSrc);
      setIsHighReady(true);
    };

    preloader.src = next.highSrc;

    if (preloader.complete && preloader.naturalWidth > 0) {
      setDisplaySrc(next.highSrc);
      setIsHighReady(true);
    }

    return () => {
      cancelled = true;
      preloader.onload = null;
      preloader.onerror = null;
    };
  }, [src, lowSrcProp]);

  const handleError = (event) => {
    if (!lowFailed && lowSrc && displaySrc === lowSrc) {
      setLowFailed(true);
      setDisplaySrc(highSrc);
      setIsHighReady(true);
      return;
    }
    onError?.(event);
  };

  if (!highSrc) {
    return null;
  }

  return (
    <span className={`progressive-image ${className}`.trim()} style={style}>
      <img
        src={displaySrc}
        alt={alt}
        className={`progressive-image__media ${isHighReady ? "progressive-image__media--ready" : "progressive-image__media--preview"} ${imgClassName}`.trim()}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        width={width}
        height={height}
        aria-hidden={ariaHidden}
        onError={handleError}
      />
    </span>
  );
};

export default ProgressiveImage;
