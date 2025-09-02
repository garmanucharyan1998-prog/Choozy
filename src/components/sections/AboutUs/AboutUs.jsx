import "./AboutUs.css";

const AboutUs = () => {
  return (
    <section className="about-us-section" aria-label="Մեր Մասին">
      <article className="about-us cont-width-default flex">
        <div>
          <h2>Մեր Մասին</h2>
          <p>
            <strong>Choosy</strong>-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ
            գնորդների և վաճառողների համար, ովքեր գնահատում են որակը և
            անհատականացումը։ Ունենալով ուշադիր ընտրված ապրանքների տեսականի՝{" "}
            <strong>Choosy</strong>-ն առաջարկում է հարթ և հարմարավետ գնումների
            փորձ։
          </p>
          <a href="/about" role="button" className="btn-learn-more">
            Իմանալ Ավելին
          </a>
        </div>

        <figure className="about-us-img-block">
          <img
            src="/assets/images/AboutUs/AboutUs.jpg"
            alt="Choosy առցանց շուկայի նկարագրական պատկեր"
            loading="lazy"
          />
          <figcaption className="visually-hidden">
            Choosy - անհատականացված գնումների հարթակ
          </figcaption>
        </figure>
      </article>
    </section>
  );
};

export default AboutUs;
