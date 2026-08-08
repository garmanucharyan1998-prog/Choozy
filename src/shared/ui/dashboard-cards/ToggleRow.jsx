const ToggleRow = ({ title, description, enabled, onToggle }) => (
  <button
    type="button"
    className="flex min-h-[52px] w-full touch-manipulation items-center justify-between gap-3 rounded-[12px] border border-[#e1e6ef] bg-[#fbfcff] p-3.5 text-start transition hover:bg-[#f4f6fb] sm:min-h-0 sm:gap-4 sm:p-4"
    onClick={onToggle}
    aria-pressed={enabled}
  >
    <span className="flex flex-col gap-1">
      <span className="block text-sm font-bold text-navy">{title}</span>
      {description ? (
        <span className="block text-xs leading-relaxed text-text-muted">{description}</span>
      ) : null}
    </span>
    <span
      className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
        enabled ? "justify-end bg-navy" : "justify-start bg-[#dfe4f1]"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </span>
  </button>
);

export default ToggleRow;
