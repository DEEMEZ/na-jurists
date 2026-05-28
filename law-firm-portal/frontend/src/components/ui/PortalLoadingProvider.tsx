import { useSyncExternalStore, type ReactNode } from "react";
import {
  getPortalActiveRequestCount,
  subscribePortalLoading,
} from "@/lib/portalLoadingBus";

/**
 * Full-screen dim + spinner (same pattern as website `LoadingSpinner` overlay).
 * z-index below confirm dialogs (500) and toasts (400) so those stay usable.
 */
export function PortalLoadingProvider({ children }: { children: ReactNode }) {
  const active = useSyncExternalStore(
    subscribePortalLoading,
    getPortalActiveRequestCount,
    () => 0,
  );

  return (
    <>
      {children}
      {active > 0 ? (
        <div
          className="fixed inset-0 z-[350] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading"
        >
          <div
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"
            aria-hidden
          />
          <span className="sr-only">Loading…</span>
        </div>
      ) : null}
    </>
  );
}
