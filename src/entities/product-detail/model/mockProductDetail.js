/**
 * Demo catalog payload for product detail MVP (replace with API integration later).
 */

const LAPTOP_IMAGE =
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=82";

export const mockProductDetail = {
  id: "apple-macbook-pro-demo",
  galleryImageUrls: Array.from({ length: 6 }, (_, i) => `${LAPTOP_IMAGE}&sig=${i}`),
  variantIds: ["v256a", "v256b", "v1tb"],
  colorIds: ["black", "gray", "white", "blue"],
  colors: [
    { id: "black", hex: "#1c1c1e" },
    { id: "gray", hex: "#aeaeb2" },
    { id: "white", hex: "#f5f5f7" },
    { id: "blue", hex: "#152147" },
  ],
  priceMinAmd: 800500,
  priceMaxAmd: 1079000,
  /** Sample AMD amounts for chart columns (five months); max scale in UI is 400,000. */
  priceHistoryAmd: [250000, 260000, 200000, 320000, 240000],
  /** Zero-based index of the highlighted bar (e.g. April). */
  priceHistoryHighlightIndex: 3,
  /** Shown under «Հակիրճ նկարագրություն». */
  specsBriefRows: [
    { labelKey: "productDetail.specsBrief.screenSize", valueKey: "productDetail.specsBrief.screenSizeValue" },
    { labelKey: "productDetail.specsBrief.storage", valueKey: "productDetail.specsBrief.storageValue" },
    { labelKey: "productDetail.specsBrief.ram", valueKey: "productDetail.specsBrief.ramValue" },
    { labelKey: "productDetail.specsBrief.battery", valueKey: "productDetail.specsBrief.batteryValue" },
    { labelKey: "productDetail.specsBrief.year", valueKey: "productDetail.specsBrief.yearValue" },
  ],
  /** Shown under «Նկարագրություն». */
  specsExtendedRows: [
    { labelKey: "productDetail.specsExtended.screenType", valueKey: "productDetail.specsExtended.screenTypeValue" },
    { labelKey: "productDetail.specsExtended.microphone", valueKey: "productDetail.specsExtended.microphoneValue" },
    { labelKey: "productDetail.specsExtended.technology", valueKey: "productDetail.specsExtended.technologyValue" },
    { labelKey: "productDetail.specsExtended.matrix", valueKey: "productDetail.specsExtended.matrixValue" },
    { labelKey: "productDetail.specsExtended.ssd", valueKey: "productDetail.specsExtended.ssdValue" },
    { labelKey: "productDetail.specsExtended.bluetooth", valueKey: "productDetail.specsExtended.bluetoothValue" },
    { labelKey: "productDetail.specsExtended.manufacturer", valueKey: "productDetail.specsExtended.manufacturerValue" },
  ],
};
