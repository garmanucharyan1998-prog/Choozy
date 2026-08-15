import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

/**
 * The one dropdown the seller dashboard uses — for the add-product form's category and product
 * pickers, and for the product list's category and sort menus.
 *
 * A custom listbox rather than a native `<select>` because the form's fields need the same
 * height, border and focus ring as the text inputs beside them, which a native control cannot
 * be given consistently across browsers. Everything a native `<select>` gives you for free is
 * therefore re-implemented here on purpose, and nowhere else:
 *
 *  - `role="listbox"` with `role="option"` children carrying `aria-selected` (the version this
 *    replaces used `aria-pressed`, which is for toggle buttons — a screen reader announced the
 *    chosen category as "not pressed" rather than "selected").
 *  - Full keyboard operation: Arrow keys, Home/End, Enter/Space to choose, Escape to abandon,
 *    Tab to leave. The old one could be opened from the keyboard and then only escaped by
 *    tabbing through every option.
 *  - Focus goes back to the trigger when the list closes, so the tab order does not jump.
 *
 * `aria-activedescendant` keeps real focus on the listbox while the highlight moves, which is
 * the pattern that works when the options are not themselves focusable.
 */

const SIZES = {
  /** Matches the form inputs beside it (`h-11`). */
  md: "h-11 px-3 text-sm",
  /** Toolbar density — a filter control should not be as tall as a form field. */
  sm: "h-10 px-3 text-sm",
};

export const Select = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  size = "md",
  className = "",
  triggerClassName = "",
  ariaLabel,
  /** Rendered before the label inside the trigger — a filter icon, or a "Sort:" prefix. */
  prefix = null,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const displayLabel = selectedOption?.label ?? placeholder ?? "";

  const close = useCallback(({ restoreFocus = true } = {}) => {
    setOpen(false);
    setActiveIndex(-1);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDownOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) close({ restoreFocus: false });
    };
    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => document.removeEventListener("pointerdown", handlePointerDownOutside);
  }, [open, close]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  /** Focus moves to the list so arrow keys reach it; the highlight rides on aria-activedescendant. */
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const openList = (startIndex) => {
    if (disabled) return;
    setActiveIndex(startIndex);
    setOpen(true);
  };

  const commit = (index) => {
    const option = options[index];
    close();
    if (option) onChange(option.value);
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter") {
      event.preventDefault();
      openList(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const handleListKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => Math.min(options.length - 1, prev + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => Math.max(0, prev - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close({ restoreFocus: false });
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative w-full min-w-0 max-w-full ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel ?? (!selectedOption && placeholder ? placeholder : undefined)}
        onClick={() => (open ? close() : openList(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={handleTriggerKeyDown}
        className={`box-border flex w-full max-w-full items-center justify-between gap-2 rounded-[10px] border border-[#b8c8e8] bg-white text-start transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-active-blue ${
          SIZES[size] ?? SIZES.md
        } ${!selectedOption ? "text-text-muted" : "text-text-dark"} ${
          disabled ? "cursor-not-allowed opacity-60" : "hover:border-link-blue"
        } ${triggerClassName}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {prefix}
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start">
            {displayLabel}
          </span>
        </span>
        <FaChevronDown
          className={`h-3 w-3 shrink-0 text-[#64748b] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel ?? placeholder}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          onKeyDown={handleListKeyDown}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 m-0 max-h-[min(14rem,50vh)] w-full max-w-full list-none overflow-y-auto overscroll-contain rounded-[10px] border border-[#b8c8e8] bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)] focus:outline-none"
        >
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const isActive = index === activeIndex;
            return (
              /**
               * A `<li role="option">` with a pointer handler, not a `<button>`: keyboard
               * operation belongs to the listbox above (arrows, Enter, Escape), and options
               * inside a composite widget are deliberately not individual tab stops.
               */
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                data-option-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                /**
                 * `onPointerDown` rather than `onClick`: the list has DOM focus, and a click
                 * begins with the pointerdown that would blur it — committing on the down
                 * stroke is what makes a mouse selection land every time.
                 */
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  event.preventDefault();
                  commit(index);
                }}
                className={`cursor-pointer px-3 py-2.5 text-sm transition ${
                  isSelected ? "font-medium text-navy" : "text-text-dark"
                } ${isActive ? "bg-[#eef3ff]" : "bg-transparent"}`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      ) : null}

      {/**
       * Lets a native form submission block on an unchosen required field, since the trigger is
       * a `<button>` and carries no value of its own.
       */}
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          value={value}
          required
          onChange={() => {}}
        />
      ) : null}
    </div>
  );
};

export default Select;
