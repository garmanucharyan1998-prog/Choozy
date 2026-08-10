import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLockBodyScroll } from "shared/lib/useLockBodyScroll";

/**
 * Site shell presenter — sticky header/nav chrome shared by every page.
 * Keeps page-level state and interaction rules out of the view.
 */
export const useSiteShellPresenter = () => {
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const compactLockRef = useRef(false);
  const compactLockTimeoutRef = useRef(null);
  const updateCompactStateRef = useRef(null);

  /**
   * Sticky header shell metrics.
   * The shell is taken out of the document flow (absolutely positioned inside
   * a spacer), so growing back to the expanded height never pushes the page
   * content down. The spacer keeps reserving the expanded height instead.
   */
  const headerShellRef = useRef(null);
  const expandedShellHeightRef = useRef(0);
  const compactShellHeightRef = useRef(0);
  const compactExitScrollRef = useRef(0);
  const isCompactHeaderRef = useRef(isCompactHeader);

  const toggleMobileMenu = () => {
    setIsMobileCatalogOpen(false);
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileCatalog = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCatalogOpen((prev) => !prev);
  };

  const closeMobileCatalog = () => {
    setIsMobileCatalogOpen(false);
  };

  const closeAllMobilePanels = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCatalogOpen(false);
  };

  const isAnyMobilePanelOpen = isMobileMenuOpen || isMobileCatalogOpen;
  useLockBodyScroll(isAnyMobilePanelOpen);

  useLayoutEffect(() => {
    isCompactHeaderRef.current = isCompactHeader;
  }, [isCompactHeader]);

  useLayoutEffect(() => {
    const shell = headerShellRef.current;
    if (!shell) {
      return undefined;
    }

    const COMPACT_ENTER_SCROLL = 72;
    /** Height animates for 300ms — only the settled value is worth storing. */
    const SETTLE_DELAY_MS = 80;
    let settleTimeoutId = null;

    const commitShellMetrics = () => {
      const height = shell.getBoundingClientRect().height;
      if (height <= 0) {
        return;
      }

      if (isCompactHeaderRef.current) {
        compactShellHeightRef.current = height;
      } else {
        expandedShellHeightRef.current = height;
        /**
         * Published as a CSS variable rather than React state: an inline height in the
         * markup would differ between the prerendered HTML (measured) and the first
         * client render (unmeasured), breaking hydration. The CSS fallback also keeps
         * the spacer from collapsing on the first paint, which used to shift the page.
         */
        document.documentElement.style.setProperty("--header-shell-height", `${height}px`);
      }

      /**
       * Leaving compact mode exactly when the reserved spacer no longer sticks
       * out below the compact shell keeps the content flush with the header.
       */
      const shellHeightDelta =
        expandedShellHeightRef.current && compactShellHeightRef.current
          ? expandedShellHeightRef.current - compactShellHeightRef.current
          : 0;
      compactExitScrollRef.current = Math.min(
        Math.max(0, Math.round(shellHeightDelta)),
        COMPACT_ENTER_SCROLL - 8,
      );
    };

    const scheduleShellMetricsCommit = () => {
      if (settleTimeoutId) {
        window.clearTimeout(settleTimeoutId);
      }
      settleTimeoutId = window.setTimeout(commitShellMetrics, SETTLE_DELAY_MS);
    };

    // First measurement is not animated, so it can be committed synchronously.
    commitShellMetrics();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleShellMetricsCommit);
      resizeObserver.observe(shell);
    }

    window.addEventListener("resize", scheduleShellMetricsCommit);
    window.addEventListener("orientationchange", scheduleShellMetricsCommit);

    return () => {
      if (settleTimeoutId) {
        window.clearTimeout(settleTimeoutId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", scheduleShellMetricsCommit);
      window.removeEventListener("orientationchange", scheduleShellMetricsCommit);
      document.documentElement.style.removeProperty("--header-shell-height");
    };
  }, []);

  useEffect(() => {
    const COMPACT_ENTER_SCROLL = 72;
    let ticking = false;

    const updateCompactState = () => {
      const currentScroll = window.scrollY || window.pageYOffset || 0;

      if (compactLockRef.current) {
        ticking = false;
        return;
      }

      /**
       * The transition is decided out here, against the ref that mirrors the state, rather
       * than inside a `setIsCompactHeader` updater. React may call an updater more than once
       * (StrictMode, a replayed render), and this one armed the lock ref and scheduled a
       * timeout — the very state machine that gates the whole compact-header behaviour, so a
       * double invocation double-scheduled and could leave the lock stuck on.
       */
      const prev = isCompactHeaderRef.current;
      let next = prev;
      if (!prev && currentScroll > COMPACT_ENTER_SCROLL) {
        next = true;
      }
      if (prev && currentScroll <= compactExitScrollRef.current) {
        next = false;
      }

      if (next !== prev) {
        isCompactHeaderRef.current = next;
        setIsCompactHeader(next);

        compactLockRef.current = true;
        if (compactLockTimeoutRef.current) {
          window.clearTimeout(compactLockTimeoutRef.current);
        }
        compactLockTimeoutRef.current = window.setTimeout(() => {
          compactLockRef.current = false;
          // Re-check: the scroll position may have settled while locked.
          updateCompactStateRef.current?.();
        }, 420);
      }

      ticking = false;
    };

    updateCompactStateRef.current = updateCompactState;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateCompactState);
        ticking = true;
      }
    };

    updateCompactState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (compactLockTimeoutRef.current) {
        window.clearTimeout(compactLockTimeoutRef.current);
      }
      updateCompactStateRef.current = null;
      compactLockRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsMobileCatalogOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isCompactHeader,
    isMobileMenuOpen,
    isMobileCatalogOpen,
    isAnyMobilePanelOpen,
    toggleMobileMenu,
    closeMobileMenu,
    toggleMobileCatalog,
    closeMobileCatalog,
    closeAllMobilePanels,
    headerShellRef,
  };
};

export default useSiteShellPresenter;
