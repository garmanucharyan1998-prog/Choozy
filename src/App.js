import { useEffect, useRef, useState } from "react";
import Header from "./components/Header/Header";
import NavPanel from "./components/NavPanel/NavPanel";
import GridCatalog from "./components/sections/GridCatalog/GridCatalog";
import TopProducts from "./components/sections/TopProducts/TopProducts";
import AboutUs from "./components/sections/AboutUs/AboutUs";
import Variety from "./components/sections/Variety/Variety";
import ServicesOverview from "./components/sections/ServicesOverview/ServicesOverview";
import Footer from "./components/Footer/Footer";

function App() {
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const compactLockRef = useRef(false);
  const compactLockTimeoutRef = useRef(null);

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
    // Prevent scroll-jump loop when expanding near top.
    if (!isCompactHeader && (window.scrollY || window.pageYOffset || 0) <= 96) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }
  }, [isCompactHeader]);

  return (
    <div className="min-w-[360px] bg-white text-center">
      <div
        className={`sticky top-0 z-[70] bg-white/70 backdrop-blur-md transition-all duration-300 ${
          isCompactHeader ? "shadow-[0_6px_18px_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        <Header isCompact={isCompactHeader} />
        <NavPanel isCompact={isCompactHeader} />
      </div>
      <main className="bg-white px-[15px] md:px-[30px] lg:px-[50px] 2xl:px-[100px]">
        <GridCatalog />
        <TopProducts />
        <AboutUs />
        <Variety />
        <ServicesOverview />
      </main>
      <Footer />
    </div>
  );
}

export default App;
