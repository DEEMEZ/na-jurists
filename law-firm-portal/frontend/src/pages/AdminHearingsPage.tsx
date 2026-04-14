import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { apiJson } from "@/lib/api";

type HearingRow = {
  id: string;
  caseId: string;
  scheduledAt: string;
  venue: string | null;
  notes: string | null;
  caseTitle: string;
  caseReference: string | null;
  caseArchived?: boolean;
};

export function AdminHearingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<HearingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiJson<{ hearings: HearingRow[] }>(
        "/api/v1/admin/hearings/upcoming-30d",
      );
      setItems(d.hearings);
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
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary-navy">
          Upcoming hearings
        </h1>
        <p className="mt-1 text-sm text-text-light">
          Hearings scheduled from today through the next 30 days — same scope as the
          &quot;Upcoming hearings&quot; count on the admin dashboard.
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
          No hearings in the next 30 days.
        </p>
      ) : (
        <p className="text-sm text-text-light">
          <span className="font-semibold text-primary-navy">{items.length}</span>{" "}
          {items.length === 1 ? "hearing" : "hearings"}
        </p>
      )}
      {!loading && items.length > 0 ? (
        <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-background-white shadow-sm">
          {items.map((h) => (
            <li key={h.id} className="px-4 py-4">
              <p className="text-sm font-semibold text-secondary-navy">
                {new Date(h.scheduledAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {h.venue ? ` · ${h.venue}` : ""}
              </p>
              <p className="mt-1 text-sm text-text-dark">
                <span className="text-text-light">Matter: </span>
                {h.caseReference ? (
                  <span className="font-medium">{h.caseReference}</span>
                ) : (
                  <span className="text-text-light">—</span>
                )}
                {h.caseTitle ? (
                  <>
                    <span className="text-text-light"> · </span>
                    {h.caseTitle}
                  </>
                ) : null}
                {h.caseArchived ? (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900">
                    Archived
                  </span>
                ) : null}
              </p>
              {h.notes ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-text-light">{h.notes}</p>
              ) : null}
              <div className="mt-3">
                <Link
                  to={`/cases/${h.caseId}`}
                  className="inline-flex h-9 min-w-[10rem] items-center justify-center rounded-md border border-secondary-navy/25 bg-background-white px-3 text-sm font-medium text-secondary-navy shadow-sm transition-colors hover:border-accent-blue/40 hover:bg-background-light hover:text-accent-blue"
                >
                  Open matter
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
