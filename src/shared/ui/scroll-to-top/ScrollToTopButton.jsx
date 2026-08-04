import { useCallback, useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa";
import { useLanguage } from "contexts";

const SCROLL_THRESHOLD_PX = 320;

const ScrollToTopButton = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      className="fixed right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border-none bg-navy text-white shadow-[0_4px_14px_rgba(21,33,71,0.35)] transition-all duration-200 hover:scale-105 hover:bg-active-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy md:right-6 md:h-12 md:w-12 bottom-[calc(var(--mobile-bottom-nav-height,0px)+var(--mobile-viewport-offset-bottom,0px)+1rem)] md:bottom-8"
      aria-label={t("scrollToTop.ariaLabel")}
    >
      <FaChevronUp size={18} aria-hidden="true" />
    </button>
  );
};

export default ScrollToTopButton;
