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

  test("re-registering the same email with a new role overwrites the old one", () => {
    rememberRoleForEmail("carol@test.com", ROLES.BUYER);
    rememberRoleForEmail("carol@test.com", ROLES.SELLER);
    expect(readRoleForEmail("carol@test.com")).toBe(ROLES.SELLER);
  });

  test("an invalid role is not stored", () => {
    rememberRoleForEmail("dave@test.com", "admin");
    expect(readRoleForEmail("dave@test.com")).toBeNull();
  });

  test("empty/blank email is a no-op", () => {
    expect(() => rememberRoleForEmail("", ROLES.BUYER)).not.toThrow();
    expect(readRoleForEmail("")).toBeNull();
    expect(readRoleForEmail(null)).toBeNull();
  });
});
