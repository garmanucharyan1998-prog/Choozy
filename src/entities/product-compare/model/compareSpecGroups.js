/**
 * Which semantic group a spec row belongs to.
 *
 * The comparison table used to put every spec — screen size, storage, Bluetooth version, model
 * number, manufacturer — into one flat "Specifications" run of a dozen rows. A visitor looking
 * for "how do these two screens differ" had to read the whole thing, because nothing on the page
 * said where the display facts stopped and the connectivity facts started.
 *
 * Grouping is keyed off the spec's own `labelKey` (the ones `entities/product/model/productSpecs`
 * emits) rather than off the category, so it works for every category the catalog has and for
 * every one it grows: a group only appears when the selection actually produced rows for it, and
 * anything unmapped falls into `details` instead of vanishing. That is the whole contract — this
 * file may never *invent* a row, only decide which heading an existing one sits under.
 *
 * `specsExtended.technology` is deliberately in `details` rather than in `display`. It is the one
 * generic label whose meaning changes with the category: a laptop reports "14.2″ Retina/OLED"
 * (display), a TV "HDR10+" (display), a camera "f/1.4 aperture" or "Mirrorless body" (not a
 * display at all — those products have no screen). Filing it under a specific group would be
 * right for two categories and a lie for the third.
 */

/** @type {{ id: string, labelKey: string, labelKeys: string[] }[]} — display order, top to bottom. */
export const COMPARE_SPEC_GROUPS = [
  {
    id: "display",
    labelKey: "comparePage.sections.display",
    labelKeys: [
      "productDetail.specsBrief.screenSize",
      "productDetail.specsExtended.screenType",
      "productDetail.specsExtended.refreshRate",
    ],
  },
  {
    id: "performance",
    labelKey: "comparePage.sections.performance",
    labelKeys: [
      "productDetail.specsBrief.storage",
      "productDetail.specsExtended.ssd",
      "productDetail.specsBrief.ram",
      /** Benchmarks belong with the other performance facts, not in the catch-all. */
      "productDetail.specsExtended.antutu",
      "productDetail.specsExtended.geekbenchSingle",
      "productDetail.specsExtended.geekbenchMulti",
    ],
  },
  {
    id: "camera",
    labelKey: "comparePage.sections.camera",
    labelKeys: ["productDetail.specsExtended.camera"],
  },
  {
    id: "battery",
    labelKey: "comparePage.sections.battery",
    labelKeys: ["productDetail.specsBrief.battery"],
  },
  {
    id: "connectivity",
    labelKey: "comparePage.sections.connectivity",
    labelKeys: [
      "productDetail.specsExtended.bluetooth",
      "productDetail.specsExtended.microphone",
    ],
  },
  {
    id: "design",
    labelKey: "comparePage.sections.design",
    labelKeys: ["productDetail.specsExtended.weight"],
  },
  /**
   * Last, and the fallback: a spec key added to `productSpecs.js` tomorrow lands here rather
   * than being dropped from the table by a lookup that does not know about it yet.
   */
  {
    id: "details",
    labelKey: "comparePage.sections.details",
    labelKeys: [
      "productDetail.specsExtended.technology",
      "productDetail.specsBrief.year",
      "productDetail.specsExtended.warranty",
      "productDetail.specsExtended.modelNumber",
      "productDetail.specsExtended.manufacturer",
    ],
  },
];

const GROUP_ID_BY_LABEL_KEY = new Map(
  COMPARE_SPEC_GROUPS.flatMap((group) => group.labelKeys.map((labelKey) => [labelKey, group.id])),
);

/** The id of the last group, which is also the fallback for anything unmapped. */
const FALLBACK_GROUP_ID = COMPARE_SPEC_GROUPS[COMPARE_SPEC_GROUPS.length - 1].id;

/** @param {string} labelKey @returns {string} */
export const specGroupIdForLabelKey = (labelKey) =>
  GROUP_ID_BY_LABEL_KEY.get(labelKey) ?? FALLBACK_GROUP_ID;
