import { renderHook } from "@testing-library/react";
import { useLockBodyScroll } from "./useLockBodyScroll";

beforeEach(() => {
  document.body.style.overflow = "";
});

describe("useLockBodyScroll", () => {
  test("locks while open and restores on close", () => {
    const { unmount } = renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  test("does nothing when not locked", () => {
    renderHook(() => useLockBodyScroll(false));
    expect(document.body.style.overflow).toBe("");
  });

  /**
   * Two panels can be open at once — the login modal over the mobile menu. Each effect used
   * to capture `body.style.overflow` at its own mount, so closing the first restored "" while
   * the second was still open (scrolling behind an overlay) and closing the second wrote back
   * "hidden", leaving the page permanently unscrollable.
   */
  test("overlapping panels: closing the first keeps the lock, closing the last releases it", () => {
    const outer = renderHook(() => useLockBodyScroll(true));
    const inner = renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe("hidden");

    outer.unmount();
    expect(document.body.style.overflow).toBe("hidden");

    inner.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  test("restores whatever value was there before the first lock, not a hardcoded default", () => {
    document.body.style.overflow = "clip";
    const { unmount } = renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("clip");
  });
});
