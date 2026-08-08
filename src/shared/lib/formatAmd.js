/** Grouped-thousands AMD amount, no currency suffix (callers append their own "AMD"/"֏"/etc). */
export const formatAmd = (amount) =>
  typeof amount === "number" ? amount.toLocaleString("en-US") : "";

export default formatAmd;
