import { useEffect, useRef, useState } from "react";

/**
 * Home page presenter.
 * Keeps page-level state and interaction rules out of the view.
 */
export const useHomePagePresenter = () => {
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const compactLockRef = useRef(false);
  const compactLockTimeoutRef = useRef(null);

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

  useEffect(() => {
    const COMPACT_ENTER_SCROLL = 72;
    const COMPACT_EXIT_SCROLL = 0;
    let ticking = false;

    const updateCompactState = () => {
      const currentScroll = window.scrollY || window.pageYOffset || 0;

      if (compactLockRef.current) {
        ticking = false;
        return;
      }

      setIsCompactHeader((prev) => {
        let next = prev;

        if (!prev && currentScroll > COMPACT_ENTER_SCROLL) {
          next = true;
        }
        if (prev && currentScroll <= COMPACT_EXIT_SCROLL) {
          next = false;
        }

        if (next !== prev) {
          compactLockRef.current = true;
          if (compactLockTimeoutRef.current) {
            window.clearTimeout(compactLockTimeoutRef.current);
          }
          compactLockTimeoutRef.current = window.setTimeout(() => {
            compactLockRef.current = false;
          }, 420);
        }

        return next;
      });

      ticking = false;
    };

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
      compactLockRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isCompactHeader && (window.scrollY || window.pageYOffset || 0) <= 96) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }
  }, [isCompactHeader]);

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
    isAnyMobilePanelOpen: isMobileMenuOpen || isMobileCatalogOpen,
    toggleMobileMenu,
    closeMobileMenu,
    toggleMobileCatalog,
    closeMobileCatalog,
    closeAllMobilePanels,
  };
};

export default useHomePagePresenter;
