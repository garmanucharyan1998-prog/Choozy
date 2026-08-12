/**
 * Shared image pool for the demo catalog. `fm=webp` asks Unsplash's own image API to
 * serve WebP instead of the browser negotiating a heavier format — a same-URL,
 * zero-risk win since these are remote images the catalog doesn't control encoding for.
 *
 * Every id below was checked against `images.unsplash.com` with the exact query string
 * built here (HTTP 200, not a redirect to a placeholder): a mistyped or withdrawn photo id
 * is invisible in review and shows up as a broken card in production. Re-check before
 * adding one.
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

  /** Tablets */
  tablet: unsplash("photo-1544244015-0df4b3ffc6b0"),
  tabletBlack: unsplash("photo-1561154464-82e9adf32764"),
  tabletPencil: unsplash("photo-1544244015-9c72fd9c866d"),
  tabletWhite: unsplash("photo-1625864667534-aa5208d45a87"),
  tabletDesk: unsplash("photo-1604399852419-f67ee7d5f2ef"),

  /** Monitors */
  monitor: unsplash("photo-1611648694931-1aeda329f9da"),
  monitorWhite: unsplash("photo-1666771410140-0573b232426e"),
  monitorDual: unsplash("photo-1534972195531-d756b9bfa9f2"),
  monitorDesk: unsplash("photo-1547658718-1cdaa0852790"),

  /** TV */
  tv: unsplash("photo-1593359677879-a4bb92f829d1"),
  tvWall: unsplash("photo-1567690187548-f07b1d7bf5a9"),
  tvStand: unsplash("photo-1601944177325-f8867652837f"),
  tvCabinet: unsplash("photo-1646861039459-fd9e3aabf3fb"),
  tvLarge: unsplash("photo-1461151304267-38535e780c79"),

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

  /** Speakers */
  speaker: unsplash("photo-1608043152269-423dbba4e7e1"),
  speakerRed: unsplash("photo-1589256469067-ea99122bbdc4"),
  speakerWhite: unsplash("photo-1582978571763-2d039e56f0c3"),
  speakerHome: unsplash("photo-1529359744902-86b2ab9edaea"),
  speakerRound: unsplash("photo-1594501432907-91214bfdd928"),
  soundbar: unsplash("photo-1557376382-e96b6778ffdc"),

  /** Wearables */
  watch: unsplash("photo-1434493789847-2f02dc6ca35d"),
  watchBlack: unsplash("photo-1579586337278-3befd40fd17a"),
  watchSport: unsplash("photo-1546868871-7041f2a55e12"),
  watchWhite: unsplash("photo-1617625802912-cde586faf331"),
  watchFitness: unsplash("photo-1624096104992-9b4fa3a279dd"),

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

  /** Consoles and controllers */
  console: unsplash("photo-1607853202273-797f1c22a38e"),
  consoleRetro: unsplash("photo-1550745165-9bc0b252726f"),
  consoleTv: unsplash("photo-1486572788966-cfd3df1f5b42"),
  controller: unsplash("photo-1592840496694-26d035b52b48"),
  controllerXbox: unsplash("photo-1585620385456-4759f9b5c7d9"),
  controllerWhite: unsplash("photo-1580234811497-9df7fd2f357e"),
  controllerNintendo: unsplash("photo-1630051822408-b80dde2f5681"),
  vrHeadset: unsplash("photo-1622979135225-d2ba269cf1ac"),

  /** Accessories */
  keyboard: unsplash("photo-1618384887929-16ec33fab9ef"),
  keyboardWhite: unsplash("photo-1595044426077-d36d9236d54a"),
  mouse: unsplash("photo-1527864550417-7fd91fc51a46"),
  mouseWireless: unsplash("photo-1527814050087-3793815479db"),
  router: unsplash("photo-1606904825846-647eb07f5be2"),
  powerBank: unsplash("photo-1566554738544-d962991c3fee"),
  projector: unsplash("photo-1535016120720-40c646be5580"),
};

/**
 * Per-category image sets for detail-page galleries — several distinct, already-verified
 * URLs per category instead of one image repeated N times (`repeatGallery`, removed).
 * Not truly per-product (these are stock photos, not real product shots), but a
 * meaningfully closer approximation than a single frame duplicated across the gallery.
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
    PRODUCT_IMAGES.phoneColorRow,
    PRODUCT_IMAGES.phoneOnDesk,
  ],
  laptops: [
    PRODUCT_IMAGES.macbook,
    PRODUCT_IMAGES.laptop,
    PRODUCT_IMAGES.gamingLaptop,
    PRODUCT_IMAGES.laptopSilver,
    PRODUCT_IMAGES.macbookDesk,
  ],
  tablets: [
    PRODUCT_IMAGES.tablet,
    PRODUCT_IMAGES.tabletPencil,
    PRODUCT_IMAGES.tabletWhite,
    PRODUCT_IMAGES.tabletDesk,
  ],
  monitors: [
    PRODUCT_IMAGES.monitor,
    PRODUCT_IMAGES.monitorDesk,
    PRODUCT_IMAGES.monitorWhite,
    PRODUCT_IMAGES.monitorDual,
  ],
  tv: [PRODUCT_IMAGES.tv, PRODUCT_IMAGES.tvWall, PRODUCT_IMAGES.tvStand, PRODUCT_IMAGES.tvCabinet],
  headphones: [
    PRODUCT_IMAGES.headphones,
    PRODUCT_IMAGES.earbuds,
    PRODUCT_IMAGES.headphonesBlack,
    PRODUCT_IMAGES.earbudsCase,
  ],
  speakers: [
    PRODUCT_IMAGES.speaker,
    PRODUCT_IMAGES.speakerRound,
    PRODUCT_IMAGES.speakerWhite,
    PRODUCT_IMAGES.speakerHome,
  ],
  wearables: [
    PRODUCT_IMAGES.watch,
    PRODUCT_IMAGES.watchBlack,
    PRODUCT_IMAGES.watchSport,
    PRODUCT_IMAGES.watchFitness,
  ],
  cameras: [
    PRODUCT_IMAGES.cameraBody,
    PRODUCT_IMAGES.lens,
    PRODUCT_IMAGES.cameraSony,
    PRODUCT_IMAGES.lensWide,
  ],
  consoles: [
    PRODUCT_IMAGES.console,
    PRODUCT_IMAGES.controller,
    PRODUCT_IMAGES.consoleTv,
    PRODUCT_IMAGES.controllerXbox,
  ],
  accessories: [
    PRODUCT_IMAGES.keyboard,
    PRODUCT_IMAGES.mouse,
    PRODUCT_IMAGES.keyboardWhite,
    PRODUCT_IMAGES.router,
  ],
};

/**
 * Builds a product's gallery: its own listing image first (so the primary photo always
 * matches the catalog card), then the rest of its category's set.
 * @param {{ image: string, categoryId: string }} product
 */
export const buildGalleryForProduct = (product) => {
  const categorySet = CATEGORY_GALLERY[product.categoryId] || [product.image];
  const rest = categorySet.filter((url) => url !== product.image);
  return [product.image, ...rest];
};
