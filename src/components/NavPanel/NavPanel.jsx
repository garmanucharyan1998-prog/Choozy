import React, { useState } from "react";
import "./NavPanel.css";

const NAV_ITEMS = [
  { label: "Տեխնիկա և էլեկտրոնիկա", aria: "Tech and Electronics" },
  { label: "Շարժական բարձրախոսներ", aria: "Portable Speakers" },
  { label: "Կենցաղային Տեխնիկա", aria: "Home Appliances" },
  { label: "Խոհանոցային Տեխնիկա", aria: "Kitchen Appliances" },
  { label: "Գեղեցկություն և խնամք", aria: "Beauty and Care" },
];

function NavPanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (index) => {
    setActiveIndex(index);
  };

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
          {NAV_ITEMS.map((item, index) => (
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
