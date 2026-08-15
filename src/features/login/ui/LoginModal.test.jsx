import { vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { LanguageProvider } from "contexts";
import { ROLES, rememberPasswordForEmail, rememberRoleForEmail } from "entities/session";
import { hashPassword } from "entities/user";
import { translations } from "shared/i18n";
import { DEFAULT_LANGUAGE_CODE } from "shared/i18n/languageConfig";
import LoginModal from "./LoginModal";

const dict = translations[DEFAULT_LANGUAGE_CODE];

/**
 * Signing in used to be impossible to get wrong: both handlers checked only that the fields
 * were non-empty, and an unknown address fell through `?? ROLES.BUYER` into a successful
 * sign-in as a buyer with an empty account. These cases are the login form actually failing.
 *
 * The spy on the `/session/login` action is the only trustworthy evidence of a sign-in — the
 * modal closes either way, and the cookie is set by the server.
 */
const renderLogin = () => {
  const loginAction = vi.fn(() => null);
  const onClose = vi.fn();

  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <LanguageProvider>
          <LoginModal isOpen onClose={onClose} />
        </LanguageProvider>
      ),
    },
    { path: "/session/login", action: loginAction, Component: () => null },
  ]);

  const utils = render(<Stub initialEntries={["/"]} />);
  /** The modal opens in register mode; every case here is about signing in. */
  fireEvent.click(screen.getByRole("button", { name: dict.register.switchToLoginButton }));
  return { loginAction, onClose, ...utils };
};

const fillIn = (labelText, value) => {
  fireEvent.change(screen.getByLabelText(labelText), { target: { value } });
};

const signIn = (email, password) => {
  fillIn(dict.login.emailLabel, email);
  fillIn(dict.login.passwordLabel, password);
  fireEvent.click(screen.getByRole("button", { name: dict.login.submit }));
};

/**
 * The same hash the form computes, so a fixture is stored exactly as a real registration would
 * store it. `crypto.subtle` is backed by Node's webcrypto here, so this is the real digest and
 * not a stand-in — which is what makes the wrong-password case meaningful.
 */
const hashOf = (plain) => hashPassword(plain);

beforeEach(() => {
  window.localStorage.clear();
});

describe("signing in with wrong credentials", () => {
  test("an email nobody registered is refused, and no session is created", async () => {
    const { loginAction } = renderLogin();

    signIn("nobody@test.com", "whatever");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      dict.login.errors.invalidCredentials,
    );
    expect(loginAction).not.toHaveBeenCalled();
  });

  test("a registered email with the wrong password is refused", async () => {
    rememberRoleForEmail("alice@test.com", ROLES.BUYER);
    rememberPasswordForEmail("alice@test.com", await hashOf("correct-horse"));

    const { loginAction } = renderLogin();
    signIn("alice@test.com", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      dict.login.errors.invalidCredentials,
    );
    expect(loginAction).not.toHaveBeenCalled();
  });

  test("the right password signs in", async () => {
    rememberRoleForEmail("alice@test.com", ROLES.BUYER);
    rememberPasswordForEmail("alice@test.com", await hashOf("correct-horse"));

    const { loginAction } = renderLogin();
    signIn("alice@test.com", "correct-horse");

    await waitFor(() => expect(loginAction).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("an empty field still reports the missing field, not a wrong password", async () => {
    const { loginAction } = renderLogin();

    signIn("alice@test.com", "");

    expect(await screen.findByRole("alert")).toHaveTextContent(dict.login.errors.required);
    expect(loginAction).not.toHaveBeenCalled();
  });

  /**
   * The two seeded demo accounts have no password on file, and neither does anything registered
   * before passwords were stored. An account can only have a *wrong* password once it has one at
   * all — refusing these would lock people out of a password that was never set.
   */
  test("a seeded demo account has no password to get wrong", async () => {
    const { loginAction } = renderLogin();

    signIn("buyer.demo@choosy.am", "anything-at-all");

    await waitFor(() => expect(loginAction).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("the error clears as soon as the visitor edits a field", async () => {
    renderLogin();
    signIn("nobody@test.com", "whatever");
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fillIn(dict.login.emailLabel, "nobody@test.co");

    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("registering", () => {
  test("stores a password that a later login is checked against", async () => {
    const { loginAction } = renderLogin();

    /** Back to register mode, create the account, then try to sign in with a typo. */
    fireEvent.click(screen.getByRole("button", { name: dict.login.switchToRegisterButton }));
    fillIn(dict.register.emailLabel, "dana@test.com");
    fillIn(dict.register.passwordLabel, "hunter2-secret");
    fillIn(dict.register.confirmPasswordLabel, "hunter2-secret");
    fireEvent.click(screen.getByRole("button", { name: dict.register.submit }));

    await waitFor(() => expect(loginAction).toHaveBeenCalledTimes(1));
    /** The account now exists AND carries a hash — the two halves login checks. */
    await waitFor(() => {
      expect(window.localStorage.getItem("choozy_role_registry")).toContain("dana@test.com");
    });
    const stored = JSON.parse(window.localStorage.getItem("choozy_role_registry"));
    expect(stored["dana@test.com"].role).toBe(ROLES.BUYER);
    expect(stored["dana@test.com"].passwordHash).toBe(await hashOf("hunter2-secret"));
  });
});
