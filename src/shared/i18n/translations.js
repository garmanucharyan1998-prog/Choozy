import { buildLocale } from "./mergeLocale.js";
import { carouselProductsAm } from "./locales/carouselProducts.am.js";
import { enOverrides } from "./locales/en.overrides.js";
import { ruOverrides } from "./locales/ru.overrides.js";

/**
 * Centralized UI text dictionary (am base + en/ru mock locales).
 */
const am = {
  home: {
    pageTitle: "Choosy — էլեկտրոնիկայի առցանց խանութ",
  },
  header: {
    brandAriaLabel: "Choosy — գլխավոր էջ",
    brandTitle: "Choosy — էլեկտրոնիկայի առցանց խանութ",
    brandAlt: "Choosy — էլեկտրոնիկայի առցանց խանութի լոգոն",
    mainNavigationAriaLabel: "Հիմնական նավիգացիա",
    aboutLinkLabel: "Մեր մասին",
    aboutLinkTitle: "Իմանալ ավելին Choosy ընկերության մասին",
    search: {
      formAriaLabel: "Ապրանքների որոնում",
      placeholder: "Որոնել",
      inputAriaLabel: "Որոնել ապրանքներ և ծառայություններ",
      helpText: "Որոնելու համար մուտքագրեք առնվազն 2 նիշ",
      clearAriaLabel: "Մաքրել որոնումը",
      clearTitle: "Մաքրել որոնման դաշտը",
      submitAriaLabel: "Կատարել որոնումը",
      submitLabel: "Որոնել",
      resultsAriaLabel: "Որոնման արդյունքներ",
      selectSuggestionPrefix: "Ընտրել՝",
      noResults: "Արդյունքներ չեն գտնվել",
    },
    userNavigationAriaLabel: "Օգտատիրոջ նավիգացիա",
    compareLabel: "Համեմատել",
    compareTitle: "Համեմատել ապրանքները",
    compareAriaLabel: "Համեմատել ընտրված ապրանքները",
    favoritesLabel: "Նախընտրելի",
    favoritesTitle: "Նախընտրելի ապրանքներ",
    favoritesAriaLabel: "Անցնել նախընտրելի ապրանքներին",
    favoritesCountForAria: "Նախընտրելիներում",
    loginLabel: "Մուտք",
    loginTitle: "Մուտք գործել հաշիվ",
    loginAriaLabel: "Մուտք գործել անձնական հաշիվ",
    buyerAccountLabel: "Հաշիվ",
    buyerAccountTitle: "Անցնել անձնական հաշվին",
    buyerAccountAriaLabel: "Անցնել անձնական հաշվին",
    sellerAccountLabel: "Խանութ",
    sellerAccountTitle: "Անցնել խանութի հաշվին",
    sellerAccountAriaLabel: "Անցնել խանութի հաշվին",
    openMenuAriaLabel: "Բացել մենյուն",
    closeMenuAriaLabel: "Փակել մենյուն",
    languageSelectionAriaLabel: "Լեզվի ընտրություն",
    currentLanguagePrefix: "Ընթացիկ լեզուն",
    selectLanguageAriaLabel: "Ընտրել լեզուն",
    mobileNavigationAriaLabel: "Բջջային նավիգացիայի մենյու",
    mobileMenuTitle: "Մենյու",
    mobileLinksAriaLabel: "Բջջային հղումներ",
    bottomNavigationAriaLabel: "Ներքևի բջջային նավիգացիա",
    mobileBottomNav: {
      home: {
        label: "Գլխավոր",
        ariaLabel: "Անցնել գլխավոր էջ",
      },
      compare: {
        label: "Համեմատել",
        ariaLabel: "Անցնել ապրանքների համեմատությանը",
      },
      favorites: {
        label: "Նախընտրելի",
        ariaLabel: "Անցնել նախընտրելի ապրանքներին",
      },
      profile: {
        label: "Մուտք",
        ariaLabel: "Բացել անձնական հաշիվը",
      },
      account: {
        label: "Հաշիվ",
        ariaLabel: "Անցնել անձնական հաշվին",
      },
      shop: {
        label: "Խանութ",
        ariaLabel: "Անցնել խանութի հաշվին",
      },
      shopProducts: {
        label: "Ապրանքներ",
        ariaLabel: "Անցնել ապրանքների կառավարմանը",
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
    navAriaLabel: "Կատեգորիաների նավիգացիա",
    openCatalogAriaLabel: "Բացել կատալոգը",
    catalogLabel: "Կատալոգ",
    mobileCatalogAriaLabel: "Բջջային կատալոգի վահանակ",
    closeCatalogAriaLabel: "Փակել կատալոգը",
    catalogLinksAriaLabel: "Կատալոգի հղումներ",
    items: {
      techElectronics: "Տեխնիկա և էլեկտրոնիկա",
      portableSpeakers: "Շարժական բարձրախոսներ",
      homeAppliances: "Կենցաղային Տեխնիկա",
      kitchenAppliances: "Խոհանոցային Տեխնիկա",
      beautyCare: "Գեղեցկություն և խնամք",
    },
  },
  gridCatalog: {
    heading: "Կատալոգ",
    items: {
      smartphones: "Սմարթֆոն",
      speakers: "Շարժական բարձրախոսներ",
      laptops: "Նոթբուքեր",
      headphones: "Ականջակալներ",
    },
  },
  filterPage: {
    pageTitle: "Ապրանքների կատալոգ",
    resultsHeading: "Արդյունքներ",
    mainAriaLabel: "Ապրանքների կատալոգ և ֆիլտրեր",
    sidebarAriaLabel: "Ֆիլտրեր",
    toolbarAriaLabel: "Ցանկի գործիքներ",
    searchPlaceholder: "Որոնում ֆիլտրով",
    sortLabel: "Դասավորել ըստ",
    sort: {
      popular: "Ամենապահանջված",
      priceAsc: "Գինը՝ աճման կարգով",
      priceDesc: "Գինը՝ նվազման կարգով",
    },
    viewGridAria: "Ցանցի տեսք",
    viewListAria: "Ցանկի տեսք",
    openFiltersAria: "Բացել ֆիլտրերի վահանակը",
    mobileOverlayTitle: "Ֆիլտր",
    closeOverlay: "Փակել",
    overlaySearchPlaceholder: "Որոնում ֆիլտրերում",
    applyFilters: "Կիրառել",
    removeChipAria: "Հանել ֆիլտրը",
    activeChipsAria: "Ակտիվ ֆիլտրեր",
    categories: {
      smartphones: "Սմարթֆոն",
      laptops: "Նոթբուքեր",
      speakers: "Շարժական բարձրախոսներ",
      headphones: "Ականջակալներ",
      tablets: "Պլանշետ",
      tv: "Հեռուստացույց",
      wearables: "Ժամացույց",
      cameras: "Տեսախցիկ",
    },
    filters: {
      price: "Արժեք",
      priceMin: "Նվազագույն",
      priceMax: "Առավելագույն",
      screen: "Էկրանի չափս",
      brandTitle: "Ապրանքանիշ",
      storage: "Հիշողության ծավալ",
      color: "Գույն",
      seeMore: "Տեսնել Ավելին",
      seeLess: "Պակաս ցուցադրել",
      /**
       * Screen options are data-derived ranges built in the presenter, so the only copy the
       * dictionary owes them is the unit word. The old per-value keys (`inch11`…`inch16`)
       * hardcoded a list that no longer matches the catalog's real diagonals.
       */
      screenSizes: {
        unit: "դյույմ",
      },
      brandNames: {
        apple: "Apple",
        samsung: "Samsung",
        sony: "Sony",
        hp: "HP",
        lenovo: "Lenovo",
        dell: "Dell",
      },
      /**
       * Storage options carry no keys at all: "256 GB" / "1 TB" is the same text in every
       * locale, so the presenter builds them from the catalog with `formatStorageGb`.
       */
      colorNames: {
        black: "Սև",
        grey: "Մոխրագույն",
        white: "Սպիտակ",
        navy: "Կապույտ",
        blue: "Երկնագույն",
        orange: "Նարնջագույն",
      },
    },
    pagination: {
      navAria: "Էջավորում",
      prevAria: "Նախորդ էջ",
      nextAria: "Հաջորդ էջ",
      goToPage: "Էջ {{n}}",
      showLabel: "Ցույց տալ",
    },
    empty: "Արդյունքներ չեն գտնվել",
  },
  noscript: "Այս կայքի աշխատանքի համար անհրաժեշտ է միացնել JavaScript-ը։",
  homeIntro: {
    heading: "Գների համեմատություն Հայաստանում",
    body: "Choosy-ը հավաքում է սմարթֆոնների, նոութբուքերի, պլանշետների, հեռուստացույցների, ականջակալների և ժամացույցների առաջարկները Հայաստանի խանութներից՝ մեկ էջում։ Համեմատեք գները, բնութագրերը և առկայությունը, ապա անցեք ընտրված խանութ։",
  },
  aboutPage: {
    seoTitle: "Choosy-ի մասին — գների համեմատություն Հայաստանում",
    seoDescription:
      "Ինչ է Choosy-ը, ինչպես են հավաքվում Հայաստանի խանութների գները և ինչպես է աշխատում համեմատությունը։",
    heading: "Choosy-ի մասին",
    intro:
      "Choosy-ը գների համեմատության հարթակ է Հայաստանի համար։ Մենք հավաքում ենք էլեկտրոնիկայի առաջարկները՝ սմարթֆոններ, նոութբուքեր, պլանշետներ, հեռուստացույցներ, ականջակալներ, բարձրախոսներ, ժամացույցներ և ֆոտոխցիկներ՝ տեղական խանութներից, և ցույց ենք տալիս մեկ էջում, որպեսզի ընտրությունը, որը նախկինում պահանջում էր տասնյակ բացված էջեր, տեղավորվի մեկ համեմատության մեջ։",
    sections: [
      {
        heading: "Ինչ ենք անում",
        body: "Յուրաքանչյուր ապրանքի էջում թվարկված են այդ մոդելը վաճառող խանութները և նրանց ընթացիկ գները՝ տարբերությունը երևում է անմիջապես, իսկ ընտրված խանութ անցնելը մեկ սեղմում է։ Մենք ինքներս ոչինչ չենք վաճառում և պատվերներ չենք մշակում. գնումը կատարվում է վաճառողի կայքում՝ նրա պայմաններով։",
      },
      {
        heading: "Որտեղից են գները",
        body: "Գները գալիս են հենց խանութներից՝ իրենց հրապարակած և թարմացվող հայտարարությունների միջոցով։ Չթարմացված հայտարարությունը չի մնում կախված, այլ ժամկետանց է դառնում. հնացած գինը ավելի վատ է, քան գնի բացակայությունը։ Մենք ցույց ենք տալիս այն, ինչ խանութն այս պահին խնդրում է. պատասխանատուն խանութն է։",
      },
      {
        heading: "Խանութների համար",
        body: "Վաճառողները վարում են սեփական կատալոգը՝ ավելացնում ապրանքներ, սահմանում գներ, նշում առկայությունը և թարմացնում հայտարարությունները։ Կոնկրետ մոդել համեմատող գնորդներին հասնելը խանութին ոչինչ չի արժենում, բացի տվյալների ճշգրտությունը պահպանելուց։",
      },
      {
        heading: "Լեզուներ և ընդգրկում",
        body: "Կայքը հասանելի է հայերեն, ռուսերեն և անգլերեն և ընդգրկում է Հայաստանում գործող խանութները։ Յուրաքանչյուր էջ ունի իր հասցեն ամեն լեզվով, ուստի ուղարկված հղումը կբացվի այն լեզվով, որով կարդում էիք։",
      },
      {
        heading: "Կապ",
        body: "Հարցեր, հայտարարության ուղղումներ կամ խանութի միանալու հայտ՝ գրեք info@choosy.am հասցեին, և մենք կպատասխանենք։",
      },
    ],
  },
  privacyPage: {
    seoTitle: "Գաղտնիության քաղաքականություն — Choosy",
    seoDescription:
      "Ինչ տվյալներ է պահում Choosy-ը, որտեղ են դրանք և ինչ վերահսկողություն ունեք դրանց նկատմամբ։",
    heading: "Գաղտնիության քաղաքականություն",
    intro:
      "Այստեղ նկարագրված է, թե ինչ է Choosy-ը պահում կայքից օգտվելիս, ինչու, և ինչ վերահսկողություն ունեք դրա նկատմամբ։ Տեքստը գրված է կարդալու համար, և տվյալների ծավալը մենք պահում ենք այնպիսին, որ այն տեղավորվի մեկ էջում։",
    sections: [
      {
        heading: "Ինչ է պահվում ձեր բրաուզերում",
        body: "Նախընտրելիները, վերջերս դիտված ապրանքները և ինտերֆեյսի կարգավորումները պահվում են ձեր բրաուզերի տեղային պահոցում։ Դրանք չեն լքում սարքը, իսկ բրաուզերի տվյալները մաքրելը դրանք ջնջում է։ Դրանցից ոչ մեկը ձեզ չի նույնականացնում մեզ համար։",
      },
      {
        heading: "Հաշվի տվյալներ",
        body: "Հաշիվ ստեղծելիս մենք պահում ենք ձեր նշած էլ. հասցեն և հաշվի տեսակը՝ գնորդ կամ խանութ։ Այս զույգն է թույլ տալիս, որ նախընտրելիները հետևեն հաշվին, ոչ թե բրաուզերին։ Անուն, հասցե կամ վճարային տվյալներ մենք չենք հարցնում. գները համեմատելու համար դրանք պետք չեն։",
      },
      {
        heading: "Cookie-ներ",
        body: "Մեկ cookie գրանցում է, որ դուք մուտք եք գործել, և ձեր հաշվի տեսակը՝ որպեսզի բացվեն ճիշտ էջերը։ Այն ժամկետանց է դառնում 30 օր հետո, իսկ հաշվից դուրս գալը ջնջում է այն։ Գովազդային և հետագծող cookie-ներ մենք չենք օգտագործում։",
      },
      {
        heading: "Խանութ անցնելը",
        body: "Առաջարկը բացելով՝ դուք անցնում եք վաճառողի կայք, որն ունի իր գաղտնիության քաղաքականությունը և իր cookie-ները։ Ձեր հաշվի տվյալները մենք նրանց չենք փոխանցում. այնտեղ կատարվողը ձեր և այդ խանութի միջև է։",
      },
      {
        heading: "Ձեր հնարավորությունները",
        body: "Տեղային տվյալները կարող եք ցանկացած պահի մաքրել բրաուզերի միջոցներով, իսկ հաշվից օգտվելը դադարեցնել՝ պարզապես դուրս գալով։ Կոնկրետ հասցեի վերաբերյալ պահվողն իմանալու կամ այն ջնջելու համար գրեք info@choosy.am։",
      },
      {
        heading: "Փոփոխություններ",
        body: "Եթե քաղաքականությունը փոխվի այն մասով, թե ինչ ենք պահում կամ ինչու, թարմացված տարբերակը կհայտնվի այս էջում։ Դրանից հետո կայքից շարունակելը նշանակում է, որ գործում է ընթացիկ տարբերակը։",
      },
    ],
  },
  termsPage: {
    seoTitle: "Օգտագործման պայմաններ — Choosy",
    seoDescription:
      "Choosy-ից օգտվելու պայմանները՝ ինչ է գների համեմատությունը, ինչ չէ, և ով ինչի համար է պատասխանատու։",
    heading: "Օգտագործման պայմաններ",
    intro:
      "Այս պայմանները վերաբերում են Choosy-ից օգտվելուն։ Հակիրճ՝ մենք ցույց ենք տալիս խանութների հրապարակած գները, դուք գնում եք ուղղակիորեն նրանցից, և յուրաքանչյուր կողմ պատասխանատու է իր մասի համար։",
    sections: [
      {
        heading: "Ինչ է ծառայությունը",
        body: "Choosy-ը համեմատում է Հայաստանում վաճառողների հրապարակած գները։ Մենք գործարքի կողմ չենք։ Առք ու վաճառքի պայմանագիրը կնքվում է ձեր և ընտրված խանութի միջև՝ նրա պայմաններով, իսկ վճարման, առաքման, երաշխիքի և վերադարձի հարցերը լուծվում են նրա հետ։",
      },
      {
        heading: "Գների ճշգրտությունը",
        body: "Գները և առկայությունը այն են, ինչ խանութները հրապարակել են հայտարարության վերջին թարմացման պահին, և կարող են ցանկացած պահի փոխվել։ Մենք ողջամիտ ջանք ենք գործադրում արդիականության համար և ժամկետանց հայտարարությունները հանում ենք, սակայն որոշիչը վաճառողի էջի գինն է գնման պահին։",
      },
      {
        heading: "Հաշվից օգտվելը",
        body: "Դուք պատասխանատու եք ձեր հաշվի ներքո կատարվողի և գրանցված էլ. հասցեի ճշտության համար։ Մի օգտագործեք կայքը զանգվածային տվյալահանման, նրա աշխատանքը խաթարելու կամ խանութում իրականում բացակայող ապրանքների հայտարարություններ հրապարակելու համար։",
      },
      {
        heading: "Խանութների պարտավորությունները",
        body: "Հայտարարություն հրապարակելով՝ խանութը հաստատում է, որ իրավունք ունի վաճառելու այդ ապրանքները, որ գներն ու առկայությունը հավաստի են, և որ հայտարարությունները կթարմացվեն։ Ապակողմնորոշող կամ լքված հայտարարությունները կարող են հեռացվել։",
      },
      {
        heading: "Բովանդակություն և ապրանքային նշաններ",
        body: "Ապրանքների անվանումները, լոգոները և պատկերները պատկանում են իրենց իրավատերերին և օգտագործվում են համեմատվող ապրանքները նույնականացնելու համար։ Կայքի սեփական տեքստերը, ձևավորումը և կառուցվածքը պատկանում են Choosy-ին։",
      },
      {
        heading: "Սահմանափակումներ",
        body: "Ծառայությունը տրամադրվում է այնպես, ինչպես կա։ Մենք չենք երաշխավորում յուրաքանչյուր գնի ճշտությունը ամեն պահի և կայքի անընդհատ հասանելիությունը, և պատասխանատվություն չենք կրում գնման որոշման համար, որը կայացվել է խանութի արդեն փոխած գնի հիման վրա։ Ոչինչ այստեղ չի սահմանափակում Հայաստանի սպառողների իրավունքների պաշտպանության օրենսդրությամբ ձեզ վերապահված իրավունքները։",
      },
      {
        heading: "Կապ",
        body: "Պայմանների վերաբերյալ հարցեր՝ info@choosy.am։",
      },
    ],
  },
  productDescriptions: {
    smartphonesIos:
      "iOS սմարթֆոն {{screen}} էկրանով և {{storage}} հիշողությամբ։",
    smartphonesAndroid:
      "Android սմարթֆոն {{screen}} էկրանով և {{storage}} հիշողությամբ։",
    laptops: "{{screen}} նոութբուք {{storage}} հիշողությամբ՝ ամենօրյա աշխատանքի և ճամփորդության համար։",
    tablets: "{{screen}} պլանշետ {{storage}} հիշողությամբ՝ մեդիայի, նշումների և թեթև ստեղծագործական աշխատանքի համար։",
    tv: "{{screen}} 4K խելացի հեռուստացույց՝ HDR-ով և ներկառուցված հոսքային հարթակով։",
    headphones: "Անլար աուդիո՝ աղմուկի ակտիվ չեղարկումով և ամբողջ օրվա մարտկոցի աշխատանքով։",
    wearables: "Տիտանե խելացի ժամացույց՝ երկարացված մարտկոցով և GPS հետագծմամբ։",
    cameras: "Լայն դիաֆրագմայով օբյեկտիվ՝ դիմանկարների, ցածր լուսավորության և փողոցային լուսանկարչության համար։",
    speakers: "Շարժական Bluetooth բարձրախոս՝ հարուստ բասով և ջրակայուն կառուցվածքով։",
  },
  productShowcase: {
    viewMoreLabel: "Տեսնել Ավելին",
    retryLabel: "Կրկնել",
    loadingLabel: "Բեռնվում է...",
    loadErrorMessage: "Չհաջողվեց բեռնել ապրանքները",
  },
  relatedProducts: {
    title: "Ապրանքի հետ",
    viewMoreLabel: "Տեսնել Ավելին",
    sectionAriaLabel: "Ապրանքի հետ կապակցված ապրանքներ",
    carouselAriaLabel: "Կապակցված ապրանքների սլայդեր",
    compareAriaLabel: "Ավելացնել համեմատությանը կամ հանել",
    wishlistAriaLabel: "Ավելացնել նախընտրելին կամ հանել",
  },
  topProducts: {
    title: "Թոփ ապրանքներ",
    carouselAriaLabel: "Թոփ ապրանքների սլայդեր",
  },
  variety: {
    title: "Տեսականի",
    carouselAriaLabel: "Տեսականու ապրանքների սլայդեր",
  },
  carousel: {
    previousAriaLabel: "Նախորդ ապրանքը",
    nextAriaLabel: "Հաջորդ ապրանքը",
    compareAriaLabel: "Ավելացնել համեմատությանը կամ հանել",
    wishlistAddAriaLabel: "Ավելացնել նախընտրելիներին",
    wishlistRemoveAriaLabel: "Հանել նախընտրելիներից",
  },
  carouselProducts: carouselProductsAm,
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
  productDetail: {
    title: "Apple MacBook Pro",
    mainImageAlt: "Apple MacBook Pro — ապրանքի լուսանկար",
    galleryAriaLabel: "Ապրանքի լուսանկարների պատկերասրահ",
    galleryThumbAria: "Ընտրել պատկերը",
    wishlistAriaLabel: "Ավելացնել նախընտրելին կամ հանել",
    variantsAriaLabel: "Կոնֆիգուրացիայի ընտրություն",
    colorsAriaLabel: "Գույնի ընտրություն",
    priceFrom: "Սկսած",
    priceTo: "Մինչև",
    currencySuffix: "դր.",
    chartAriaLabel: "Գնի պատմության գծապատկեր",
    tabFull: "Նկարագրություն",
    specsSectionAriaLabel: "Տեխնիկական բնութագրեր",
    variants: {
      v256a: "256 GB / 12 GB",
      v256b: "512 GB / 16 GB",
      v1tb: "1 TB / 16 GB",
    },
    colors: {
      black: "Սև",
      gray: "Մոխրագույն",
      white: "Սպիտակ",
      blue: "Կապույտ",
    },
    chart: {
      months: {
        jan: "Հունվ",
        feb: "Փետր",
        mar: "Մար",
        apr: "Ապր",
        may: "Մայ",
        jun: "Հուն",
        jul: "Հուլ",
        aug: "Օգս",
        sep: "Սեպ",
        oct: "Հոկ",
        nov: "Նոյ",
        dec: "Դեկ",
      },
    },
    specsBrief: {
      screenSize: "Էկրանի չափս:",
      screenSizeValue: "14 դյույմ",
      storage: "Հիշողություն:",
      storageValue: "512 GB",
      ram: "Հիշողություն (RAM):",
      ramValue: "16 GB",
      battery: "Մարտկոց:",
      batteryValue: "89%",
      year: "Տարի:",
      yearValue: "2022",
    },
    specsExtended: {
      values: {
        yes: "Այո",
        batteryHours: "{{hours}} ժամ",
        mainCamera: "{{mp}} ՄՊ հիմնական տեսախցիկ",
      },
      screenType: "Էկրանի տեսակ:",
      screenTypeValue: "LCD",
      microphone: "Ներկառուցված միկրոֆոն:",
      technology: "Տեխնոլոգիա:",
      technologyValue: "Liquid Retina XDR",
      matrix: "Մատրիցայի կետայնություն:",
      ssd: "SSD կուտակիչ:",
      ssdValue: "512 GB",
      bluetooth: "Bluetooth տարբերակ:",
      bluetoothValue: "5.3",
      manufacturer: "Արտադրող:",
      manufacturerValue: "Apple",
    },
  },
  productOffers: {
    sectionAriaLabel: "Առաջարկներ և քարտեզ",
    tabsAriaLabel: "Առաջարկների տեսակներ",
    tabs: {
      sites: "Կայքեր",
      specs: "Բնութագիր",
    },
    goToShopAria: "Բացել խանութի կայքը",
    shops: {
      zigzag: "Zigzag.am",
      vega: "Vega Digital",
      mobileCentre: "Mobile Centre",
    },
    offerDescription: "Choosy-ը նոր առցանց շուկա է՝\nնախատեսված խելամիտ",
    badges: {
      discount: "Զեղչ",
      new: "Նորույթ",
    },
    map: {
      ariaLabel: "Երևանի խանութների քարտեզ",
    },
    bestOffers: {
      sectionAriaLabel: "Լավագույն առաջարկներ",
      title: "Լավագույն Առաջարկները",
      tableAriaLabel: "Ապրանքի առաջարկների աղյուսակ",
      sortBy: "Դասավորել ըստ",
      sortMenuAriaLabel: "Դասավորման եղանակներ",
      openSortAriaLabel: "Բացել դասավորման ընտրությունը",
      seeMore: "Տեսնել Ավելին",
      seeLess: "Պակաս ցուցադրել",
      variantsAriaLabel: "Կոնֆիգուրացիայի ընտրություն",
      colorsAriaLabel: "Գույնի ընտրություն",
      sortOptions: {
        priceAsc: "Գինը՝ աճման կարգով",
        priceDesc: "Գինը՝ նվազման կարգով",
        popular: "Ամենապահանջված",
      },
    },
  },
  account: {
    pageTitle: "Անձնական Էջ",
    sidebarNavAria: "Անձնական էջի բաժիններ",
    personalTabsAria: "Անձնական տվյալների ներդիրներ",
    sidebar: {
      personal: "Անձնական տվյալներ",
      wishlist: "Նախընտրելիներ",
      recent: "Վերջին դիտած պրոդուկտները",
      subscription: "Բաժանորդագրություն",
      notifications: "Ծանուցումներ",
    },
    innerTabs: {
      data: "Տվյալներ",
      notifications: "Ծանուցումներ",
    },
    actions: {
      edit: "Խմբագրել",
      back: "Վերադառնալ",
      cancel: "Չեղարկել",
      save: "Պահպանել",
    },
    fields: {
      emailShort: "Էլ. հասցե",
      phoneShort: "Հեռախոսահամար",
      firstNameRequired: "Անուն*",
      lastName: "Ազգանուն",
      emailRequired: "Էլ. հասցե*",
      phoneRequired: "Հեռախոսահամար (+374)*",
      phoneLocalAria: "Հեռախոսահամար առանց երկրի կոդի",
    },
    profile: {
      placeholderName: "Օգտատեր",
    },
    avatar: {
      uploadAria: "Վերբեռնել պրոֆիլի նկար",
      remove: "Հեռացնել նկարը",
    },
    password: {
      sectionTitle: "Փոփոխել Գաղտնաբառը",
      old: "Հին Գաղտնաբառ",
      new: "Նոր Գաղտնաբառ",
      confirm: "Կրկնել Նոր Գաղտնաբառը",
      tooShort: "Գաղտնաբառը պետք է լինի առնվազն 6 նիշ։",
      mismatch: "Գաղտնաբառերը չեն համընկնում։",
      wrongOld: "Հին գաղտնաբառը սխալ է։",
      saveFailed: "Չհաջողվեց պահպանել գաղտնաբառը։ Փորձեք կրկին։",
    },
    notifications: {
      items: {
        priceDrops: {
          title: "Գների իջեցումներ",
          description: "Տեղեկացնել, երբ նախընտրած ապրանքների գինը իջնի։",
        },
        wishlistUpdates: {
          title: "Նախընտրելիի թարմացումներ",
          description: "Հիշեցումներ պահված ապրանքների և նման առաջարկների մասին։",
        },
        accountNews: {
          title: "Ծառայության նորություններ",
          description: "Թարմացումներ հաշվի նոր հնարավորությունների մասին։",
        },
      },
    },
    notificationsPage: {
      title: "Ծանուցումներ",
      tabsAria: "Ծանուցումների բաժնի ներդիրներ",
      tabs: {
        feed: "Ծանուցումներ",
        settings: "Կարգավորումներ",
      },
      settingsIntro: "Կարգավորեք, թե ինչ տեսակի ծանուցումներ եք ցանկանում ստանալ։",
      feed: {
        sampleBody:
          "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ գնորդների և վաճառողների համար, ովքեր գնահատում են որակը և անհատականացումը։",
        items: {
          recent: {
            title: "Լորեմ Իպսում",
            timeLabel: "3 ր",
          },
          hour: {
            title: "Լորեմ Իպսում",
            timeLabel: "1 ժ",
          },
          dated: {
            title: "Լորեմ Իպսում",
            timeLabel: "16.09.2025",
          },
        },
      },
    },
    wishlist: {
      title: "Նախընտրելիներ",
      empty: "Ցուցակը դատարկ է։",
      remove: "Հեռացնել",
      confirmTitle: "Հեռացնե՞լ ապրանքը",
      confirmMessage: "Վստա՞հ եք, որ ցանկանում եք հեռացնել այս ապրանքը նախընտրելիներից։",
      confirmButton: "Հաստատել",
      cancelButton: "Չեղարկել",
    },
    recent: {
      title: "Վերջին դիտած պրոդուկտները",
      empty: "Դեռ ոչինչ չեք դիտել։",
      clear: "Մաքրել պատմությունը",
      seeMore: "Տեսնել Ավելին",
      seeLess: "Պակաս ցուցադրել",
    },
    subscription: {
      title: "Բաժանորդագրություն",
      planCardTitle: "Բաժանորդագրության պլան",
      planNameLabel: "Անվանում:",
      planValueLabel: "Արժեք:",
      planMonthlyLabel: "Ամսեկան:",
      planName: "Ստանդարտ",
      description: "Ընտրեք, արդյոք ցանկանում եք ստանալ էլ. փոստով նորություններ։",
      toggleLabel: "Էլ. փոստով նորություններ",
    },
    messages: {
      profileSaved: "Տվյալները պահպանվեցին։",
      profileRequired: "Լրացրեք անունը և էլ. հասցեն։",
      passwordSaved: "Գաղտնաբառը թարմացվեց։",
      notificationsSaved: "Ծանուցումների կարգավորումը պահպանվեց։",
      subscriptionSaved: "Բաժանորդագրությունը թարմացվեց։",
      wishlistUpdated: "Նախընտրելին թարմացվեց։",
      dismissStatus: "Փակել ծանուցումը",
      recentCleared: "Պատմությունը մաքրվեց։",
      avatarSaved: "Պրոֆիլի նկարը պահպանվեց։",
      avatarRemoved: "Պրոֆիլի նկարը հեռացվեց։",
      avatarTooLarge: "Նկարը չափազանց մեծ է (առավելագույնը 200 ԿԲ)։",
    },
  },
  shopAccount: {
    pageTitle: "Խանութի էջ",
    sidebarNavAria: "Խանութի էջի բաժիններ",
    shopTabsAria: "Խանութի տվյալների ներդիրներ",
    sidebar: {
      details: "Խանութի տվյալներ",
      products: "Ապրանքի Կառավարում",
      statistics: "Ստատիստիկա",
      finance: "Ֆինանսներ",
    },
    innerTabs: {
      data: "Տվյալներ",
      notifications: "Ծանուցումներ",
    },
    actions: {
      edit: "Խմբագրել",
      back: "Վերադառնալ",
      cancel: "Չեղարկել",
      save: "Պահպանել",
    },
    fields: {
      emailShort: "Էլ. հասցե",
      phoneShort: "Հեռախոսահամար",
      websiteShort: "Կայք",
      shopNameRequired: "Խանութի անուն*",
      description: "Նկարագրություն",
      emailRequired: "Էլ. հասցե*",
      phoneRequired: "Հեռախոսահամար (+374)*",
      phoneLocalAria: "Հեռախոսահամար առանց երկրի կոդի",
      website: "Կայքի հասցե",
    },
    avatar: {
      uploadAria: "Վերբեռնել խանութի լոգոն",
      remove: "Հեռացնել նկարը",
    },
    notifications: {
      items: {
        priceDrops: {
          title: "Գների իջեցումներ",
          description: "Տեղեկացումներ ձեր ապրանքների և մրցակիցների գների մասին։",
        },
        wishlistUpdates: {
          title: "Պահված ապրանքներ",
          description: "Երբ գնորդները պահում են ձեր առաջարկները։",
        },
        accountNews: {
          title: "Պլատֆորմի թարմացումներ",
          description: "Վաճառողի պահնորդի նորություններ և հնարավորություններ։",
        },
      },
    },
    notificationsPage: {
      title: "Ծանուցումներ",
      tabsAria: "Ծանուցումների բաժնի ներդիրներ",
      tabs: {
        feed: "Ծանուցումներ",
        settings: "Կարգավորումներ",
      },
      settingsIntro: "Կարգավորեք, թե ինչ տեսակի ծանուցումներ եք ցանկանում ստանալ։",
      feed: {
        sampleBody:
          "Choosy-ը նոր առցանց շուկա է՝ նախատեսված խելամիտ գնորդների և վաճառողների համար, ովքեր գնահատում են որակը և անհատականացումը։",
        items: {
          recent: {
            title: "Լորեմ Իպսում",
            timeLabel: "3 ր",
          },
          hour: {
            title: "Լորեմ Իպսում",
            timeLabel: "1 ժ",
          },
          dated: {
            title: "Լորեմ Իպսում",
            timeLabel: "16.09.2025",
          },
        },
      },
    },
    products: {
      sectionTitle: "Ապրանքի Կառավարում",
      listTitle: "Ապրանքներ",
      addProduct: "Ավելացնել ապրանք",
      addShort: "Ավելացնել",
      tableAria: "Ապրանքների աղյուսակ",
      tableHeaders: {
        product: "Ապրանք",
        available: "Հասանելի",
        color: "Գույն",
        price: "Արժեք",
        actions: "Գործողություններ",
      },
      edit: "Խմբագրել",
      refresh: "Թարմացնել",
      editAria: "Խմբագրել ապրանքը",
      refreshAria: "Թարմացնել ապրանքը",
      editPriceAria: "Փոխել գինը",
      priceHoverUsd: "≈ {{amount}} USD",
      priceHoverRub: "≈ {{amount}} RUB",
      editFormTitle: "Խմբագրել ապրանք",
      staleHint: "Ապրանքները ավտոմատ հեռացվում են, եթե 5 օրվա ընթացքում «Թարմացնել» չեք սեղմել։",
      amd: "AMD",
      formTitle: "Նոր ապրանք",
      formHint:
        "Ընտրեք կատեգորիան, ապրանքը, հիշողությունը, գույները և հասանելիությունը։ Միայն գինը մուտքագրեք ձեռքով։",
      placeholders: {
        category: "Ընտրել կատեգորիա",
        product: "Ընտրել ապրանք",
        productAfterCategory: "Նախ ընտրեք կատեգորիա",
      },
      noProductsInCategory: "Այս կատեգորիայում ապրանքներ չկան։",
      catalogImageNote: "Նկարը վերցվում է կատալոգից։",
      fields: {
        title: "Անվանում*",
        price: "Գին*",
        category: "Կատեգորիա*",
        description: "Նկարագրություն",
        image: "Նկար",
        availability: "Հասանելիություն",
        memories: "Հիշողություն / կոնֆիգուրացիա*",
        memoryPlaceholder: "256 / 12gb",
        colors: "Գույներ*",
      },
      availabilityOptions: {
        inStock: "Առկա",
        outOfStock: "Առկա չէ",
      },
      addMemoryRow: "Ավելացնել տող",
      removeMemoryRowAria: "Հեռացնել հիշողության տողը",
      addColorRow: "Ավելացնել գույն",
      removeColorRowAria: "Հեռացնել գույնը",
      uploadImage: "Վերբեռնել նկար",
      removeImage: "Հեռացնել նկարը",
      cancel: "Չեղարկել",
      save: "Պահպանել",
      empty: "Դեռ ապրանքներ չկան։ Սեղմեք «Ավելացնել ապրանք»՝ ստեղծելու համար։",
      viewInStore: "Դիտել կայքում",
      deleteAria: "Հեռացնել ապրանքը",
      messages: {
        required: "Լրացրեք անվանումը և գինը։",
        categoryRequired: "Ընտրեք կատեգորիան։",
        productRequired: "Ընտրեք ապրանքը։",
        priceRequired: "Մուտքագրեք գինը։",
        memoryRequired: "Ընտրեք առնվազն մեկ հիշողության տարբերակ։",
        colorsRequired: "Ընտրեք առնվազն մեկ գույն։",
        productAdded: "Ապրանքը ավելացվեց։",
        productUpdated: "Ապրանքը թարմացվեց։",
        productRefreshed: "Ապրանքի թարմացման ամսաթիվը թարմացվեց։",
        priceUpdated: "Գինը թարմացվեց։",
        autoRemoved: "5 օր չթարմացված ապրանքները հեռացվեցին։",
        productRemoved: "Ապրանքը հեռացվեց։",
        imageTooLarge: "Նկարը չափազանց մեծ է (առավելագույնը 200 ԿԲ)։",
      },
      stock: {
        in: "Առկա",
        out: "Առկա չէ",
      },
    },
    statistics: {
      sectionTitle: "Ստատիստիկա",
      intro: "Վերջին շրջանի ցուցանիշների ամփոփում (օրինակելի տվյալներ, մինչև API-ի միացումը)։",
      chartAria: "Ժամանակային շարքի գծապատկեր",
      metricTabsAria: "Ցուցանիշների ընտրություն",
      metrics: {
        views: {
          label: "Այցելություններ",
          summary: "200 հզր",
        },
        orders: {
          label: "Պատվերներ",
          summary: "10,8 հզր",
        },
        session: {
          label: "Միջին սեանս",
          summary: "1 ր 11 վ",
        },
        revenue: {
          label: "Եկամուտ",
          summary: "֏2 812,36",
        },
      },
    },
    finance: {
      tabsAria: "Ֆինանսների բաժնի ներդիրներ",
      tabs: {
        plan: "Բաժանորդագրության պլան",
        payments: "Վճարումների պատմություն",
      },
      addLabel: "Ավելացնել",
      addAria: "Ավելացնել բաժանորդագրության պլան",
      planCardTitle: "Բաժանորդագրության պլան",
      planNameLabel: "Անվանում:",
      planValueLabel: "Արժեք:",
      planMonthlyLabel: "Ամսեկան:",
      planName: "Ստանդարտ",
      paymentsEmpty: "Վճարումների պատմությունը շուտով կցուցադրվի այստեղ։",
      payments: {
        tableAria: "Վճարումների պատմության աղյուսակ",
        colDate: "Ամսաթիվ",
        colMethod: "Վճարման տարբերակ",
        colStatus: "Կարգավիճակ",
        colAmount: "Գումար",
        statusApproved: "Հաստատված",
        statusRejected: "Մերժված",
        sampleDate: "02.10.2025",
        sampleAmount: "550,000 AMD",
        rows: {
          card4321: "Credit Card ****4321",
          idram: "IDram",
          visa0102: "Visa ***0102",
        },
      },
    },
    placeholders: {
      productsTitle: "Ապրանքի Կառավարում",
      productsBody: "Այս բաժինը շուտով հասանելի կլինի՝ ապրանքների ավելացման և խմբագրման համար։",
      statisticsTitle: "Ստատիստիկա",
      statisticsBody: "Վաճառքների և այցելությունների վիճակագրությունը շուտով կցուցադրվի այստեղ։",
      financeTitle: "Ֆինանսներ",
      financeBody: "Ֆինանսական ամփոփագրերը և վճարումները շուտով կլինեն հասանելի։",
    },
    messages: {
      profileSaved: "Խանութի տվյալները պահպանվեցին։",
      profileRequired: "Լրացրեք խանութի անունը և էլ. հասցեն։",
      notificationsSaved: "Ծանուցումների կարգավորումը պահպանվեց։",
      dismissStatus: "Փակել ծանուցումը",
      avatarSaved: "Լոգոն պահպանվեց։",
      avatarRemoved: "Լոգոն հեռացվեց։",
      avatarTooLarge: "Նկարը չափազանց մեծ է (առավելագույնը 200 ԿԲ)։",
    },
  },
  auth: {
    closeAria: "Փակել պատուհանը",
    backdropAria: "Փակել պատուհանը",
    roleLabel: "Կարգավիճակ՝",
    roleBuyer: "Գնորդ",
    roleSeller: "Վաճառող",
    logout: "Ելք",
    logoutAria: "Ելք հաշվից",
  },
  register: {
    title: "Գրանցում",
    subtitle: "Ստեղծեք նոր հաշիվ",
    emailLabel: "Էլ. հասցե",
    passwordLabel: "Գաղտնաբառ",
    confirmPasswordLabel: "Կրկնել գաղտնաբառը",
    submit: "Գրանցվել",
    switchToLoginPrompt: "Արդեն ունե՞ք հաշիվ",
    switchToLoginButton: "Մուտք",
    errors: {
      required: "Լրացրեք բոլոր դաշտերը։",
      passwordMismatch: "Գաղտնաբառերը չեն համընկնում։",
      invalidEmail: "Մուտքագրեք վավեր էլ. հասցե։",
      passwordTooShort: "Գաղտնաբառը պետք է լինի առնվազն 6 նիշ։",
    },
  },
  login: {
    title: "Մուտք",
    subtitle: "Մուտք գործեք ձեր անձնական հաշիվ",
    emailLabel: "Էլ. հասցե",
    passwordLabel: "Գաղտնաբառ",
    submit: "Մուտք",
    switchToRegisterPrompt: "Դեռ հաշիվ չունե՞ք",
    switchToRegisterButton: "Գրանցվել",
    errors: {
      required: "Լրացրեք բոլոր դաշտերը։",
    },
  },
  scrollToTop: {
    ariaLabel: "Գնալ վերև",
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
  breadcrumbs: {
    ariaLabel: "Նավիգացիայի շղթա",
  },
  a11y: {
    skipToContent: "Անցնել բովանդակությանը",
  },
  errorBoundary: {
    heading: "Ինչ-որ բան այնպես չգնաց",
    message: "Այս էջը ցուցադրելիս սխալ առաջացավ։ Փորձեք թարմացնել էջը կամ վերադառնալ ավելի ուշ։",
  },
  notFoundPage: {
    seoTitle: "Էջը չի գտնվել — Choosy",
    seoDescription:
      "Հայցվող էջը գոյություն չունի կամ տեղափոխվել է։ Վերադարձեք գլխավոր էջ կամ օգտվեք որոնումից։",
    heading: "404",
    message: "Այս հասցեով էջ չկա։",
    backHome: "Վերադառնալ գլխավոր էջ",
  },
  comingSoon: {
    message: "Էջը շուտով հասանելի կլինի։",
    seoDescription: "Այս բաժինը դեռ պատրաստման փուլում է։ Շուտով հասանելի կլինի Choosy-ում։",
    titles: {
      about: "Մեր Մասին",
      catalog: "Կատալոգ",
      compare: "Համեմատել",
      products: "Ապրանքներ",
      variety: "Տեսականի",
      privacyPolicy: "Գաղտնիության քաղաքականություն",
      termsOfService: "Ծառայության պայմաններ",
    },
  },
  seo: {
    siteName: "Choosy",
    home: {
      title: "Choosy՝ էլեկտրոնիկայի և տեխնիկայի առցանց շուկա",
      description:
        "Choosy-ում գտեք էլեկտրոնիկա, կենցաղային և խոհանոցային տեխնիկա, համեմատեք գներ և գնումներ կատարեք հարմարավետ։",
    },
    filter: {
      title: "Կատալոգ և գների համեմատություն — Choosy",
      description:
        "Ընտրեք ապրանքներ ըստ ապրանքանիշի, գնի, էկրանի և հիշողության։ Համեմատեք առաջարկները Հայաստանի խանութներից Choosy-ում։",
      /** Appended to a category title/canonical for page 2 and beyond. */
      pageSuffix: "էջ {{page}}",
    },
    /**
     * One entry per catalog category. These are the site's highest-intent landing pages —
     * they all used to share the generic `filter` title and description above and canonicalize
     * to bare `/filter`, so Google dropped all 24 of them (8 categories × 3 languages).
     * `intro` is the visible keyword copy rendered above the results.
     */
    filterCategories: {
      smartphones: {
        title: "Սմարթֆոնների գներ Հայաստանում — համեմատեք և ընտրեք | Choosy",
  /**
   * `comingSoon.titles.compare` is gone from here: `/compare` is a real page now, so the key
   * would have been copy nothing renders — and unread copy is copy that drifts.
   */
  comparePage: {
    seoTitle: "Ապրանքների համեմատություն կողք կողքի — Choosy",
    seoDescription:
      "Համեմատեք սմարթֆոնները, նոութբուքերը և այլ տեխնիկա կողք կողքի՝ բնութագրերով և Հայաստանի խանութների գներով։",
    heading: "Ապրանքների համեմատություն",
    intro:
      "Ընտրեք մինչև չորս ապրանք մեկ կատեգորիայից և տեսեք դրանց բնութագրերն ու խանութների գները մեկ աղյուսակում։",
    empty: {
      heading: "Համեմատելու ապրանք դեռ չկա",
      text: "Կատալոգում կամ ապրանքի էջում սեղմեք կշեռքի կոճակը՝ ապրանքն այստեղ ավելացնելու համար։",
      cta: "Անցնել կատալոգ",
    },
    limitReached: "Կարող եք համեմատել առավելագույնը չորս ապրանք։ Հեռացրեք մեկը՝ նորն ավելացնելու համար։",
    categoryMismatch:
      "Համեմատել կարելի է միայն նույն կատեգորիայի ապրանքներ։ Մաքրեք համեմատությունը՝ ուրիշ կատեգորիայով սկսելու համար։",
    remove: "Հեռացնել",
    clearAll: "Մաքրել բոլորը",
    addMore: "Ավելացնել ապրանք",
    onlyDifferences: "Ցույց տալ միայն տարբերությունները",
    noDifferences: "Ընտրված ապրանքները համընկնում են բոլոր բնութագրերով։",
    tableCaption: "Ընտրված ապրանքների բնութագրերի և գների համեմատություն",
    rowLabelHeader: "Բնութագիր",
    sections: {
      overview: "Ընդհանուր",
      specs: "Բնութագրեր",
      offers: "Գները խանութներում",
    },
    rows: {
      price: "Գինը՝ սկսած",
      brand: "Արտադրող",
      category: "Կատեգորիա",
    },
    lowestPrice: "Ամենացածր գինը",
    /** An em dash reads the same in every language, so the locales repeat it deliberately. */
    noValue: "—",
    countForAria: "Համեմատության մեջ",
    openWithCount: "Անցնել համեմատությանը ({{count}})",
    editComparison: "Փոխել համեմատությունը",
    /** The generated `/compare/<a>-vs-<b>` pages. `{{first}}`/`{{second}}` are product titles. */
    pair: {
      heading: "{{first}} թե՞ {{second}}",
      intro: "Երկու մոդելի բնութագրերը և Հայաստանի խանութների գները՝ կողք կողքի։",
      seoTitle: "{{first}} թե՞ {{second}} — համեմատություն | Choosy",
      seoDescription:
        "Համեմատեք {{first}} և {{second}} մոդելները՝ բնութագրերը և Հայաստանի խանութների գները մեկ աղյուսակում։",
    },
  },
        description:
          "iPhone, Samsung Galaxy և այլ սմարթֆոնների գները Հայաստանի խանութներից։ Համեմատեք գները, հիշողությունը և գույները մեկ էջում։",
        intro:
          "Choosy-ը հավաքում է սմարթֆոնների առաջարկները Հայաստանի խանութներից՝ որպեսզի տեսնեք, թե որտեղ է ամենացածր գինը։ Զտեք ըստ ապրանքանիշի, հիշողության ծավալի, էկրանի չափսի և գույնի, ապա անցեք ապրանքի էջ՝ բոլոր խանութների գները միասին տեսնելու համար։",
      },
      laptops: {
        title: "Նոութբուքերի գներ Հայաստանում — համեմատեք և ընտրեք | Choosy",
        description:
          "MacBook, Dell, Lenovo, HP և Samsung նոութբուքերի գները Հայաստանի խանութներից։ Համեմատեք էկրանը, հիշողությունը և գինը։",
        intro:
          "Աշխատանքի, ուսման կամ խաղերի համար նոութբուք ընտրելիս գինը տարբեր խանութներում կարող է զգալիորեն տարբերվել։ Choosy-ը ցույց է տալիս առաջարկները կողք կողքի՝ ըստ ապրանքանիշի, էկրանի չափսի և հիշողության ծավալի։",
      },
      speakers: {
        title: "Շարժական բարձրախոսների գներ Հայաստանում | Choosy",
        description:
          "Bluetooth և շարժական բարձրախոսների գները Հայաստանի խանութներից։ Համեմատեք առաջարկները Choosy-ում։",
        intro:
          "Շարժական բարձրախոսներ՝ տան, ճամփորդության և բացօթյա հանդիպումների համար։ Համեմատեք գները Հայաստանի խանութներից և ընտրեք ձեզ հարմար մոդելը։",
      },
      headphones: {
        title: "Ականջակալների գներ Հայաստանում — AirPods, Sony | Choosy",
        description:
          "AirPods, Sony WH-1000XM5 և այլ ականջակալների գները Հայաստանի խանութներից։ Համեմատեք և ընտրեք լավագույն առաջարկը։",
        intro:
          "Աղմուկի ակտիվ չեղարկումով ականջակալներ և անլար ականջակալներ՝ Հայաստանի խանութների գներով։ Համեմատեք մոդելները և գտեք լավագույն առաջարկը։",
      },
      tablets: {
        title: "Պլանշետների գներ Հայաստանում — iPad, Galaxy Tab | Choosy",
        description:
          "iPad և Samsung Galaxy Tab պլանշետների գները Հայաստանի խանութներից։ Համեմատեք էկրանը, հիշողությունը և գինը։",
        intro:
          "Պլանշետներ՝ մեդիայի, նշումների և ստեղծագործական աշխատանքի համար։ Choosy-ը ցույց է տալիս, թե որ խանութում է ամենաշահավետ գինը։",
      },
      tv: {
        title: "Հեռուստացույցների գներ Հայաստանում — 4K Smart TV | Choosy",
        description:
          "4K և Smart TV հեռուստացույցների գները Հայաստանի խանութներից։ Համեմատեք չափսերը և գները Choosy-ում։",
        intro:
          "Smart TV և 4K հեռուստացույցներ՝ Հայաստանի խանութների գներով։ Համեմատեք էկրանի չափսերը և ընտրեք ձեր սենյակին համապատասխանը։",
      },
      wearables: {
        title: "Խելացի ժամացույցների գներ Հայաստանում | Choosy",
        description:
          "Apple Watch և այլ խելացի ժամացույցների գները Հայաստանի խանութներից։ Համեմատեք առաջարկները Choosy-ում։",
        intro:
          "Խելացի ժամացույցներ՝ մարզումների, առողջության հսկողության և ծանուցումների համար։ Համեմատեք գները Հայաստանի խանութներից։",
      },
      cameras: {
        title: "Ֆոտոխցիկների և օբյեկտիվների գներ Հայաստանում | Choosy",
        description:
          "Ֆոտոխցիկների և օբյեկտիվների գները Հայաստանի խանութներից։ Համեմատեք առաջարկները Choosy-ում։",
        intro:
          "Օբյեկտիվներ և ֆոտոխցիկներ՝ դիմանկարների, ցածր լուսավորության և փողոցային լուսանկարչության համար։ Համեմատեք գները Հայաստանի խանութներից։",
      },
    },
    product: {
      /** {{title}} — ապրանքի անվանումը, {{priceMin}}/{{priceMax}} — գնային միջակայքը։ */
      title: "{{title}} — գներ և առաջարկներ | Choosy",
      description:
        "{{title}}՝ {{priceMin}}–{{priceMax}} դր.։ Համեմատեք գները Հայաստանի խանութներից և ընտրեք լավագույն առաջարկը Choosy-ում։",
    },
    account: {
      title: "Անձնական հաշիվ — Choosy",
      description: "Ձեր նախընտրելիները, դիտված ապրանքները և հաշվի կարգավորումները։",
    },
    shopAccount: {
      title: "Խանութի հաշիվ — Choosy",
      description: "Ապրանքների կառավարում, վիճակագրություն և ֆինանսներ խանութների համար։",
    },
  },
};

export const translations = {
  am,
  en: buildLocale(am, enOverrides),
  ru: buildLocale(am, ruOverrides),
};

export default translations;
