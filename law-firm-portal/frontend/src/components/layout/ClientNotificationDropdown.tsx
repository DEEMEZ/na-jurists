import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "@/lib/api";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  caseId: string | null;
};

export function ClientNotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiJson<{ notifications: NotificationRow[] }>(
        "/api/v1/me/notifications",
      );
      setItems(d.notifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (next) void load();
            return next;
          });
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-secondary-navy transition-colors hover:bg-primary-navy/5 hover:text-accent-blue"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-[100] mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-border-subtle bg-background-white py-2 shadow-xl ring-1 ring-black/5"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="border-b border-border-subtle px-4 py-2">
            <p className="text-sm font-semibold text-primary-navy">
              Notifications
            </p>
          </div>
          <div className="max-h-[min(70vh,24rem)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-light">
                Loading…
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-light">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {items.map((n) => (
                  <li key={n.id} className="px-4 py-3">
                    <div className="text-sm font-medium text-secondary-navy">
                      {n.title}
                    </div>
                    <p className="mt-1 text-sm text-text-dark">{n.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-light">
                      <span>
                        {new Date(n.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      {n.caseId && (
                        <Link
                          to={`/cases/${n.caseId}`}
                          className="font-medium text-accent-blue hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          View matter
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
