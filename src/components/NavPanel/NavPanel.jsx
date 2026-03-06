import React from "react";
import { useNavPanelPresenter } from "../../core/mvp/presenter";
import "./NavPanel.css";

function NavPanel() {
  const { navItems, activeIndex, handleSelect } = useNavPanelPresenter();

  return (
    <nav className="relative flex bg-white text-[#171717] py-5 my-3" aria-label="Main navigation menu">
      <div className="flex items-center w-full cont-width-default">
        <div className="shrink-0">
          <button
            className="flex items-center justify-around bg-navy text-white rounded px-2.5 py-1.5 mr-[26px] w-[130px] h-9 min-w-fit text-base font-medium border-none cursor-pointer lg:w-[160px] lg:h-[54px] lg:px-5 lg:py-[18px] lg:text-xs"
            aria-label="Open catalog"
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
                className={`nav-link flex items-center justify-center text-xs font-medium text-text-dark bg-transparent border-none cursor-pointer no-underline text-start px-2 py-1 w-fit max-w-[100px] h-auto min-h-9 leading-[1.3] tracking-[-0.7px] hover:text-blue-600 lg:px-3.5 lg:py-[18px] lg:max-w-[160px] lg:h-[54px] lg:min-h-0 lg:leading-normal lg:tracking-normal ${
                  index === activeIndex ? "!bg-subtle-bg !rounded-xl !text-navy" : ""
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
    </nav>
  );
}

export default NavPanel;
