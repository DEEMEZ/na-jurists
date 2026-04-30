import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, HelpCircle, X } from "lucide-react";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
};

type Resolver = (value: boolean) => void;

type ConfirmContextValue = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue["confirm"] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return async () => false;
  }
  return ctx.confirm;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<Resolver | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOpts(options);
      setResolver(() => resolve);
      setOpen(true);
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setOpen(false);
      resolver?.(result);
      setResolver(null);
      setOpts(null);
    },
    [resolver],
  );

  const value = useMemo(() => ({ confirm }), [confirm]);

  const variant = opts?.variant ?? "default";

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && opts && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="portal-confirm-title"
          aria-describedby="portal-confirm-desc"
        >
          <button
            type="button"
            className="absolute inset-0 bg-primary-navy/40 backdrop-blur-[2px]"
            aria-label="Dismiss"
            onClick={() => close(false)}
          />
          <div className="portal-toast relative z-10 w-full max-w-md rounded-2xl border border-secondary-navy/15 bg-background-white p-6 shadow-[0_24px_60px_-12px_rgba(26,43,61,0.45)]">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-1.5 text-text-light hover:bg-primary-navy/5 hover:text-secondary-navy"
              aria-label="Cancel"
              onClick={() => close(false)}
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <div className="flex gap-3 pr-8">
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  variant === "danger"
                    ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                    : "bg-primary-navy/8 text-secondary-navy ring-1 ring-secondary-navy/15"
                }`}
                aria-hidden
              >
                {variant === "danger" ? (
                  <AlertTriangle className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <HelpCircle className="h-5 w-5" strokeWidth={2} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  id="portal-confirm-title"
                  className="text-lg font-semibold text-primary-navy"
                >
                  {opts.title ?? "Please confirm"}
                </h2>
                <p
                  id="portal-confirm-desc"
                  className="mt-2 text-sm leading-relaxed text-text-light"
                >
                  {opts.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium text-secondary-navy hover:bg-background-light"
                onClick={() => close(false)}
              >
                {opts.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                  variant === "danger"
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-primary-navy hover:bg-secondary-navy"
                }`}
                onClick={() => close(true)}
              >
                {opts.confirmLabel ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
