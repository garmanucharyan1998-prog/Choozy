import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { HeaderWidget } from "widgets/header";
import { NavPanelWidget } from "widgets/nav-panel";
import { FooterWidget } from "widgets/footer";

/**
 * Shared shell for all pages except HomePage.
 * Provides Header, NavPanel, main content slot (Outlet), and Footer
 * with basic mobile-menu state management.
 */
const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((prev) => !prev), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMobileCatalog = useCallback(() => setIsMobileCatalogOpen((prev) => !prev), []);
  const closeMobileCatalog = useCallback(() => setIsMobileCatalogOpen(false), []);

  return (
    <div className="min-w-[320px] bg-white text-center">
      <div className="sticky top-0 z-[70] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
        <HeaderWidget
          isCompact={false}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
          onCloseMobileMenu={closeMobileMenu}
        />
        <NavPanelWidget
          isCompact={false}
          isMobileCatalogOpen={isMobileCatalogOpen}
          onToggleMobileCatalog={toggleMobileCatalog}
          onCloseMobileCatalog={closeMobileCatalog}
        />
      </div>

      <main className="bg-white min-h-[60vh] px-2.5 sm:px-[15px] md:px-[30px] lg:px-[50px] 2xl:px-[100px]">
        <Outlet />
      </main>

      <FooterWidget />
    </div>
  );
};

export default AppLayout;
