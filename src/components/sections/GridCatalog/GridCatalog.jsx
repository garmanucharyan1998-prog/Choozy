import React from "react";
import "./GridCatalog.css";

const catalogItems = [
  {
    label: "Սմարթֆոն",
    image: "/assets/images/gridCatalog/smartphone.png",
    className: "item-1 grid-item",
  },
  {
    label: "Շարժական բարձրախոսներ",
    image: "/assets/images/gridCatalog/headphone.png",
    className: "item-2 grid-item",
  },
  {
    label: "Նոթբուքեր",
    image: "/assets/images/gridCatalog/notebook.png",
    className: "item-3 grid-item",
  },
  {
    label: "Նոթբուքեր",
    image: "/assets/images/gridCatalog/notebook.png",
    className: "item-4 grid-item",
  },
  {
    label: "Շարժական բարձրախոսներ",
    image: "/assets/images/gridCatalog/headphone.png",
    className: "item-5 grid-item",
  },
  {
    label: "SONY:Ականջակալներ",
    image: "/assets/images/gridCatalog/earphones.png",
    className: "item-6 grid-item",
  },
];

const GridCatalog = () => {
  return (
    <section className="grid-catalog-section">
      <div className="grid-catalog cont-width-default">
        {catalogItems.map((item, index) => (
          <div
            className={`catalog-card ${item.className}`}
            key={index}
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <h4 className="catalog-item-caption">{item.label}</h4>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GridCatalog;
