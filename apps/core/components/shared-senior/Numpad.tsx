import { Delete } from "lucide-react";

interface NumpadProps {
  onInput: (num: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function Numpad({ onInput, onDelete, disabled }: NumpadProps) {
  const buttonClassName =
    "flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-border bg-surface text-3xl font-bold text-text-primary shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 md:h-24 md:w-24";

  return (
    <div className="mx-auto mb-4 grid w-fit grid-cols-3 place-items-center gap-3 md:mb-10 md:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onInput(num.toString())}
          disabled={disabled}
          className={buttonClassName}
        >
          {num}
        </button>
      ))}
      <div className="h-[72px] w-[72px] md:h-24 md:w-24" />

      <button
        onClick={() => onInput("0")}
        disabled={disabled}
        className={buttonClassName}
      >
        0
      </button>

      <button
        onClick={onDelete}
        disabled={disabled}
        className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-border bg-surface text-text-secondary shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 md:h-24 md:w-24"
      >
        <Delete size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
}
