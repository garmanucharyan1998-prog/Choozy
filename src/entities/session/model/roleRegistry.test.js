import { ROLES } from "./sessionModel";
import { readRoleForEmail, rememberRoleForEmail } from "./roleRegistry";

beforeEach(() => {
  window.localStorage.clear();
});

describe("role registry — login without asking for a role", () => {
  test("the two seeded demo accounts resolve without ever registering", () => {
    expect(readRoleForEmail("buyer.demo@choosy.am")).toBe(ROLES.BUYER);
    expect(readRoleForEmail("seller.demo@choosy.am")).toBe(ROLES.SELLER);
  });

  test("an unknown email resolves to null (caller decides the fallback)", () => {
    expect(readRoleForEmail("nobody@test.com")).toBeNull();
  });

  test("registering remembers the role for later logins", () => {
    rememberRoleForEmail("alice@test.com", ROLES.SELLER);
    expect(readRoleForEmail("alice@test.com")).toBe(ROLES.SELLER);
  });

  test("lookup is case-insensitive on the email", () => {
    rememberRoleForEmail("Bob@Test.com", ROLES.BUYER);
    expect(readRoleForEmail("bob@test.com")).toBe(ROLES.BUYER);
    expect(readRoleForEmail("  BOB@TEST.COM  ")).toBe(ROLES.BUYER);
  });

  /**
   * A role belongs to the account, so re-registering an address it already exists under
   * must not flip it — otherwise anyone could re-point an existing account, including the
   * two seeded demo ones, just by filling in the registration form again.
   */
  test("re-registering an existing email keeps the role it registered with", () => {
    rememberRoleForEmail("carol@test.com", ROLES.BUYER);
    rememberRoleForEmail("carol@test.com", ROLES.SELLER);
    expect(readRoleForEmail("carol@test.com")).toBe(ROLES.BUYER);
  });

  test("the seeded demo accounts cannot be re-pointed by registering over them", () => {
    rememberRoleForEmail("seller.demo@choosy.am", ROLES.BUYER);
    expect(readRoleForEmail("seller.demo@choosy.am")).toBe(ROLES.SELLER);
  });

  test("an invalid role is not stored", () => {
    rememberRoleForEmail("dave@test.com", "admin");
    expect(readRoleForEmail("dave@test.com")).toBeNull();
  });

  /**
   * The registry lives in localStorage, so a hand-edited or half-written entry is reachable.
   * It used to flow straight through the caller's `?? ROLES.BUYER` guard into the login
   * form, and the login action then dropped the request with no cookie and no error.
   */
  test("a stored value that isn't a known role reads as null", () => {
    window.localStorage.setItem(
      "choozy_role_registry",
      JSON.stringify({ "erin@test.com": "admin", "frank@test.com": {}, "gina@test.com": null }),
    );
    expect(readRoleForEmail("erin@test.com")).toBeNull();
    expect(readRoleForEmail("frank@test.com")).toBeNull();
    expect(readRoleForEmail("gina@test.com")).toBeNull();
  });

  test("a corrupted registry falls back to the seeds instead of throwing", () => {
    window.localStorage.setItem("choozy_role_registry", "{not json");
    expect(readRoleForEmail("buyer.demo@choosy.am")).toBe(ROLES.BUYER);
    expect(readRoleForEmail("nobody@test.com")).toBeNull();
  });

  test("empty/blank email is a no-op", () => {
    expect(() => rememberRoleForEmail("", ROLES.BUYER)).not.toThrow();
    expect(readRoleForEmail("")).toBeNull();
    expect(readRoleForEmail(null)).toBeNull();
  });
});
