import {
  ACCOUNT_ROOT,
  dashboardPathForRole,
  FAVORITES_PATH,
  readSessionFromRequest,
  requireAccountAccess,
  resolveAccountRouteRedirect,
  ROLES,
  serializeClearedSessionCookie,
  serializeSessionCookie,
  SESSION_COOKIE_NAME,
  SHOP_ACCOUNT_ROOT,
} from "./sessionModel";

const SIGNED_OUT = { isAuthenticated: false, role: null };
const BUYER = { isAuthenticated: true, role: ROLES.BUYER };
const SELLER = { isAuthenticated: true, role: ROLES.SELLER };

const requestWithCookie = (cookieHeader) =>
  new Request("https://x.test/account", {
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });

describe("readSessionFromRequest — cookie parsing", () => {
  test("no Cookie header → signed out", () => {
    expect(readSessionFromRequest(requestWithCookie(null))).toEqual({
      isAuthenticated: false,
      role: null,
      email: null,
    });
  });

  test("empty Cookie header → signed out", () => {
    expect(readSessionFromRequest(requestWithCookie(""))).toEqual({
      isAuthenticated: false,
      role: null,
      email: null,
    });
  });

  test("buyer session round-trips", () => {
    const cookie = serializeSessionCookie(ROLES.BUYER, "buyer.demo@choosy.am", { secure: false });
    const header = cookie.split(";")[0]; // just `name=value`, like a real Cookie header
    const session = readSessionFromRequest(requestWithCookie(header));
    expect(session.isAuthenticated).toBe(true);
    expect(session.role).toBe(ROLES.BUYER);
    expect(session.email).toBe("buyer.demo@choosy.am");
  });

  test("seller session round-trips", () => {
    const cookie = serializeSessionCookie(ROLES.SELLER, "seller.demo@choosy.am", { secure: false });
    const header = cookie.split(";")[0];
    const session = readSessionFromRequest(requestWithCookie(header));
    expect(session.role).toBe(ROLES.SELLER);
  });

  test("multiple cookies with whitespace — picks the right one", () => {
    const value = encodeURIComponent(JSON.stringify({ r: ROLES.SELLER, e: null }));
    const header = `choozy-language=ru;  ${SESSION_COOKIE_NAME}=${value} ; other=1`;
    expect(readSessionFromRequest(requestWithCookie(header)).role).toBe(ROLES.SELLER);
  });

  test("unknown role value → signed out", () => {
    const value = encodeURIComponent(JSON.stringify({ r: "admin", e: null }));
    const header = `${SESSION_COOKIE_NAME}=${value}`;
    expect(readSessionFromRequest(requestWithCookie(header))).toMatchObject({
      isAuthenticated: false,
      role: null,
    });
  });

  test("a differently-prefixed cookie name must not false-match (no naive `includes`)", () => {
    const value = encodeURIComponent(JSON.stringify({ r: ROLES.BUYER, e: null }));
    const header = `${SESSION_COOKIE_NAME}_extra=${value}`;
    expect(readSessionFromRequest(requestWithCookie(header))).toMatchObject({
      isAuthenticated: false,
    });
  });

  test("malformed JSON in the cookie value → signed out, does not throw", () => {
    const header = `${SESSION_COOKIE_NAME}=${encodeURIComponent("{not json")}`;
    expect(() => readSessionFromRequest(requestWithCookie(header))).not.toThrow();
    expect(readSessionFromRequest(requestWithCookie(header)).isAuthenticated).toBe(false);
  });
});

describe("serializeSessionCookie / serializeClearedSessionCookie", () => {
  test("set cookie carries the expected attributes", () => {
    const cookie = serializeSessionCookie(ROLES.BUYER, "a@b.com", { secure: false });
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=2592000");
    expect(cookie).not.toContain("Secure");
  });

  test("secure:true adds the Secure attribute", () => {
    expect(serializeSessionCookie(ROLES.BUYER, null, { secure: true })).toContain("Secure");
  });

  test("clearing sets Max-Age=0 and matches the setter's Path/SameSite byte-for-byte", () => {
    const set = serializeSessionCookie(ROLES.BUYER, null, { secure: false });
    const cleared = serializeClearedSessionCookie({ secure: false });
    expect(cleared).toContain("Max-Age=0");
    const attrsOf = (cookie) =>
      cookie
        .split(";")
        .map((p) => p.trim())
        .filter((p) => p.startsWith("Path=") || p.startsWith("SameSite="));
    expect(attrsOf(cleared)).toEqual(attrsOf(set));
  });
});

describe("dashboardPathForRole", () => {
  test("seller → shop dashboard, everything else → buyer dashboard", () => {
    expect(dashboardPathForRole(ROLES.SELLER)).toBe(SHOP_ACCOUNT_ROOT);
    expect(dashboardPathForRole(ROLES.BUYER)).toBe(ACCOUNT_ROOT);
    expect(dashboardPathForRole(null)).toBe(ACCOUNT_ROOT);
  });
});

describe("resolveAccountRouteRedirect — the access matrix", () => {
  const BUYER_ONLY_PATHS = [
    "/account",
    "/account/recent",
    "/account/subscription",
    "/account/notifications",
  ];
  const SHOP_PATHS = [
    "/account/shop-account",
    "/account/shop-account/products",
    "/account/shop-account/statistics",
    "/account/shop-account/finance",
  ];

  test("anonymous: bounced from buyer-only and shop paths, but favorites stays open", () => {
    BUYER_ONLY_PATHS.forEach((p) => expect(resolveAccountRouteRedirect(p, SIGNED_OUT)).toBe("/"));
    SHOP_PATHS.forEach((p) => expect(resolveAccountRouteRedirect(p, SIGNED_OUT)).toBe("/"));
    expect(resolveAccountRouteRedirect(FAVORITES_PATH, SIGNED_OUT)).toBeNull();
  });

  test("buyer: own pages and favorites allowed, shop pages redirect to /account", () => {
    BUYER_ONLY_PATHS.forEach((p) => expect(resolveAccountRouteRedirect(p, BUYER)).toBeNull());
    expect(resolveAccountRouteRedirect(FAVORITES_PATH, BUYER)).toBeNull();
    SHOP_PATHS.forEach((p) => expect(resolveAccountRouteRedirect(p, BUYER)).toBe(ACCOUNT_ROOT));
  });

  test("seller: shop pages allowed, buyer pages and favorites redirect to shop dashboard", () => {
    SHOP_PATHS.forEach((p) => expect(resolveAccountRouteRedirect(p, SELLER)).toBeNull());
    BUYER_ONLY_PATHS.forEach((p) =>
      expect(resolveAccountRouteRedirect(p, SELLER)).toBe(SHOP_ACCOUNT_ROOT),
    );
    expect(resolveAccountRouteRedirect(FAVORITES_PATH, SELLER)).toBe(SHOP_ACCOUNT_ROOT);
  });

  test("prefix trap: /account/shop-accountant is buyer area, not seller area", () => {
    expect(resolveAccountRouteRedirect("/account/shop-accountant", SIGNED_OUT)).toBe("/");
    expect(resolveAccountRouteRedirect("/account/shop-accountant", BUYER)).toBeNull();
    expect(resolveAccountRouteRedirect("/account/shop-accountant", SELLER)).toBe(
      SHOP_ACCOUNT_ROOT,
    );
  });

  test("trailing slash is normalized", () => {
    expect(resolveAccountRouteRedirect("/account/shop-account/", SIGNED_OUT)).toBe("/");
    expect(resolveAccountRouteRedirect("/account/shop-account/", SELLER)).toBeNull();
  });
});

describe("requireAccountAccess — loader guard", () => {
  test("throws a redirect Response with a language-agnostic target preserving no language when am", () => {
    const request = new Request("https://x.test/account/shop-account");
    const thrown = (() => {
      try {
        requireAccountAccess(request);
        return null;
      } catch (e) {
        return e;
      }
    })();
    expect(thrown).toBeInstanceOf(Response);
    expect(thrown.headers.get("Location")).toBe("/");
  });

  test("preserves the ru language prefix on redirect", () => {
    const request = new Request("https://x.test/ru/account/shop-account");
    let thrown = null;
    try {
      requireAccountAccess(request);
    } catch (e) {
      thrown = e;
    }
    expect(thrown.headers.get("Location")).toBe("/ru");
  });

  test("preserves the en language prefix and lands sellers on their own dashboard from a buyer page", () => {
    const cookie = serializeSessionCookie(ROLES.SELLER, null, { secure: false }).split(";")[0];
    const request = new Request("https://x.test/en/account/favorite", {
      headers: { Cookie: cookie },
    });
    let thrown = null;
    try {
      requireAccountAccess(request);
    } catch (e) {
      thrown = e;
    }
    expect(thrown.headers.get("Location")).toBe("/en/account/shop-account");
  });

  test("allows the request through (returns undefined, throws nothing) when access is granted", () => {
    const cookie = serializeSessionCookie(ROLES.BUYER, null, { secure: false }).split(";")[0];
    const request = new Request("https://x.test/account", { headers: { Cookie: cookie } });
    expect(() => requireAccountAccess(request)).not.toThrow();
  });
});
