import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { apiJson } from "@/lib/api";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  caseId: string | null;
};

export function ClientNotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiJson<{ notifications: NotificationRow[] }>(
        "/api/v1/me/notifications",
      );
      setItems(d.notifications);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) return null;
  if (user.role !== "CLIENT") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-semibold text-primary-navy">Notifications</h1>
        <p className="mt-1 text-sm text-text-light">
          Status updates and alerts for your matters.
        </p>
      </div>
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </div>
      )}
      {loading ? (
        <p className="text-text-light">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle bg-background-white p-8 text-center text-text-light">
          No notifications yet.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-background-white shadow-sm">
          {items.map((n) => (
            <li key={n.id} className="px-4 py-4">
              <div className="text-sm font-semibold text-secondary-navy">{n.title}</div>
              <p className="mt-1 text-sm text-text-dark whitespace-pre-wrap">{n.body}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-light">
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
                  >
                    Open matter
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
