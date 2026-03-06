import React from "react";
import { useGridCatalogPresenter } from "../../../core/mvp/presenter";
import "./GridCatalog.css";

const GridCatalog = () => {
  const { items } = useGridCatalogPresenter();

  return (
    <section className="grid-catalog-section">
      <div className="grid-catalog cont-width-default">
        {items.map((item, index) => (
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
