import { useState } from "react";
import { vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { LanguageProvider } from "contexts";
import { translations } from "shared/i18n";
import { DEFAULT_LANGUAGE_CODE } from "shared/i18n/languageConfig";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";
import { useLogoutConfirm } from "../presenter/useLogoutConfirm";

const dict = translations[DEFAULT_LANGUAGE_CODE];

/**
 * The point of this dialog is that the session survives everything except the one deliberate
 * answer, so most of these assert "the logout action did not run".
 *
 * `createRoutesStub` gives the real `useSubmit` a data router; the `/session/logout` route is
 * where a real POST would land, and the spy on its action is the only trustworthy evidence that
 * a logout did or did not happen.
 *
 * `fireEvent` rather than user-event: this project is on user-event 13, which has no `setup()`,
 * and every other suite here drives interactions with `fireEvent`.
 */
const renderHarness = () => {
  const logoutAction = vi.fn(() => null);

  /** Stands in for a page's own trigger — the header icon, or a dashboard sidebar button. */
  const Harness = () => {
    const { isConfirming, requestLogout, cancelLogout } = useLogoutConfirm();
    return (
      <LanguageProvider>
        <button type="button" onClick={requestLogout}>
          trigger
        </button>
        <LogoutConfirmDialog isOpen={isConfirming} onCancel={cancelLogout} />
      </LanguageProvider>
    );
  };

  const Stub = createRoutesStub([
    { path: "/", Component: Harness },
    { path: "/session/logout", action: logoutAction, Component: () => null },
  ]);

  return { logoutAction, ...render(<Stub initialEntries={["/"]} />) };
};

/**
 * `fireEvent.click` does not move focus the way a real click does, so the trigger is focused
 * explicitly — otherwise the dialog captures `<body>` as its opener and the focus-restore case
 * would be testing nothing.
 */
const openDialog = () => {
  const trigger = screen.getByRole("button", { name: "trigger" });
  trigger.focus();
  fireEvent.click(trigger);
  return { trigger, dialog: screen.getByRole("alertdialog") };
};

const buttonNamed = (name) => screen.getByRole("button", { name });

describe("LogoutConfirmDialog", () => {
  test("is absent until asked for, and pressing logout only asks the question", () => {
    const { logoutAction } = renderHarness();
    expect(screen.queryByRole("alertdialog")).toBeNull();

    const { dialog } = openDialog();

    expect(dialog).toHaveAccessibleName(dict.auth.logoutConfirmTitle);
    /** The defect this exists for: the click used to end the session by itself. */
    expect(logoutAction).not.toHaveBeenCalled();
  });

  test("cancelling closes it and leaves the session alone", () => {
    const { logoutAction } = renderHarness();
    openDialog();

    fireEvent.click(buttonNamed(dict.auth.logoutConfirmCancel));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(logoutAction).not.toHaveBeenCalled();
  });

  test("Escape cancels", () => {
    const { logoutAction } = renderHarness();
    openDialog();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(logoutAction).not.toHaveBeenCalled();
  });

  test("the backdrop cancels, without being a tab stop or an announced control", () => {
    const { logoutAction } = renderHarness();
    const { dialog } = openDialog();

    const backdrop = dialog.querySelector("[data-logout-backdrop]");
    /** A mouse affordance only: Escape and Cancel are the keyboard and screen-reader routes. */
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("tabindex", "-1");

    fireEvent.click(backdrop);

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(logoutAction).not.toHaveBeenCalled();
  });

  test("confirming is what actually logs out", async () => {
    const { logoutAction } = renderHarness();
    openDialog();

    fireEvent.click(buttonNamed(dict.auth.logoutConfirmSubmit));

    await waitFor(() => expect(logoutAction).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  /**
   * Focus starts on the safe answer, so a visitor who hits Enter on arrival — or who opened this
   * by mistake in the first place — dismisses rather than destroys.
   */
  test("opens with focus on cancel, not on the destructive button", () => {
    renderHarness();
    openDialog();

    expect(buttonNamed(dict.auth.logoutConfirmCancel)).toHaveFocus();
  });

  /**
   * The trap only acts at the two boundaries, so those are what is exercised: Tab off the last
   * control wraps to the first, Shift+Tab off the first wraps to the last. Between them jsdom's
   * own focus order applies, which is the browser's job, not this component's.
   */
  test("Tab wraps inside the dialog instead of escaping to the page", () => {
    renderHarness();
    const { dialog } = openDialog();

    /** The backdrop is excluded on purpose, so the cycle is exactly Cancel ⇄ Log out. */
    const focusables = [...dialog.querySelectorAll('button:not([tabindex="-1"])')];
    expect(focusables).toHaveLength(2);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  test("returns focus to whatever opened it", () => {
    renderHarness();
    const { trigger } = openDialog();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveFocus();
  });

  /**
   * A `role="dialog"` is announced as a container the reader may explore; an `alertdialog` is
   * announced together with its message, which is what a question about a consequence needs.
   */
  test("announces itself as an alert dialog, described by the consequence", () => {
    renderHarness();
    const { dialog } = openDialog();

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription(dict.auth.logoutConfirmBody);
  });
});

/**
 * The header holds one dialog for two triggers. Two `useLogoutConfirm()` calls would mean two
 * `isConfirming` flags and, once the mobile panel closes behind the icon row, two mounted
 * dialogs fighting over the same focus trap and body-scroll lock.
 */
describe("useLogoutConfirm", () => {
  test("one flag drives every trigger on the page", () => {
    const TwoTriggers = () => {
      const { isConfirming, requestLogout, cancelLogout } = useLogoutConfirm();
      const [panelClosed, setPanelClosed] = useState(false);
      return (
        <LanguageProvider>
          <button type="button" onClick={requestLogout}>
            icon
          </button>
          <button
            type="button"
            onClick={() => {
              setPanelClosed(true);
              requestLogout();
            }}
          >
            panel
          </button>
          {panelClosed ? <span>panel closed</span> : null}
          <LogoutConfirmDialog isOpen={isConfirming} onCancel={cancelLogout} />
        </LanguageProvider>
      );
    };

    const Stub = createRoutesStub([
      { path: "/", Component: TwoTriggers },
      { path: "/session/logout", action: () => null, Component: () => null },
    ]);
    render(<Stub initialEntries={["/"]} />);

    fireEvent.click(screen.getByRole("button", { name: "panel" }));

    /** The panel closes first, so the question is never asked from underneath it. */
    expect(screen.getByText("panel closed")).toBeInTheDocument();
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
  });
});
