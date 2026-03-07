import { FaChevronRight, FaTimes } from "react-icons/fa";
import { useNavPanelPresenter } from "features/nav-panel";
import "./NavPanel.css";

function NavPanel({
  isCompact = false,
  isMobileCatalogOpen = false,
  onToggleMobileCatalog,
  onCloseMobileCatalog,
}) {
  const { navItems, activeIndex, handleSelect } = useNavPanelPresenter();

  const handleCatalogToggle = () => {
    if (window.innerWidth >= 768) {
      return;
    }
    if (typeof onToggleMobileCatalog === "function") {
      onToggleMobileCatalog();
    }
  };

  const handleCatalogClose = () => {
    if (typeof onCloseMobileCatalog === "function") {
      onCloseMobileCatalog();
    }
  };

  return (
    <nav
      className={`relative flex bg-transparent text-[#171717] px-3 sm:px-5 lg:px-[50px] 2xl:px-[100px] transition-all duration-300 ${
        isCompact ? "pt-2 pb-3 sm:pt-2.5 sm:pb-5 mb-2 border-b-[3px] border-navy" : "py-3 sm:py-5 mb-3 border-b-0"
      }`}
      aria-label="Main navigation menu"
    >
      <div className="flex items-center w-full cont-width-default">
        <div className="shrink-0">
          <button
            type="button"
            className={`flex items-center justify-around bg-navy hover:bg-navy text-white rounded min-w-fit border-none cursor-pointer transition-all duration-300 ${
              isCompact
                ? "px-1.5 py-1 mr-2 w-[90px] h-7 text-xs sm:px-2 sm:mr-4 sm:w-[110px] sm:h-8 sm:text-sm lg:w-[145px] lg:h-[42px] lg:px-4 lg:py-2.5 lg:text-[11px]"
                : "px-2 py-1 mr-3 w-[105px] h-8 text-sm sm:px-2.5 sm:py-1.5 sm:mr-[26px] sm:w-[130px] sm:h-9 sm:text-base lg:w-[160px] lg:h-[54px] lg:px-5 lg:py-[18px] lg:text-xs"
            }`}
            aria-label="Open catalog"
            aria-expanded={isMobileCatalogOpen}
            onClick={handleCatalogToggle}
          >
            <img
              src="/assets/icons/catalog.svg"
              alt="Catalog icon"
              width="24"
              height="24"
            />
            {"Կատալոգ"}
          </button>
        </div>
        <div className="nav-items-container flex overflow-x-auto flex-1 min-w-0 justify-between items-center">
          {navItems.map((item, index) => (
            <div key={index} className="shrink-0">
              <button
                className={`nav-link flex items-center justify-center font-medium text-text-dark bg-transparent border-none cursor-pointer no-underline text-start w-fit h-auto hover:text-blue-600 transition-all duration-300 ${
                  isCompact
                    ? "text-[10px] px-1 py-0.5 max-w-[80px] min-h-6 leading-[1.2] tracking-[-0.5px] sm:text-[11px] sm:px-2 sm:py-1 sm:max-w-[96px] sm:min-h-7 sm:leading-[1.25] lg:px-3 lg:py-2.5 lg:max-w-[150px] lg:h-[42px] lg:min-h-0 lg:text-xs"
                    : "text-[11px] px-1 py-0.5 max-w-[85px] min-h-7 leading-[1.2] tracking-[-0.7px] sm:text-xs sm:px-2 sm:py-1 sm:max-w-[100px] sm:min-h-9 sm:leading-[1.3] lg:px-3.5 lg:py-[18px] lg:max-w-[160px] lg:h-[54px] lg:min-h-0 lg:leading-normal lg:tracking-normal"
                } ${
                  index === activeIndex ? "!bg-subtle-bg/65 !rounded-xl !text-navy" : ""
                }`}
                aria-label={item.aria}
                onClick={() => handleSelect(index)}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      <aside
        className={`fixed top-[var(--header-height,72px)] left-0 z-40 w-[85vw] max-w-[360px] h-[calc(100vh-var(--header-height,72px))] bg-white border-r border-[#e6e9f2] px-4 py-5 sm:px-6 sm:py-6 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform duration-[400ms] ease-in-out md:hidden ${
          isMobileCatalogOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile catalog panel"
      >
        <div className="flex items-center justify-between mb-7">
          <h3 className="m-0 text-[26px] sm:text-[34px] leading-none font-semibold text-navy">
            {"Կատալոգ"}
          </h3>
          <button
            type="button"
            onClick={handleCatalogClose}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-none bg-[#eceff3] text-navy flex items-center justify-center cursor-pointer"
            aria-label="Close catalog"
          >
            <FaTimes size={22} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex flex-col gap-5" aria-label="Catalog links">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center justify-between bg-transparent border-none p-0 text-left text-navy text-sm font-medium leading-normal cursor-pointer"
              onClick={handleCatalogClose}
            >
              <span>{item.label}</span>
              <FaChevronRight size={14} aria-hidden="true" />
            </button>
          ))}
        </nav>
      </aside>
    </nav>
  );
}

export default NavPanel;
