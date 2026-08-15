import { vi } from "vitest";
import { act, render } from "@testing-library/react";
import { useTruncationTitles } from "./useTruncationTitles";

/**
 * jsdom lays nothing out — every `scrollWidth`/`clientWidth` is 0 — so each element's dimensions
 * are defined explicitly. That is the whole input to the decision this hook makes, so stating it
 * per element is exactly the test: clipped elements get a tooltip, elements that fit do not.
 */
const setBox = (element, { scrollWidth = 0, clientWidth = 0, scrollHeight = 0, clientHeight = 0 }) => {
  Object.defineProperties(element, {
    scrollWidth: { configurable: true, value: scrollWidth },
    clientWidth: { configurable: true, value: clientWidth },
    scrollHeight: { configurable: true, value: scrollHeight },
    clientHeight: { configurable: true, value: clientHeight },
  });
};

const Harness = () => {
  useTruncationTitles();
  return null;
};

/** The hook measures through rAF; running it inline keeps every assertion synchronous. */
const renderHook = () => render(<Harness />);

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    callback(0);
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

const addElement = (className, text, box) => {
  const el = document.createElement("p");
  el.className = className;
  el.textContent = text;
  document.body.appendChild(el);
  setBox(el, box);
  return el;
};

describe("useTruncationTitles", () => {
  test("a single-line truncate that is clipped gets its full text as a tooltip", () => {
    const el = addElement("truncate", "Samsung Galaxy A36 128GB Awesome Lavender", {
      scrollWidth: 300,
      clientWidth: 120,
    });

    renderHook();

    expect(el.getAttribute("title")).toBe("Samsung Galaxy A36 128GB Awesome Lavender");
  });

  /** The reason this is measured rather than declared: most of these fit at most widths. */
  test("text that fits gets no tooltip", () => {
    const el = addElement("truncate", "Short", { scrollWidth: 80, clientWidth: 120 });

    renderHook();

    expect(el.hasAttribute("title")).toBe(false);
  });

  /**
   * The clamp is set inline, not by the class: jsdom applies no stylesheet, so a `line-clamp-2`
   * class name computes to nothing and the hook would fall through to its width branch. The
   * class is what selects the element; the computed clamp is what decides how it is measured,
   * and that is the half being tested here.
   */
  test("a line-clamp is judged on height, not width", () => {
    const clipped = addElement("line-clamp-2", "A description long enough to be clamped", {
      scrollHeight: 90,
      clientHeight: 40,
      scrollWidth: 200,
      clientWidth: 200,
    });
    clipped.style.webkitLineClamp = "2";
    const fits = addElement("line-clamp-2", "Two short lines", {
      scrollHeight: 40,
      clientHeight: 40,
      /* Wider than its box, which for a clamped element is not what truncates it. */
      scrollWidth: 400,
      clientWidth: 200,
    });
    fits.style.webkitLineClamp = "2";

    renderHook();

    expect(clipped.getAttribute("title")).toBe("A description long enough to be clamped");
    expect(fits.hasAttribute("title")).toBe(false);
  });

  /** A hand-written title is someone's deliberate wording; it is not ours to overwrite. */
  test("an existing title is left alone", () => {
    const el = addElement("truncate", "Some clipped label", { scrollWidth: 300, clientWidth: 100 });
    el.setAttribute("title", "Go to your account");

    renderHook();

    expect(el.getAttribute("title")).toBe("Go to your account");
  });

  test("the tooltip is removed again once the text stops being clipped", () => {
    const el = addElement("truncate", "Samsung Galaxy A36", { scrollWidth: 300, clientWidth: 100 });
    renderHook();
    expect(el.hasAttribute("title")).toBe(true);

    /** The viewport grows and the text now fits. */
    setBox(el, { scrollWidth: 300, clientWidth: 400 });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(el.hasAttribute("title")).toBe(false);
  });

  test("empty elements are skipped", () => {
    const el = addElement("truncate", "", { scrollWidth: 300, clientWidth: 100 });

    renderHook();

    expect(el.hasAttribute("title")).toBe(false);
  });

  /**
   * The observer watches childList/characterData and never attributes — writing a title is this
   * hook's own job, so observing attributes would re-trigger it on every write and spin.
   */
  test("setting a title does not feed back into the observer", () => {
    const el = addElement("truncate", "Clipped label", { scrollWidth: 300, clientWidth: 100 });
    let frames = 0;
    vi.stubGlobal("requestAnimationFrame", (callback) => {
      frames += 1;
      if (frames > 50) throw new Error("runaway: the observer is re-triggering itself");
      callback(0);
      return 0;
    });

    renderHook();

    expect(el.getAttribute("title")).toBe("Clipped label");
    expect(frames).toBeLessThan(10);
  });
});
