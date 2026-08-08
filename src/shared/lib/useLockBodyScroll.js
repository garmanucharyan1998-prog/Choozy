import { useEffect } from "react";

/**
 * Locks page scroll behind an open mobile drawer/overlay (filter drawer, mobile nav,
 * mobile catalog panel, ...). Shared so every panel restores the exact previous inline
 * `overflow` value rather than assuming it was empty, and so nested/sequential panels
 * don't clobber each other's restore value.
 */
export const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
};

export default useLockBodyScroll;
