// TopProducts.jsx
import React from "react";
import "./Variety.css";
import Carousel from "../../Carousel/Carousel";

const products = [
  {
    title: "Apple iPhone 16 Pro Max 1TB Black Titanium",
    price: "489,600 AMD",
    description: "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/smartphone.png",
  },
  {
    title: "SONY: Ականջակալներ",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/earphones.png",
  },
  {
    title: "SLING: Դրամապանակ",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog//bag.png",
  },
  {
    title: "Sigma 30mm f/1.4 Contemporary DC DN",
    price: "120,600 AMD",
    description: "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/objective.png",
  },
  {
    title: "Apple MacBook Pro 14",
    price: "1,200,000 AMD",
    description: "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/smartphone.png",
  },
  {
    title: "Sony 4K TV",
    price: "450,000 AMD",
    description: "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ Choozy",
    image: "/assets/images/gridCatalog/bag.png",
  },
];

const Variety = () => {
  return (
    <section className="variety-section">
      <div className="cont-width-default">
        <div className="variety-heading-wrapper">
          <h2 className="section-title">Տեսականի</h2>
          <a href="/variety">Տեսնել Ավելին</a>
        </div>
        <Carousel items={products} />
      </div>
    </section>
  );
};

export default Variety;
