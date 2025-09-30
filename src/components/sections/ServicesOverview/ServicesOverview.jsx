import "./ServicesOverview.css";
import cartIcon from "../../../assets/icons/cart.svg";
import settingsIcon from "../../../assets/icons/settings.svg";
import shareIcon from "../../../assets/icons/shareBlank.svg";

const ServicesOverview = () => {
  const services = [
    {
      id: "ai-powered-search",
      icon: cartIcon,
      title: "Ամեն ինչ մեկ վայրում",
      description:
        "Choosy-ն նախատեսված է ինտերնետ-խանութներում ապրանքների որոնման և գների համեմատության համար։ Այն ընդգրկում է ամենատարբեր ապրանքների կատեգորիաներ՝ էլեկտրոնիկա, համակարգիչներ, կենցաղային տեխնիկա, ավտոմասեր, վերանորոգման և շինարարական սարքավորումներ, զբոսաշրջային հանդերձանք, մանկական ապրանքներ և շատ ավելին։ Մեր նպատակն է օգնել գնորդներին արագ և հարմարավետ գտնել ամենաարդյունավետ առաջարկը։",
    },
    {
      id: "smart-recommendations",
      icon: settingsIcon,
      title: "Ճկուն Կարգավորումներ",
      description:
        "Նրանց համար, ովքեր դեռ չեն կողմնորոշվել ընտրության հարցում, յուրաքանչյուր բաժնում հասանելի է պարամետրերով ընտրություն և հնարավորություն ապրանքները միմյանց հետ համեմատելու։ Կա նաև հարմար տեքստային որոնում, որը թույլ է տալիս գտնել ինչպես անհրաժեշտ բաժինները, այնպես էլ կոնկրետ ապրանքները ըստ անվանման։ Իսկ յուրաքանչյուր մոդելի էջում ներկայացված է մանրամասն տեղեկատվություն, որը կօգնի որոշում կայացնել՝ նկարագրություն, տեխնիկական բնութագրեր, լուսանկարներ և վիդեոներ, օգտակար հղումներ և կարծիքներ։",
    },
    {
      id: "personalized-service",
      icon: shareIcon,
      title: "Choosy-n ամեն վայրում",
      description:
        "Choosy-ի համակարգին միացված է ավելի քան 3000 խանութ՝ 1,5 միլիոն ապրանքներով, որոնց վերաբերյալ տվյալները մշտապես թարմացվում են։ Դրա շնորհիվ դուք կարող եք ոչ միայն ընտրել համապատասխան ապրանքը, այլև ձեռք բերել այն ամենաօպտիմալ պայմաններով։ Այսօր մենք գործում ենք տարբեր երկրների շուկաներում՝ Ուկրաինայում, Լեհաստանում, ԱՄՆ-ում, Մեծ Բրիտանիայում, Ղազախստանում, և ձգտում ենք ընդլայնել մեր աշխարհագրությունը։",
    },
  ];

  return (
    <section
      className="services-overview"
      role="region"
      aria-labelledby="services-overview-heading"
    >
      <div className="services-container cont-width-default">
        <h2 id="services-overview-heading" className="sr-only">
          Մեր ծառայությունները
        </h2>

        <div
          className="services-grid"
          role="list"
          aria-label="Ծառայությունների ցանկ"
        >
          {services.map((service, index) => (
            <article
              key={service.id}
              className="service-card"
              role="listitem"
              aria-labelledby={`service-title-${service.id}`}
              aria-describedby={`service-desc-${service.id}`}
            >
              <img
                className="service-icon"
                role="img"
                src={service.icon}
                alt={`${service.title} icon`}
                aria-label={`${service.title} image`}
              />

              <h3 id={`service-title-${service.id}`} className="service-title">
                {service.title}
              </h3>

              <p
                id={`service-desc-${service.id}`}
                className="service-description"
              >
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
