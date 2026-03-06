import React from "react";
import "./Variety.css";
import Carousel from "../../Carousel/Carousel";
import { useVarietyPresenter } from "../../../core/mvp/presenter";

const Variety = () => {
  const { items, loading, error, onRetry } = useVarietyPresenter({ type: 'smartphone', limit: 6 });

  return (
    <section className="variety-section">
      <div className="cont-width-default">
        <div className="variety-heading-wrapper">
          <h2 className="section-title">Տեսականի</h2>
          <a href="/variety">Տեսնել Ավելին</a>
        </div>
        {error && (
          <div className="variety-error">
            {error}
            <button type="button" onClick={onRetry}>Retry</button>
          </div>
        )}
        {loading && !items.length ? (
          <div className="variety-loading">Loading...</div>
        ) : (
          <Carousel items={items} />
        )}
      </div>
    </section>
  );
};

export default Variety;
