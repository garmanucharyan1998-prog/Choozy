/**
 * Shared image pool for the demo catalog. `fm=webp` asks Unsplash's own image API to
 * serve WebP instead of the browser negotiating a heavier format — a same-URL,
 * zero-risk win since these are remote images the catalog doesn't control encoding for.
 *
 * Every id below was checked against `images.unsplash.com` with the exact query string
 * built here (HTTP 200, not a redirect to a placeholder): a mistyped or withdrawn photo id
 * is invisible in review and shows up as a broken card in production. Re-check before
 * adding one.
 *
 * A 200 only proves *an* image exists there, not that it shows the right thing, so every id
 * added in the last pass was also opened and looked at. Five candidates were dropped for
 * exactly that reason: a MacBook returned by a "computer monitor" search, a neon "WiFi" sign
 * returned by "wifi router", and three 1970s CRT sets returned by "television" — each would
 * have sat in a 2025 product's gallery as a picture of something else.
 */
/** The crop every catalog image is requested at — exported so markup can declare the real size. */
export const PRODUCT_IMAGE_WIDTH = 1200;
export const PRODUCT_IMAGE_HEIGHT = 900;

const IMG_CROP = `auto=format&fm=webp&fit=crop&w=${PRODUCT_IMAGE_WIDTH}&h=${PRODUCT_IMAGE_HEIGHT}&q=85`;

const unsplash = (photoId) => `https://images.unsplash.com/${photoId}?${IMG_CROP}`;

/**
 * Grouped by the category that uses them. Stock photography, not real product shots, so a
 * key names the *kind* of thing in the frame (`phoneWhite`, `laptopSilver`) rather than a
 * model — a key like `iphone17` would start lying the moment it were reused.
 */
export const PRODUCT_IMAGES = {
  /** Smartphones */
  iphoneOrange: unsplash("photo-1592750475338-74b7b21085ab"),
  iphoneBlack: unsplash("photo-1511707171634-5f897ff02aa9"),
  samsungPhone: unsplash("photo-1610945265064-0e34e5519bbf"),
  phoneWhite: unsplash("photo-1634403665481-74948d815f03"),
  phoneSilver: unsplash("photo-1523206489230-c012c64b2b48"),
  phoneColorRow: unsplash("photo-1707438095940-1eee18e85400"),
  androidPhone: unsplash("photo-1598965402089-897ce52e8355"),
  pixelPhone: unsplash("photo-1756517313520-c6c25364ce65"),
  phoneOnBlack: unsplash("photo-1583573636246-18cb2246697f"),
  phoneOnDesk: unsplash("photo-1591337676887-a217a6970a8a"),
  phoneOnWood: unsplash("photo-1585060544812-6b45742d762f"),
  phoneApps: unsplash("photo-1603145733146-ae562a55031e"),
  phoneInHand: unsplash("photo-1592890288564-76628a30a657"),
  phoneAndroidHome: unsplash("photo-1598327105666-5b89351aff97"),
  phoneWhiteHand: unsplash("photo-1512428559087-560fa5ceab42"),
  phoneOutdoor: unsplash("photo-1570101945621-945409a6370f"),
  phoneHeld: unsplash("photo-1572016047668-5b5e909e1605"),
  phoneBackPair: unsplash("photo-1621330396173-e41b1cafd17f"),
  phoneCameraBacks: unsplash("photo-1574944985070-8f3ebc6b79d2"),

  /** Laptops */
  macbook: unsplash("photo-1517336714731-489689fd1ca8"),
  macbookAir: unsplash("photo-1541807084-5c52b6b3adef"),
  macbookDesk: unsplash("photo-1537498425277-c283d32ef9db"),
  laptop: unsplash("photo-1496181133206-80ce9b88a853"),
  laptopSilver: unsplash("photo-1611186871348-b1ce696e52c9"),
  laptopBlack: unsplash("photo-1531297484001-80022131f5a1"),
  asusLaptop: unsplash("photo-1588872657578-7efd1f1555ed"),
  acerLaptop: unsplash("photo-1522199755839-a2bacb67c546"),
  gamingLaptop: unsplash("photo-1593642632823-8f785ba67e45"),
  gamingLaptopDesk: unsplash("photo-1630794180018-433d915c34ac"),
  laptopCafe: unsplash("photo-1484788984921-03950022c9ef"),
  laptopUltrabook: unsplash("photo-1593642702821-c8da6771f0c6"),
  laptopBusiness: unsplash("photo-1618424181497-157f25b6ddd5"),
  laptopBrowsing: unsplash("photo-1542744095-291d1f67b221"),
  laptopOffice: unsplash("photo-1597673030062-0a0f1a801a31"),

  /** Tablets */
  tablet: unsplash("photo-1544244015-0df4b3ffc6b0"),
  tabletBlack: unsplash("photo-1561154464-82e9adf32764"),
  tabletPencil: unsplash("photo-1544244015-9c72fd9c866d"),
  tabletWhite: unsplash("photo-1625864667534-aa5208d45a87"),
  tabletDesk: unsplash("photo-1604399852419-f67ee7d5f2ef"),
  tabletCase: unsplash("photo-1623126908029-58cb08a2b272"),
  tabletInHand: unsplash("photo-1542751110-97427bbecf20"),
  tabletHeld: unsplash("photo-1521633286323-05b17f47cb74"),
  tabletPair: unsplash("photo-1585790050230-5dd28404ccb9"),
  tabletBrowsing: unsplash("photo-1557825835-70d97c4aa567"),

  /** Monitors */
  monitor: unsplash("photo-1611648694931-1aeda329f9da"),
  monitorWhite: unsplash("photo-1666771410140-0573b232426e"),
  monitorDual: unsplash("photo-1534972195531-d756b9bfa9f2"),
  monitorDesk: unsplash("photo-1547658718-1cdaa0852790"),
  monitorCurved: unsplash("photo-1551739440-5dd934d3a94a"),
  monitorAllInOne: unsplash("photo-1527443224154-c4a3942d3acf"),
  monitorMinimal: unsplash("photo-1585792180666-f7347c490ee2"),
  monitorWorkspace: unsplash("photo-1517059224940-d4af9eec41b7"),
  monitorOnStand: unsplash("photo-1494173853739-c21f58b16055"),

  /** TV */
  tv: unsplash("photo-1593359677879-a4bb92f829d1"),
  tvWall: unsplash("photo-1567690187548-f07b1d7bf5a9"),
  tvStand: unsplash("photo-1601944177325-f8867652837f"),
  tvCabinet: unsplash("photo-1646861039459-fd9e3aabf3fb"),
  tvLarge: unsplash("photo-1461151304267-38535e780c79"),
  tvLiving: unsplash("photo-1692188071339-2825a8a997f1"),
  tvSideboard: unsplash("photo-1584280795027-321f4d68e77b"),
  tvRemote: unsplash("photo-1593784991188-c899ca07263b"),
  tvStreaming: unsplash("photo-1613280194169-6bb2f32a6bfa"),
  tvPanelWall: unsplash("photo-1633604712918-6ab1173d0ecd"),
  tvBrickWall: unsplash("photo-1619233543829-665423afedc3"),

  /** Headphones and earbuds */
  headphones: unsplash("photo-1505740420928-5e560c06d30e"),
  headphonesBlack: unsplash("photo-1618366712010-f4ae9c647dcb"),
  headphonesSilver: unsplash("photo-1583394838336-acd977736f90"),
  headphonesWhite: unsplash("photo-1577174881658-0f30ed549adc"),
  headphonesPink: unsplash("photo-1613040809024-b4ef7ba99bc3"),
  earbuds: unsplash("photo-1606220945770-b5b6c2c55bf1"),
  earbudsWhite: unsplash("photo-1572569511254-d8f925fe2cbb"),
  earbudsCase: unsplash("photo-1606841837239-c5a1a4a07af7"),
  earbudsBlue: unsplash("photo-1606220588913-b3aacb4d2f46"),
  earbudsTrio: unsplash("photo-1590658268037-6bf12165a8df"),
  earbudsOpen: unsplash("photo-1600294037681-c80b4cb5b434"),

  /** Speakers */
  speaker: unsplash("photo-1608043152269-423dbba4e7e1"),
  speakerRed: unsplash("photo-1589256469067-ea99122bbdc4"),
  speakerWhite: unsplash("photo-1582978571763-2d039e56f0c3"),
  speakerHome: unsplash("photo-1529359744902-86b2ab9edaea"),
  speakerRound: unsplash("photo-1594501432907-91214bfdd928"),
  soundbar: unsplash("photo-1557376382-e96b6778ffdc"),
  speakerPortable: unsplash("photo-1589003077984-894e133dabab"),
  speakerMesh: unsplash("photo-1507878566509-a0dbe19677a5"),
  speakerClip: unsplash("photo-1588131153911-a4ea5189fe19"),
  speakerMini: unsplash("photo-1547052178-7f2c5a20c332"),

  /** Wearables */
  watch: unsplash("photo-1434493789847-2f02dc6ca35d"),
  watchBlack: unsplash("photo-1579586337278-3befd40fd17a"),
  watchSport: unsplash("photo-1546868871-7041f2a55e12"),
  watchWhite: unsplash("photo-1617625802912-cde586faf331"),
  watchFitness: unsplash("photo-1624096104992-9b4fa3a279dd"),
  watchSilver: unsplash("photo-1660844817855-3ecc7ef21f12"),
  watchWrist: unsplash("photo-1508685096489-7aacd43bd3b1"),
  watchAngled: unsplash("photo-1637160151663-a410315e4e75"),
  watchApps: unsplash("photo-1551816230-ef5deaed4a26"),
  watchBoxed: unsplash("photo-1617043983671-adaadcaa2460"),

  /** Cameras and lenses */
  lens: unsplash("photo-1502920917128-1aa500764cbd"),
  lensWide: unsplash("photo-1580852300513-9b50125bf293"),
  lensPortrait: unsplash("photo-1568840739765-838c480554bb"),
  cameraBody: unsplash("photo-1512790182412-b19e6d62bc39"),
  cameraSony: unsplash("photo-1516035069371-29a1b244cc32"),
  cameraNikon: unsplash("photo-1581591524425-c7e0978865fc"),
  cameraCanon: unsplash("photo-1500634245200-e5245c7574ef"),
  actionCamera: unsplash("photo-1562878671-b3efe27953b9"),
  drone: unsplash("photo-1507582020474-9a35b7d455d9"),
  cameraMirrorless: unsplash("photo-1616088886430-ccd86fef0713"),
  cameraDials: unsplash("photo-1536632087471-3cf3f2986328"),

  /** Consoles and controllers */
  console: unsplash("photo-1607853202273-797f1c22a38e"),
  consoleRetro: unsplash("photo-1550745165-9bc0b252726f"),
  consoleTv: unsplash("photo-1486572788966-cfd3df1f5b42"),
  controller: unsplash("photo-1592840496694-26d035b52b48"),
  controllerXbox: unsplash("photo-1585620385456-4759f9b5c7d9"),
  controllerWhite: unsplash("photo-1580234811497-9df7fd2f357e"),
  controllerNintendo: unsplash("photo-1630051822408-b80dde2f5681"),
  vrHeadset: unsplash("photo-1622979135225-d2ba269cf1ac"),
  consoleCoop: unsplash("photo-1493711662062-fa541adb3fc8"),
  controllerNeon: unsplash("photo-1612287230202-1ff1d85d1bdf"),
  controllerPlay: unsplash("photo-1600861194942-f883de0dfe96"),

  /** Accessories */
  keyboard: unsplash("photo-1618384887929-16ec33fab9ef"),
  keyboardWhite: unsplash("photo-1595044426077-d36d9236d54a"),
  mouse: unsplash("photo-1527864550417-7fd91fc51a46"),
  mouseWireless: unsplash("photo-1527814050087-3793815479db"),
  router: unsplash("photo-1606904825846-647eb07f5be2"),
  powerBank: unsplash("photo-1566554738544-d962991c3fee"),
  projector: unsplash("photo-1535016120720-40c646be5580"),
  keyboardBacklit: unsplash("photo-1547394765-185e1e68f34e"),
  keyboardMechanical: unsplash("photo-1635987391914-cb84b567e68f"),
  powerBankCables: unsplash("photo-1585995603413-eb35b5f4a50b"),
};

/**
 * The pool a category's galleries are drawn from — every verified frame that shows that kind
 * of product, not a hand-picked four. Each category has at least eight, so the windows below
 * have something to differ by.
 *
 * Every category the catalog carries needs an entry: without one a product falls back to
 * `[product.image]` and its gallery is a single thumbnail, which is what `tv`, `wearables`
 * and `cameras` used to get from their one-image sets.
 */
const CATEGORY_GALLERY = {
  smartphones: [
    PRODUCT_IMAGES.iphoneOrange,
    PRODUCT_IMAGES.iphoneBlack,
    PRODUCT_IMAGES.samsungPhone,
    PRODUCT_IMAGES.phoneWhite,
    PRODUCT_IMAGES.phoneSilver,
    PRODUCT_IMAGES.phoneColorRow,
    PRODUCT_IMAGES.androidPhone,
    PRODUCT_IMAGES.pixelPhone,
    PRODUCT_IMAGES.phoneOnBlack,
    PRODUCT_IMAGES.phoneOnDesk,
    PRODUCT_IMAGES.phoneOnWood,
    PRODUCT_IMAGES.phoneApps,
    PRODUCT_IMAGES.phoneInHand,
    PRODUCT_IMAGES.phoneAndroidHome,
    PRODUCT_IMAGES.phoneWhiteHand,
    PRODUCT_IMAGES.phoneOutdoor,
    PRODUCT_IMAGES.phoneHeld,
    PRODUCT_IMAGES.phoneBackPair,
    PRODUCT_IMAGES.phoneCameraBacks,
  ],
  laptops: [
    PRODUCT_IMAGES.macbook,
    PRODUCT_IMAGES.macbookAir,
    PRODUCT_IMAGES.macbookDesk,
    PRODUCT_IMAGES.laptop,
    PRODUCT_IMAGES.laptopSilver,
    PRODUCT_IMAGES.laptopBlack,
    PRODUCT_IMAGES.asusLaptop,
    PRODUCT_IMAGES.acerLaptop,
    PRODUCT_IMAGES.gamingLaptop,
    PRODUCT_IMAGES.gamingLaptopDesk,
    PRODUCT_IMAGES.laptopCafe,
    PRODUCT_IMAGES.laptopUltrabook,
    PRODUCT_IMAGES.laptopBusiness,
    PRODUCT_IMAGES.laptopBrowsing,
    PRODUCT_IMAGES.laptopOffice,
  ],
  tablets: [
    PRODUCT_IMAGES.tablet,
    PRODUCT_IMAGES.tabletBlack,
    PRODUCT_IMAGES.tabletPencil,
    PRODUCT_IMAGES.tabletWhite,
    PRODUCT_IMAGES.tabletDesk,
    PRODUCT_IMAGES.tabletCase,
    PRODUCT_IMAGES.tabletInHand,
    PRODUCT_IMAGES.tabletHeld,
    PRODUCT_IMAGES.tabletPair,
    PRODUCT_IMAGES.tabletBrowsing,
  ],
  monitors: [
    PRODUCT_IMAGES.monitor,
    PRODUCT_IMAGES.monitorDesk,
    PRODUCT_IMAGES.monitorWhite,
    PRODUCT_IMAGES.monitorDual,
    PRODUCT_IMAGES.monitorCurved,
    PRODUCT_IMAGES.monitorAllInOne,
    PRODUCT_IMAGES.monitorMinimal,
    PRODUCT_IMAGES.monitorWorkspace,
    PRODUCT_IMAGES.monitorOnStand,
  ],
  tv: [
    PRODUCT_IMAGES.tv,
    PRODUCT_IMAGES.tvWall,
    PRODUCT_IMAGES.tvStand,
    PRODUCT_IMAGES.tvCabinet,
    PRODUCT_IMAGES.tvLarge,
    PRODUCT_IMAGES.tvLiving,
    PRODUCT_IMAGES.tvSideboard,
    PRODUCT_IMAGES.tvRemote,
    PRODUCT_IMAGES.tvStreaming,
    PRODUCT_IMAGES.tvPanelWall,
    PRODUCT_IMAGES.tvBrickWall,
  ],
  headphones: [
    PRODUCT_IMAGES.headphones,
    PRODUCT_IMAGES.headphonesBlack,
    PRODUCT_IMAGES.headphonesSilver,
    PRODUCT_IMAGES.headphonesWhite,
    PRODUCT_IMAGES.headphonesPink,
    PRODUCT_IMAGES.earbuds,
    PRODUCT_IMAGES.earbudsWhite,
    PRODUCT_IMAGES.earbudsCase,
    PRODUCT_IMAGES.earbudsBlue,
    PRODUCT_IMAGES.earbudsTrio,
    PRODUCT_IMAGES.earbudsOpen,
  ],
  speakers: [
    PRODUCT_IMAGES.speaker,
    PRODUCT_IMAGES.speakerRed,
    PRODUCT_IMAGES.speakerWhite,
    PRODUCT_IMAGES.speakerHome,
    PRODUCT_IMAGES.speakerRound,
    PRODUCT_IMAGES.soundbar,
    PRODUCT_IMAGES.speakerPortable,
    PRODUCT_IMAGES.speakerMesh,
    PRODUCT_IMAGES.speakerClip,
    PRODUCT_IMAGES.speakerMini,
  ],
  wearables: [
    PRODUCT_IMAGES.watch,
    PRODUCT_IMAGES.watchBlack,
    PRODUCT_IMAGES.watchSport,
    PRODUCT_IMAGES.watchWhite,
    PRODUCT_IMAGES.watchFitness,
    PRODUCT_IMAGES.watchSilver,
    PRODUCT_IMAGES.watchWrist,
    PRODUCT_IMAGES.watchAngled,
    PRODUCT_IMAGES.watchApps,
    PRODUCT_IMAGES.watchBoxed,
  ],
  cameras: [
    PRODUCT_IMAGES.cameraBody,
    PRODUCT_IMAGES.cameraSony,
    PRODUCT_IMAGES.cameraNikon,
    PRODUCT_IMAGES.cameraCanon,
    PRODUCT_IMAGES.cameraMirrorless,
    PRODUCT_IMAGES.cameraDials,
    PRODUCT_IMAGES.lens,
    PRODUCT_IMAGES.lensWide,
    PRODUCT_IMAGES.lensPortrait,
    PRODUCT_IMAGES.actionCamera,
    PRODUCT_IMAGES.drone,
  ],
  consoles: [
    PRODUCT_IMAGES.console,
    PRODUCT_IMAGES.consoleRetro,
    PRODUCT_IMAGES.consoleTv,
    PRODUCT_IMAGES.consoleCoop,
    PRODUCT_IMAGES.controller,
    PRODUCT_IMAGES.controllerXbox,
    PRODUCT_IMAGES.controllerWhite,
    PRODUCT_IMAGES.controllerNintendo,
    PRODUCT_IMAGES.controllerNeon,
    PRODUCT_IMAGES.controllerPlay,
    PRODUCT_IMAGES.vrHeadset,
  ],
  accessories: [
    PRODUCT_IMAGES.keyboard,
    PRODUCT_IMAGES.keyboardWhite,
    PRODUCT_IMAGES.keyboardBacklit,
    PRODUCT_IMAGES.keyboardMechanical,
    PRODUCT_IMAGES.mouse,
    PRODUCT_IMAGES.mouseWireless,
    PRODUCT_IMAGES.router,
    PRODUCT_IMAGES.powerBank,
    PRODUCT_IMAGES.powerBankCables,
    PRODUCT_IMAGES.projector,
  ],
};

/** How many frames a detail-page gallery shows, the listing image included. */
const GALLERY_SIZE = 5;

/**
 * Same positional hash as `productPriceHistory`/`productOffers`: order-sensitive, so ids that
 * are permutations of one another ("fp-12"/"fp-21") do not collide onto the same window.
 */
const hashProductId = (id) =>
  String(id)
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);

/**
 * A product's gallery: its own listing image first (so the primary photo always matches the
 * catalog card), then a window over its category's pool, opened at an offset derived from the
 * product id.
 *
 * The offset is the point. Every product in a category used to receive the *same* four
 * follow-up frames in the same order, so all 22 smartphone pages had an identical gallery
 * after the first thumbnail — the pages looked copied because, past frame one, they were.
 * Seeded by the id rather than `Math.random()` so a page's gallery does not reshuffle between
 * the server render and the client's first paint.
 *
 * @param {{ id: string, image: string, categoryId: string }} product
 */
export const buildGalleryForProduct = (product) => {
  const pool = CATEGORY_GALLERY[product.categoryId] || [];
  const rest = pool.filter((url) => url !== product.image);
  if (rest.length === 0) return [product.image];

  const offset = Math.abs(hashProductId(product.id)) % rest.length;
  const rotated = [...rest.slice(offset), ...rest.slice(0, offset)];
  return [product.image, ...rotated.slice(0, GALLERY_SIZE - 1)];
};
