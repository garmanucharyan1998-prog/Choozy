// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "node:util";

/**
 * The jsdom build shipped with react-scripts 5 does not expose these globals, but
 * react-router 7 (via `cookie`) expects them at import time.
 */
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

/** Used by `shared/i18n/mergeLocale` to clone the base locale tree. */
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

/** jsdom has no layout engine, so scrolling is a no-op rather than "not implemented". */
window.scrollTo = () => {};
