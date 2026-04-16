"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getToneClasses(tone: ToastTone) {
  switch (tone) {
    case "success":
      return {
        wrapper:
          "border-family-accent/15 bg-surface text-text-primary shadow-[0_16px_36px_rgba(45,50,80,0.10)]",
        icon: "text-family-accent",
      };
    case "error":
      return {
        wrapper:
          "border-red-200 bg-surface text-text-primary shadow-[0_16px_36px_rgba(186,26,26,0.16)]",
        icon: "text-status-alert",
      };
    default:
      return {
        wrapper:
          "border-family-primary/20 bg-surface text-text-primary shadow-[0_16px_36px_rgba(45,50,80,0.12)]",
        icon: "text-family-primary",
      };
  }
}

function ToneIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") {
    return <CheckCircle2 className="h-5 w-5" />;
  }

  if (tone === "error") {
    return <AlertCircle className="h-5 w-5" />;
  }

  return <Info className="h-5 w-5" />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: ({ durationMs = 4000, tone = "info", ...input }) => {
        const id = crypto.randomUUID();
        setToasts((currentToasts) => [...currentToasts, { id, tone, durationMs, ...input }]);

        window.setTimeout(() => {
          setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id),
          );
        }, durationMs);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex flex-col items-center gap-3 px-4">
        {toasts.map((toast) => {
          const tone = toast.tone ?? "info";
          const classes = getToneClasses(tone);

          return (
            <div
              key={toast.id}
              role={tone === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-4 ${classes.wrapper}`}
            >
              <div className={`mt-0.5 shrink-0 ${classes.icon}`}>
                <ToneIcon tone={tone} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() =>
                  setToasts((currentToasts) =>
                    currentToasts.filter((item) => item.id !== toast.id),
                  )
                }
                className="rounded-full p-1 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
