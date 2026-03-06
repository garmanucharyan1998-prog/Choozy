import React from "react";
import { useNavPanelPresenter } from "../../core/mvp/presenter";
import "./NavPanel.css";

function NavPanel() {
  const { navItems, activeIndex, handleSelect } = useNavPanelPresenter();

  return (
    <nav className="nav-panel" aria-label="Main navigation menu">
      <div className="nav-list flex cont-width-default">
        <div>
          <button className="nav-button catalog-btn" aria-label="Open catalog">
            <img 
              src="/assets/icons/catalog.svg" 
              alt="Catalog icon" 
              width="24" 
              height="24"
            />
            Կատալոգ
          </button>
        </div>
        <div className="nav-items-container">
          {navItems.map((item, index) => (
            <div key={index}>
              <button
                className={`nav-link ${
                  index === activeIndex ? "selected" : ""
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
