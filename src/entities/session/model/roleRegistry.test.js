import { ROLES } from "./sessionModel";
import {
  hasAccountForEmail,
  readPasswordHashForEmail,
  readRoleForEmail,
  rememberPasswordForEmail,
  rememberRoleForEmail,
} from "./roleRegistry";

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

/**
 * The half that lets a login be wrong. Before this, an address nobody had registered fell
 * through the caller's `?? ROLES.BUYER` into a successful sign-in as a buyer with an empty
 * account — which, to the visitor, looks exactly like losing everything in their own.
 */
describe("account registry — knowing an account, and its password", () => {
  test("an account exists once something has registered it; nothing else does", () => {
    expect(hasAccountForEmail("buyer.demo@choosy.am")).toBe(true);
    expect(hasAccountForEmail("nobody@test.com")).toBe(false);

    rememberRoleForEmail("new@test.com", ROLES.BUYER);
    expect(hasAccountForEmail("new@test.com")).toBe(true);
  });

  test("a password is stored against an existing account and read back", () => {
    rememberRoleForEmail("alice@test.com", ROLES.BUYER);
    rememberPasswordForEmail("alice@test.com", "hash-1");

    expect(readPasswordHashForEmail("alice@test.com")).toBe("hash-1");
    /** And the role it registered with is untouched by storing a password. */
    expect(readRoleForEmail("alice@test.com")).toBe(ROLES.BUYER);
  });

  test("changing the password overwrites it — unlike the role, that is the point", () => {
    rememberRoleForEmail("bob@test.com", ROLES.SELLER);
    rememberPasswordForEmail("bob@test.com", "old");
    rememberPasswordForEmail("bob@test.com", "new");

    expect(readPasswordHashForEmail("bob@test.com")).toBe("new");
    expect(readRoleForEmail("bob@test.com")).toBe(ROLES.SELLER);
  });

  /**
   * A password without a role is not an account. Allowing this to create an entry would let an
   * unregistered address into the registry without ever choosing a role — and `hasAccountForEmail`
   * would then answer "yes" for someone who never registered.
   */
  test("storing a password for an unknown email creates nothing", () => {
    rememberPasswordForEmail("ghost@test.com", "hash");

    expect(hasAccountForEmail("ghost@test.com")).toBe(false);
    expect(readPasswordHashForEmail("ghost@test.com")).toBe("");
    expect(readRoleForEmail("ghost@test.com")).toBeNull();
  });

  test("an account with no password on file reads as empty, not as a wrong one", () => {
    /** The two seeded demos, and anything registered before passwords were stored. */
    expect(hasAccountForEmail("seller.demo@choosy.am")).toBe(true);
    expect(readPasswordHashForEmail("seller.demo@choosy.am")).toBe("");

    rememberRoleForEmail("carol@test.com", ROLES.BUYER);
    expect(readPasswordHashForEmail("carol@test.com")).toBe("");
  });

  /**
   * Entries used to be plain role strings. A registry written by an older build has to keep
   * working — its accounts simply have no password on file, which the login form treats as
   * "cannot be checked" rather than as "wrong".
   */
  test("a registry in the old plain-string shape still resolves", () => {
    window.localStorage.setItem(
      "choozy_role_registry",
      JSON.stringify({ "legacy@test.com": ROLES.SELLER }),
    );

    expect(hasAccountForEmail("legacy@test.com")).toBe(true);
    expect(readRoleForEmail("legacy@test.com")).toBe(ROLES.SELLER);
    expect(readPasswordHashForEmail("legacy@test.com")).toBe("");
  });

  test("a password can be added to a legacy plain-string entry", () => {
    window.localStorage.setItem(
      "choozy_role_registry",
      JSON.stringify({ "legacy@test.com": ROLES.BUYER }),
    );
    rememberPasswordForEmail("legacy@test.com", "hash-2");

    expect(readPasswordHashForEmail("legacy@test.com")).toBe("hash-2");
    expect(readRoleForEmail("legacy@test.com")).toBe(ROLES.BUYER);
  });

  test("password lookup is case-insensitive on the email, like the role", () => {
    rememberRoleForEmail("Dana@Test.com", ROLES.BUYER);
    rememberPasswordForEmail("  DANA@TEST.COM  ", "hash-3");

    expect(readPasswordHashForEmail("dana@test.com")).toBe("hash-3");
  });

  test("a non-string or empty hash is not stored", () => {
    rememberRoleForEmail("erin@test.com", ROLES.BUYER);
    rememberPasswordForEmail("erin@test.com", "");
    rememberPasswordForEmail("erin@test.com", 12345);

    expect(readPasswordHashForEmail("erin@test.com")).toBe("");
    expect(hasAccountForEmail("erin@test.com")).toBe(true);
  });
});
