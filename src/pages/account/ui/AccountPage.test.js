import { ROLES, serializeSessionCookie } from "entities/session";
import { loader } from "./AccountPage";

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

describe("AccountPage loader — buyer dashboard guard", () => {
  test("anonymous visitor is redirected home, language prefix preserved", async () => {
    expect(await redirectLocation("/account", null)).toBe("/");
    expect(await redirectLocation("/ru/account", null)).toBe("/ru");
    expect(await redirectLocation("/en/account", null)).toBe("/en");
  });

  test("a signed-in buyer is let through on every language", async () => {
    expect(await redirectLocation("/account", ROLES.BUYER)).toBeNull();
    expect(await redirectLocation("/ru/account", ROLES.BUYER)).toBeNull();
    expect(await redirectLocation("/en/account", ROLES.BUYER)).toBeNull();
  });

  test("a signed-in seller is redirected to their own dashboard, language prefix preserved", async () => {
    expect(await redirectLocation("/account", ROLES.SELLER)).toBe("/account/shop-account");
    expect(await redirectLocation("/ru/account", ROLES.SELLER)).toBe("/ru/account/shop-account");
    expect(await redirectLocation("/en/account", ROLES.SELLER)).toBe("/en/account/shop-account");
  });
});
