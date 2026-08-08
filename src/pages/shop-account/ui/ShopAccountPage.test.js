import { ROLES, serializeSessionCookie } from "entities/session";
import { loader } from "./ShopAccountPage";

const cookieHeaderFor = (role) =>
  role ? serializeSessionCookie(role, null, { secure: false }).split(";")[0] : undefined;

const requestFor = (path, role) =>
  new Request(`https://x.test${path}`, {
    headers: cookieHeaderFor(role) ? { Cookie: cookieHeaderFor(role) } : {},
  });

const redirectLocation = async (path, role) => {
  try {
    await loader({ request: requestFor(path, role) });
  } catch (thrown) {
    if (thrown instanceof Response) return thrown.headers.get("Location");
    throw thrown;
  }
  return null; // loader returned normally — no redirect
};

describe("ShopAccountPage loader — seller dashboard guard", () => {
  test("anonymous visitor is redirected home, language prefix preserved", async () => {
    expect(await redirectLocation("/account/shop-account", null)).toBe("/");
    expect(await redirectLocation("/ru/account/shop-account", null)).toBe("/ru");
    expect(await redirectLocation("/en/account/shop-account", null)).toBe("/en");
  });

  test("a signed-in seller is let through on every language, including nested tabs", async () => {
    expect(await redirectLocation("/account/shop-account", ROLES.SELLER)).toBeNull();
    expect(await redirectLocation("/account/shop-account/finance", ROLES.SELLER)).toBeNull();
    expect(await redirectLocation("/ru/account/shop-account", ROLES.SELLER)).toBeNull();
    expect(await redirectLocation("/en/account/shop-account", ROLES.SELLER)).toBeNull();
  });

  test("a signed-in buyer is redirected to their own dashboard, language prefix preserved", async () => {
    expect(await redirectLocation("/account/shop-account", ROLES.BUYER)).toBe("/account");
    expect(await redirectLocation("/ru/account/shop-account", ROLES.BUYER)).toBe("/ru/account");
    expect(await redirectLocation("/en/account/shop-account", ROLES.BUYER)).toBe("/en/account");
  });
});
