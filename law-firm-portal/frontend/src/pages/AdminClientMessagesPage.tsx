import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { apiJson } from "@/lib/api";

type MessageRow = {
  id: string;
  caseId: string;
  body: string;
  createdAt: string;
  senderEmail: string;
  caseTitle: string;
  caseReference: string | null;
};

export function AdminClientMessagesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const d = await apiJson<{ messages: MessageRow[] }>(
        "/api/v1/admin/messages/client-recent",
      );
      setItems(d.messages);
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
          Client messages
        </h1>
        <p className="mt-1 text-sm text-text-light">
          Messages sent by clients on matters in the last 7 days — same scope as the
          dashboard &quot;Client messages&quot; count.
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
          No client messages in the last 7 days.
        </p>
      ) : (
        <p className="text-sm text-text-light">
          <span className="font-semibold text-primary-navy">{items.length}</span>{" "}
          {items.length === 1 ? "message" : "messages"}
        </p>
      )}
      {!loading && items.length > 0 ? (
        <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-background-white shadow-sm">
          {items.map((m) => (
            <li key={m.id} className="px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-secondary-navy">
                  {m.caseReference ? (
                    <span>{m.caseReference}</span>
                  ) : (
                    <span className="text-text-light">—</span>
                  )}
                  {m.caseTitle ? (
                    <span className="text-text-light">
                      {" "}
                      · {m.caseTitle}
                    </span>
                  ) : null}
                </p>
                <time
                  className="text-xs text-text-light"
                  dateTime={m.createdAt}
                >
                  {new Date(m.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>
              <p className="mt-1 text-xs text-text-light">
                From: <span className="font-medium text-text-dark">{m.senderEmail}</span>
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-text-dark">{m.body}</p>
              <div className="mt-3">
                <Link
                  to={`/cases/${m.caseId}`}
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
