import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { apiBlob, apiFetch, apiJson } from "@/lib/api";
import { formatCaseStatus } from "@/lib/formatCaseStatus";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  sender: { email: string; role: string };
};

type DocRow = {
  id: string;
  originalName: string;
  size: number;
  createdAt: string;
  uploadedBy: { email: string };
};

type HearingRow = {
  id: string;
  scheduledAt: string;
  venue: string | null;
  notes: string | null;
};

type CaseDetail = {
  id: string;
  title: string;
  reference: string | null;
  status: string;
  archived: boolean;
  assignments: { user: { id: string; email: string } }[];
  statusHistory: {
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: string;
    author: { email: string };
  }[];
  documents: DocRow[];
  hearings: HearingRow[];
};

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { user } = useAuth();
  const [c, setC] = useState<CaseDetail | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [msgText, setMsgText] = useState("");
  const [statusText, setStatusText] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [clients, setClients] = useState<{ id: string; email: string }[]>([]);
  const [hearingWhen, setHearingWhen] = useState("");
  const [hearingVenue, setHearingVenue] = useState("");
  const [titleEdit, setTitleEdit] = useState("");
  const [refEdit, setRefEdit] = useState("");
  const [archivedEdit, setArchivedEdit] = useState(false);

  const loadCase = useCallback(async () => {
    if (!user?.id || !caseId) return;
    const path =
      user.role === "ADMIN"
        ? `/api/v1/admin/cases/${caseId}`
        : `/api/v1/me/cases/${caseId}`;
    const data = await apiJson<{ case: CaseDetail }>(path);
    setC(data.case);
    setTitleEdit(data.case.title);
    setRefEdit(data.case.reference ?? "");
    setArchivedEdit(data.case.archived);
  }, [caseId, user?.id, user?.role]);

  const loadMessages = useCallback(async () => {
    if (!caseId) return;
    const data = await apiJson<{ messages: Msg[] }>(
      `/api/v1/cases/${caseId}/messages`,
    );
    setMessages(data.messages);
  }, [caseId]);

  useEffect(() => {
    if (!caseId || !user?.id) return;
    setLoading(true);
    setErr(null);
    loadCase()
      .then(() => loadMessages())
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [caseId, user?.id, loadCase, loadMessages]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    apiJson<{ clients: { id: string; email: string }[] }>("/api/v1/admin/clients")
      .then((d) => setClients(d.clients))
      .catch(() => {});
  }, [user?.role]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!caseId || !msgText.trim()) return;
    await apiJson(`/api/v1/cases/${caseId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body: msgText.trim() }),
    });
    setMsgText("");
    await loadMessages();
  }

  async function updateStatus(e: FormEvent) {
    e.preventDefault();
    if (!caseId || !statusText.trim()) return;
    await apiJson(`/api/v1/admin/cases/${caseId}/status`, {
      method: "POST",
      body: JSON.stringify({ status: statusText.trim(), note: statusNote || undefined }),
    });
    setStatusText("");
    setStatusNote("");
    await loadCase();
  }

  async function assignClient(e: FormEvent) {
    e.preventDefault();
    if (!caseId || !assignUserId) return;
    await apiJson<{ assignment: unknown }>(
      `/api/v1/admin/cases/${caseId}/assign`,
      {
        method: "POST",
        body: JSON.stringify({ userId: assignUserId }),
      },
    );
    setAssignUserId("");
    await loadCase();
  }

  async function saveMeta(e: FormEvent) {
    e.preventDefault();
    if (!caseId) return;
    await apiJson(`/api/v1/admin/cases/${caseId}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: titleEdit,
        reference: refEdit || null,
        archived: archivedEdit,
      }),
    });
    await loadCase();
  }

  async function addHearing(e: FormEvent) {
    e.preventDefault();
    if (!caseId || !hearingWhen) return;
    const iso = new Date(hearingWhen).toISOString();
    await apiJson(`/api/v1/admin/cases/${caseId}/hearings`, {
      method: "POST",
      body: JSON.stringify({
        scheduledAt: iso,
        venue: hearingVenue || undefined,
      }),
    });
    setHearingWhen("");
    setHearingVenue("");
    await loadCase();
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !caseId) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiFetch(`/api/v1/admin/cases/${caseId}/documents`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      setErr(await res.text());
      return;
    }
    e.target.value = "";
    await loadCase();
  }

  async function downloadDoc(doc: DocRow) {
    if (!caseId) return;
    const blob = await apiBlob(
      `/api/v1/cases/${caseId}/documents/${doc.id}/file`,
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.originalName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function removeAssign(userId: string) {
    if (!caseId) return;
    const res = await apiFetch(
      `/api/v1/admin/cases/${caseId}/assign/${userId}`,
      { method: "DELETE" },
    );
    if (!res.ok) setErr(await res.text());
    await loadCase();
  }

  async function deleteHearing(id: string) {
    const res = await apiFetch(`/api/v1/admin/hearings/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) setErr(await res.text());
    await loadCase();
  }

  async function deleteDoc(docId: string) {
    if (!caseId) return;
    const res = await apiFetch(
      `/api/v1/admin/cases/${caseId}/documents/${docId}`,
      { method: "DELETE" },
    );
    if (!res.ok) setErr(await res.text());
    await loadCase();
  }

  if (!user || !caseId) return null;

  if (loading && !c) {
    return <p className="text-text-light">Loading…</p>;
  }
  if (err || !c) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        {err ?? "Not found"}{" "}
        <Link to="/cases" className="underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <BackToDashboard />
            <Link
              to="/cases"
              className="text-sm font-medium text-accent-blue hover:underline"
            >
              Back to all cases
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-primary-navy">
            {c.title}
          </h1>
          <p className="mt-1 text-sm text-text-dark">
            Ref: {c.reference ?? "—"} · Status: {formatCaseStatus(c.status)}
            {c.archived ? " · Archived" : ""}
          </p>
        </div>
      </div>

      {user.role === "ADMIN" && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <h2 className="font-semibold text-secondary-navy">Case details</h2>
          <form onSubmit={saveMeta} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-text-dark">Title</label>
              <input
                value={titleEdit}
                onChange={(e) => setTitleEdit(e.target.value)}
                className="mt-1 w-full rounded border border-secondary-navy/20 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-text-dark">Reference</label>
              <input
                value={refEdit}
                onChange={(e) => setRefEdit(e.target.value)}
                className="mt-1 w-full rounded border border-secondary-navy/20 px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={archivedEdit}
                onChange={(e) => setArchivedEdit(e.target.checked)}
              />
              <span className="text-sm">Archived</span>
            </label>
            <button
              type="submit"
              className="rounded-lg bg-primary-navy px-4 py-2 text-sm text-white hover:bg-secondary-navy sm:col-span-2"
            >
              Save
            </button>
          </form>
        </section>
      )}

      {user.role === "ADMIN" && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <h2 className="font-semibold text-secondary-navy">Update status</h2>
          <form onSubmit={updateStatus} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <input
              placeholder="New status"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              className="rounded border border-secondary-navy/20 px-3 py-2 sm:min-w-[180px]"
            />
            <input
              placeholder="Note (optional)"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="flex-1 rounded border border-secondary-navy/20 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-secondary-navy px-4 py-2 text-sm text-white"
            >
              Apply
            </button>
          </form>
          <ul className="mt-4 space-y-2 border-t border-border-subtle pt-4 text-sm text-text-light">
            {c.statusHistory.map((h) => (
              <li key={h.id}>
                <span className="text-text-dark">{h.author.email}</span> ·{" "}
                {h.fromStatus ? formatCaseStatus(h.fromStatus) : "—"} →{" "}
                {formatCaseStatus(h.toStatus)}
                {h.note ? ` — ${h.note}` : ""}{" "}
                <span className="text-xs">
                  ({new Date(h.createdAt).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.role === "ADMIN" && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <h2 className="font-semibold text-secondary-navy">Assigned clients</h2>
          <form onSubmit={assignClient} className="mt-4 flex flex-wrap gap-2">
            <select
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
              className="rounded border border-secondary-navy/20 px-3 py-2"
            >
              <option value="">Select client…</option>
              {clients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.email}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-primary-navy px-4 py-2 text-sm text-white"
            >
              Assign
            </button>
          </form>
          <ul className="mt-3 space-y-1 text-sm">
            {c.assignments.map((a) => (
              <li
                key={a.user.id}
                className="flex items-center justify-between gap-2"
              >
                {a.user.email}
                <button
                  type="button"
                  onClick={() => removeAssign(a.user.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.role === "ADMIN" && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <h2 className="font-semibold text-secondary-navy">Documents</h2>
          <label className="mt-4 inline-block cursor-pointer rounded-lg border border-dashed border-secondary-navy/30 px-4 py-3 text-sm text-text-light hover:bg-background-light">
            Upload file
            <input type="file" className="hidden" onChange={onUpload} />
          </label>
          <ul className="mt-4 space-y-2 text-sm">
            {c.documents.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={() => downloadDoc(d)}
                  className="text-left text-accent-blue hover:underline"
                >
                  {d.originalName}
                </button>
                <span className="text-xs text-text-light">
                  {d.uploadedBy.email}
                </span>
                <button
                  type="button"
                  onClick={() => deleteDoc(d.id)}
                  className="text-xs text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.role === "CLIENT" && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <h2 className="font-semibold text-secondary-navy">Documents</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {c.documents.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => downloadDoc(d)}
                  className="text-accent-blue hover:underline"
                >
                  {d.originalName}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
        <h2 className="font-semibold text-secondary-navy">Hearings</h2>
        {user.role === "ADMIN" && (
          <form onSubmit={addHearing} className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <input
              type="datetime-local"
              value={hearingWhen}
              onChange={(e) => setHearingWhen(e.target.value)}
              className="rounded border border-secondary-navy/20 px-3 py-2"
            />
            <input
              placeholder="Venue"
              value={hearingVenue}
              onChange={(e) => setHearingVenue(e.target.value)}
              className="flex-1 rounded border border-secondary-navy/20 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-secondary-navy px-4 py-2 text-sm text-white"
            >
              Add hearing
            </button>
          </form>
        )}
        <ul className="mt-4 space-y-2 text-sm">
          {c.hearings.map((h) => (
            <li
              key={h.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2 last:border-0"
            >
              <span>
                {new Date(h.scheduledAt).toLocaleString()}
                {h.venue ? ` · ${h.venue}` : ""}
              </span>
              {user.role === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => deleteHearing(h.id)}
                  className="text-xs text-red-600"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
        <h2 className="font-semibold text-secondary-navy">Messages</h2>
        <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto text-sm">
          {messages.map((m) => (
            <li key={m.id} className="rounded-lg bg-background-light/80 px-3 py-2">
              <div className="text-xs text-text-light">
                {m.sender.email} ({m.sender.role}) ·{" "}
                {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className="mt-1 whitespace-pre-wrap text-text-dark">
                {m.body}
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <textarea
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            rows={2}
            className="flex-1 rounded border border-secondary-navy/20 px-3 py-2"
            placeholder="Type a message…"
          />
          <button
            type="submit"
            className="self-end rounded-lg bg-primary-navy px-4 py-2 text-sm text-white"
          >
            Send
          </button>
        </form>
      </section>

      {user.role === "CLIENT" && c.statusHistory.length > 0 && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <h2 className="font-semibold text-secondary-navy">Status history</h2>
          <ul className="mt-4 space-y-2 text-sm text-text-light">
            {c.statusHistory.map((h) => (
              <li key={h.id}>
                {h.fromStatus ? formatCaseStatus(h.fromStatus) : "—"} →{" "}
                {formatCaseStatus(h.toStatus)}
                {h.note ? ` — ${h.note}` : ""} ·{" "}
                {new Date(h.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
