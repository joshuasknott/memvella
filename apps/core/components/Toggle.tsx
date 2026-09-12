"use client";

export default function Toggle({
  id,
  checked,
  onChange,
  disabled = false,
  "data-testid": dataTestId,
}: {
  id: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  "data-testid"?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      data-testid={dataTestId}
      className="relative inline-flex h-11 w-12 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-family-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 h-7 rounded-full transition-colors ${checked ? "bg-family-primary" : "bg-input-border"}`}
      />
      <span
        aria-hidden="true"
        className={`relative inline-block h-5 w-5 transform rounded-full bg-surface transition-transform ${
          checked ? "translate-x-2.5" : "-translate-x-2.5"
        }`}
      />
    </button>
  );
}
