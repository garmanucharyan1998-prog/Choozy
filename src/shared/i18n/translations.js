/**
 * Centralized UI text dictionary.
 * Currently populated with project source strings and can be extended per language.
 */
export const translations = {
  am: {
    header: {
      brandAriaLabel: "Choozy - Main page",
      brandTitle: "Choozy - Electronics online store",
      brandAlt: "Choozy - Electronics online store logo",
      mainNavigationAriaLabel: "Main navigation",
      aboutLinkLabel: "Մեր մասին",
      aboutLinkTitle: "Learn more about Choozy company",
      search: {
        formAriaLabel: "Product search",
        placeholder: "Որոնել",
        inputAriaLabel: "Search for products and services",
        helpText: "Enter at least 2 characters to search",
        clearAriaLabel: "Clear search",
        clearTitle: "Clear search field",
        submitAriaLabel: "Execute search",
        submitLabel: "Որոնել",
        resultsAriaLabel: "Search results",
        selectSuggestionPrefix: "Select:",
        noResults: "Արդյունքներ չեն գտնվել",
      },
      userNavigationAriaLabel: "User navigation",
      compareLabel: "Համեմատել",
      compareTitle: "Compare products",
      compareAriaLabel: "Compare selected products",
      favoritesLabel: "Նախընտրելի",
      favoritesTitle: "Favorite products",
      favoritesAriaLabel: "Go to favorite products",
      loginLabel: "Մուտք",
      loginTitle: "Login to account",
      loginAriaLabel: "Login to personal cabinet",
      openMenuAriaLabel: "Open menu",
      closeMenuAriaLabel: "Close menu",
      languageSelectionAriaLabel: "Language selection",
      currentLanguagePrefix: "Current language",
      selectLanguageAriaLabel: "Select language",
      mobileNavigationAriaLabel: "Mobile navigation menu",
      mobileMenuTitle: "Մենյու",
      mobileLinksAriaLabel: "Mobile links",
      bottomNavigationAriaLabel: "Bottom mobile navigation",
      mobileBottomNav: {
        home: {
          label: "Գլխավոր",
          ariaLabel: "Go to home page",
        },
        compare: {
          label: "Համեմատել",
          ariaLabel: "Go to compare products",
        },
        favorites: {
          label: "Նախընտրելի",
          ariaLabel: "Go to favorite products",
        },
        profile: {
          label: "Մուտք",
          ariaLabel: "Open personal account",
        },
      },
      mobileMenuItems: {
        topProducts: "Թոփ Ապրանքներ",
        varietyProducts: "Տեսականի",
        contact: "Կապ Մեզ Հետ",
        aboutUs: "Մեր Մասին",
        privacy: "Գաղտնիության Քաղաքականություն",
      },
    },
    navPanel: {
      navAriaLabel: "Main navigation menu",
      openCatalogAriaLabel: "Open catalog",
      catalogLabel: "Կատալոգ",
      mobileCatalogAriaLabel: "Mobile catalog panel",
      closeCatalogAriaLabel: "Close catalog",
      catalogLinksAriaLabel: "Catalog links",
      items: {
        techElectronics: "Տեխնիկա և էլեկտրոնիկա",
        portableSpeakers: "Շարժական բարձրախոսներ",
        homeAppliances: "Կենցաղային Տեխնիկա",
        kitchenAppliances: "Խոհանոցային Տեխնիկա",
        beautyCare: "Գեղեցկություն և խնամք",
      },
    },
    gridCatalog: {
      items: {
        smartphones: "Սմարթֆոն",
        speakers: "Շարժական բարձրախոսներ",
        laptops: "Նոթբուքեր",
        headphones: "SONY:Ականջակալներ",
      },
    },
    productShowcase: {
      viewMoreLabel: "Տեսնել Ավելին",
      retryLabel: "Retry",
      loadingLabel: "Loading...",
    },
    topProducts: {
      title: "Թոփ ապրանքներ",
    },
    variety: {
      title: "Տեսականի",
    },
    servicesOverview: {
      heading: "Մեր ծառայությունները",
      listAriaLabel: "Ծառայությունների ցանկ",
      items: {
        aiPoweredSearch: {
          title: "Ամեն ինչ մեկ վայրում",
          description:
            "Choosy-ն նախատեսված է ինտերնետ-խանութներում ապրանքների որոնման և գների համեմատության համար։ Այն ընդգրկում է ամենատարբեր ապրանքների կատեգորիաներ՝ էլեկտրոնիկա, համակարգիչներ, կենցաղային տեխնիկա, ավտոմասեր, վերանորոգման և շինարարական սարքավորումներ, զբոսաշրջային հանդերձանք, մանկական ապրանքներ և շատ ավելին։ Մեր նպատակն է օգնել գնորդներին արագ և հարմարավետ գտնել ամենաարդյունավետ առաջարկը։",
        },
        smartRecommendations: {
          title: "Ճկուն Կարգավորումներ",
          description:
            "Նրանց համար, ովքեր դեռ չեն կողմնորոշվել ընտրության հարցում, յուրաքանչյուր բաժնում հասանելի է պարամետրերով ընտրություն և հնարավորություն ապրանքները միմյանց հետ համեմատելու։ Կա նաև հարմար տեքստային որոնում, որը թույլ է տալիս գտնել ինչպես անհրաժեշտ բաժինները, այնպես էլ կոնկրետ ապրանքները ըստ անվանման։ Իսկ յուրաքանչյուր մոդելի էջում ներկայացված է մանրամասն տեղեկատվություն, որը կօգնի որոշում կայացնել՝ նկարագրություն, տեխնիկական բնութագրեր, լուսանկարներ և վիդեոներ, օգտակար հղումներ և կարծիքներ։",
        },
        personalizedService: {
          title: "Choosy-n ամեն վայրում",
          description:
            "Choosy-ի համակարգին միացված է ավելի քան 3000 խանութ՝ 1,5 միլիոն ապրանքներով, որոնց վերաբերյալ տվյալները մշտապես թարմացվում են։ Դրա շնորհիվ դուք կարող եք ոչ միայն ընտրել համապատասխան ապրանքը, այլև ձեռք բերել այն ամենաօպտիմալ պայմաններով։ Այսօր մենք գործում ենք տարբեր երկրների շուկաներում՝ Ուկրաինայում, Լեհաստանում, ԱՄՆ-ում, Մեծ Բրիտանիայում, Ղազախստանում, և ձգտում ենք ընդլայնել մեր աշխարհագրությունը։",
        },
      },
    },
    aboutUs: {
      sectionAriaLabel: "Մեր Մասին",
      title: "Մեր Մասին",
      descriptionStart:
        "-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ գնորդների և վաճառողների համար, ովքեր գնահատում են որակը և անհատականացումը։ Ունենալով ուշադիր ընտրված ապրանքների տեսականի՝",
      descriptionEnd: "-ն առաջարկում է հարթ և հարմարավետ գնումների փորձ։",
      learnMoreLabel: "Իմանալ Ավելին",
      imageAlt: "Choosy առցանց շուկայի նկարագրական պատկեր",
      imageCaption: "Choosy - անհատականացված գնումների հարթակ",
    },
    footer: {
      columns: {
        primary: {
          home: "Գլխավոր",
          about: "Մեր Մասին",
          catalog: "Կատալոգ",
        },
        contact: {
          contact: "Կապ Մեզ Հետ",
          email: "info@choosy.com",
        },
        legal: {
          privacy: "Գաղտնիություն",
          terms: "Ծառայության Պայմաններ",
        },
      },
      copyright: "© 2025, Choosy. All Rights Reserved",
    },
  },
};

export default translations;
