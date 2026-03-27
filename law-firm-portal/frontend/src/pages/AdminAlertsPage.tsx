import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { apiJson } from "@/lib/api";
import { formatCaseStatus } from "@/lib/formatCaseStatus";

type Row = {
  id: string;
  title: string;
  reference: string | null;
  status: string;
  clients: string[];
};

export function AdminAlertsPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    apiJson<{ count: number; cases: Row[] }>(
      "/api/v1/admin/alerts/missing-upcoming-hearings",
    )
      .then((d) => {
        setCount(d.count);
        setCases(d.cases);
      })
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (!user) return null;
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-8">
      <BackToDashboard />
      <h1 className="text-2xl font-semibold text-primary-navy">
        Hearing alerts
      </h1>
      <p className="text-sm text-text-light">
        Open matters with no upcoming hearing scheduled (from today onward).
      </p>
      {loading ? (
        <p className="text-text-light">Loading…</p>
      ) : (
        <>
          <p className="text-secondary-navy">
            <span className="font-semibold">{count}</span> matter
            {count === 1 ? "" : "s"} flagged
          </p>
          <ul className="space-y-2">
            {cases.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-border-subtle bg-background-white p-4"
              >
                <Link
                  to={`/cases/${c.id}`}
                  className="font-semibold text-secondary-navy transition-colors hover:text-accent-blue hover:underline"
                >
                  {c.title}
                </Link>
                <div className="mt-1 text-sm text-text-dark">
                  Ref: {c.reference ?? "—"} · Status:{" "}
                  {formatCaseStatus(c.status)}
                </div>
                <div className="mt-1 text-sm text-text-light">
                  Clients: {c.clients.length ? c.clients.join(", ") : "—"}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
