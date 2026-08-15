import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * The contract a destructive confirmation owes its user, asserted on the shared component so
 * every caller inherits it: the question is announced, the safe answer is where focus starts,
 * and nothing destructive happens until it is chosen deliberately.
 */
const renderDialog = (props = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const utils = render(
    <ConfirmDialog
      isOpen
      title="Delete this product?"
      body="This cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel, ...utils };
};

describe("ConfirmDialog", () => {
  test("renders nothing until it is asked for", () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="t"
        body="b"
        confirmLabel="c"
        cancelLabel="x"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  test("announces itself as an alert dialog, named and described", () => {
    renderDialog();
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Delete this product?");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  /** Enter on arrival must dismiss, not destroy. */
  test("opens with focus on cancel", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  test("Escape and the backdrop both cancel without confirming", () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("confirm-dialog-backdrop"));
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("the backdrop is a mouse affordance only", () => {
    renderDialog();
    const backdrop = screen.getByTestId("confirm-dialog-backdrop");
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveAttribute("tabindex", "-1");
  });

  /** Closing before acting: the action can replace the tree the trigger lived in. */
  test("confirming closes first, then runs the action", () => {
    const calls = [];
    renderDialog({
      onCancel: () => calls.push("close"),
      onConfirm: () => calls.push("act"),
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(calls).toEqual(["close", "act"]);
  });

  test("Tab wraps inside the dialog instead of escaping to the page", () => {
    renderDialog();
    const dialog = screen.getByRole("alertdialog");
    const focusables = [...dialog.querySelectorAll('button:not([tabindex="-1"])')];
    expect(focusables).toHaveLength(2);

    focusables[1].focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(focusables[0]).toHaveFocus();

    focusables[0].focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(focusables[1]).toHaveFocus();
  });
});
