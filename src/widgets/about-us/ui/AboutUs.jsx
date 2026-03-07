const AboutUs = () => {
  return (
    <section id="about-us" className="flex justify-center gap-5 mb-10 lg:my-[120px]" aria-label={"Մեր Մասին"}>
      <article className="flex flex-col text-center items-center gap-8 cont-width-default lg:grid lg:grid-cols-2 lg:text-left lg:items-center">
        <div className="flex flex-col justify-center box-border bg-section-bg p-3.5 h-full rounded-[32px] max-h-[280px] md:p-8 lg:p-9 lg:max-h-none">
          <h2 className="mx-auto text-lg my-2 font-semibold md:text-xl lg:text-[2rem] lg:mb-4 lg:mt-0 lg:mx-0">
            {"Մեր Մասին"}
          </h2>
          <p className="text-xs text-[#333] m-0 leading-normal md:text-sm lg:text-base lg:leading-6 lg:font-normal lg:my-8 lg:text-left">
            <strong>Choosy</strong>
            {"-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ գնորդների և վաճառողների համար, ովքեր գնահատում են որակը և անհատականացումը։ Ունենալով ուշադիր ընտրված ապրանքների տեսականի՝"}{" "}
            <strong>Choosy</strong>
            {"-ն առաջարկում է հարթ և հարմարավետ գնումների փորձ։"}
          </p>
          <a
            href="/about"
            role="button"
            className="flex w-fit mx-auto mt-2.5 px-3 py-2.5 bg-navy text-white text-sm no-underline rounded-pill font-medium leading-none tracking-normal transition-colors duration-300 hover:bg-navy-light hover:shadow-[#15214760_0_0_10px] lg:text-base lg:px-4 lg:py-3.5 lg:mt-0 lg:mx-0"
          >
            {"Իմանալ Ավելին"}
          </a>
        </div>

        <figure className="w-full h-full rounded-3xl overflow-hidden group">
          <img
            src="/assets/images/AboutUs/AboutUs.jpg"
            alt={`Choosy առցանց շուկայի նկարագրական պատկեր`}
            loading="lazy"
            className="w-full h-full object-cover rounded-3xl transition-all duration-[400ms] group-hover:scale-105 max-h-[280px] lg:max-h-none"
          />
          <figcaption className="sr-only">
            {`Choosy - անհատականացված գնումների հարթակ`}
          </figcaption>
        </figure>
      </article>
    </section>
  );
};

export default AboutUs;
