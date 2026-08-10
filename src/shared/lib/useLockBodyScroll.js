import { useEffect } from "react";

/**
 * Locks page scroll behind an open mobile drawer/overlay (filter drawer, mobile nav,
 * mobile catalog panel, login modal, ...).
 *
 * Counted at module scope rather than each caller remembering the value it saw: two panels
 * can be open at once (the login modal over the mobile menu), and each effect captured
 * `body.style.overflow` at *its own* mount. Closing the first one then restored `""` while
 * the second was still open — scrolling behind an open overlay — and closing the second
 * restored `"hidden"`, leaving the page permanently unscrollable. Only the first lock reads
 * the original value and only the last release writes it back.
 */
let lockCount = 0;
let overflowBeforeFirstLock = "";

const acquireLock = () => {
  if (lockCount === 0) {
    overflowBeforeFirstLock = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
};

const releaseLock = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = overflowBeforeFirstLock;
  }
};

export const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    acquireLock();
    return releaseLock;
  }, [locked]);
};

export default useLockBodyScroll;
