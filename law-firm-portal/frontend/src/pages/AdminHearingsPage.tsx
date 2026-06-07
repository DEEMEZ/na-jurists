import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import {
  getCachedAdminHearings,
  loadAdminHearings,
  type AdminHearingRow,
} from "@/lib/hearingsListCache";

function HearingsListSkeleton() {
  return (
    <ul
      className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-background-white shadow-sm"
      aria-busy
      aria-label="Loading hearings"
    >
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="space-y-2 px-4 py-4" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="portal-skeleton h-4 w-56 max-w-full" />
          <div className="portal-skeleton h-4 w-full max-w-md" />
          <div className="portal-skeleton h-9 w-36" />
        </li>
      ))}
    </ul>
  );
}

export function AdminHearingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AdminHearingRow[]>(() => getCachedAdminHearings() ?? []);
  const [loading, setLoading] = useState(() => getCachedAdminHearings() === null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    let cancelled = false;
    const hadCache = getCachedAdminHearings() !== null;
    if (!hadCache) setLoading(true);
    setErr(null);
    loadAdminHearings({ force: !hadCache })
      .then((hearings) => {
        if (!cancelled) setItems(hearings);
      })
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

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
      {loading && items.length === 0 ? (
        <HearingsListSkeleton />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle bg-background-white p-8 text-center text-text-light">
          No hearings in the next 30 days.
        </p>
      ) : (
        <>
          <p className="text-sm text-text-light">
            <span className="font-semibold text-primary-navy">{items.length}</span>{" "}
            {items.length === 1 ? "hearing" : "hearings"}
          </p>
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
        </>
      )}
    </div>
  );
}
