import { Delete } from 'lucide-react';

interface NumpadProps {
  onInput: (num: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function Numpad({ onInput, onDelete, disabled }: NumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6 w-fit mx-auto mb-10 place-items-center">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onInput(num.toString())}
          disabled={disabled}
          className="h-20 w-20 md:h-24 md:w-24 text-3xl font-bold text-slate-900 rounded-2xl bg-white shadow-md hover:shadow-lg active:scale-95 transition-all border border-gray-100 flex items-center justify-center disabled:opacity-50"
        >
          {num}
        </button>
      ))}
      {/* Empty Space */}
      <div className="h-20 w-20 md:h-24 md:w-24"></div>

      {/* Zero */}
      <button
        onClick={() => onInput('0')}
        disabled={disabled}
        className="h-20 w-20 md:h-24 md:w-24 text-3xl font-bold text-slate-900 rounded-2xl bg-white shadow-md hover:shadow-lg active:scale-95 transition-all border border-gray-100 flex items-center justify-center disabled:opacity-50"
      >
        0
      </button>

      {/* Delete / Backspace */}
      <button
        onClick={onDelete}
        disabled={disabled}
        className="h-20 w-20 md:h-24 md:w-24 text-slate-600 rounded-2xl bg-white shadow-md hover:shadow-lg active:scale-95 transition-all border border-gray-100 flex items-center justify-center disabled:opacity-50"
      >
        <Delete size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
}
