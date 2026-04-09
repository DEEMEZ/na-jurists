import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

type ToastItem = { id: string; message: string; variant: ToastVariant };

type ToastContextValue = {
  /** Short notification (matches portal styling). */
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {
        /* no-op outside provider */
      },
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[400] flex w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`portal-toast pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_12px_40px_-10px_rgba(26,43,61,0.35)] backdrop-blur-sm ${
              t.variant === "error"
                ? "border-red-200/90 bg-red-50/95 text-red-900"
                : t.variant === "info"
                  ? "border-accent-blue/25 bg-background-white/95 text-text-dark"
                  : "border-secondary-navy/15 bg-background-white/95 text-text-dark"
            }`}
          >
            <span className="mt-0.5 shrink-0" aria-hidden>
              {t.variant === "error" ? (
                <XCircle className="h-5 w-5 text-red-600" strokeWidth={2} />
              ) : t.variant === "info" ? (
                <Info className="h-5 w-5 text-accent-blue" strokeWidth={2} />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-gold-accent" strokeWidth={2} />
              )}
            </span>
            <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-1 text-text-light transition-colors hover:bg-black/5 hover:text-text-dark"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
