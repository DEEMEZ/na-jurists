import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { apiJson } from "@/lib/api";
import { formatCaseStatus } from "@/lib/formatCaseStatus";

type CaseRow = {
  id: string;
  title: string;
  reference: string | null;
  status: string;
  archived: boolean;
};

const rowLinkClass =
  "font-medium text-text-dark transition-colors hover:text-accent-blue hover:underline";

export function CasesListPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const path =
      user.role === "ADMIN" ? "/api/v1/admin/cases" : "/api/v1/me/cases";
    setLoading(true);
    setError(null);
    apiJson<{ cases: CaseRow[] }>(path)
      .then((data) => setCases(data.cases))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <BackToDashboard />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-navy">
            {user.role === "ADMIN" ? "All matters" : "My matters"}
          </h1>
          <p className="mt-1 text-sm text-text-light">
            {user.role === "ADMIN"
              ? "Create, assign, and update cases."
              : "Matters assigned to your account."}
          </p>
        </div>
        {user.role === "ADMIN" && (
          <Link
            to="/cases/new"
            className="inline-flex items-center justify-center rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-background-white transition-colors hover:bg-secondary-navy"
          >
            New case
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-text-light">Loading…</p>
      ) : cases.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle bg-background-white p-8 text-center text-text-light">
          No cases yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-background-white shadow-sm">
          <table className="w-full min-w-[640px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[32%]" />
              <col className="w-[14%]" />
              {user.role === "ADMIN" && <col className="w-[12%]" />}
              <col className={user.role === "ADMIN" ? "w-[24%]" : "w-[36%]"} />
            </colgroup>
            <thead className="border-b border-border-subtle bg-background-light text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                {user.role === "ADMIN" && (
                  <th className="px-4 py-3">Archived</th>
                )}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border-subtle bg-background-white last:border-0 hover:bg-background-light/60"
                >
                  <td className="px-4 py-3 align-middle text-sm text-text-dark">
                    <span className="font-medium text-text-dark">
                      {c.reference ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-text-dark">
                    <Link to={`/cases/${c.id}`} className={rowLinkClass}>
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-text-dark">
                    {formatCaseStatus(c.status)}
                  </td>
                  {user.role === "ADMIN" && (
                    <td className="px-4 py-3 align-middle text-sm text-text-dark">
                      {c.archived ? "Yes" : "No"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right align-middle">
                    <Link
                      to={`/cases/${c.id}`}
                      className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-md border border-secondary-navy/25 bg-background-white px-3 text-sm font-medium text-secondary-navy shadow-sm transition-colors hover:border-accent-blue/40 hover:bg-background-light hover:text-accent-blue"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && cases.length > 0 && user.role === "ADMIN" && (
        <p className="text-xs text-text-light">
          To change details or retire a matter, open it — use{" "}
          <strong className="font-medium text-text-dark">Archive</strong> on the
          case page. Permanent delete is not available here.
        </p>
      )}
    </div>
  );
}
