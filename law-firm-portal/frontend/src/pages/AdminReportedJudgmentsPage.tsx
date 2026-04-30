import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { apiJson } from "@/lib/api";
import { resolvePublicWebsiteOrigin } from "@/lib/publicWebsiteOrigin";

type JudgmentListItem = {
  id: number;
  citation: string;
  title: string;
  updatedAt: string;
  displayOnWebsite: boolean;
};

type JudgmentRecord = {
  id: number;
  citation: string;
  title: string;
  court: string;
  date: string;
  caseNumber: string;
  dictumLaw: string;
  subject: string;
  parties: { petitioner: string; respondent: string };
  judges: string[];
  sections: string[];
  fullText: string;
  keywords: string[];
};

function emptyRecord(nextId: number): JudgmentRecord {
  return {
    id: nextId,
    citation: "",
    title: "",
    court: "",
    date: "",
    caseNumber: "",
    dictumLaw: "",
    subject: "",
    parties: { petitioner: "", respondent: "" },
    judges: [],
    sections: [],
    fullText: "",
    keywords: [],
  };
}

function splitLines(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function splitKeywords(s: string): string[] {
  return s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function AdminReportedJudgmentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState<JudgmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<JudgmentRecord | null>(null);
  const [judgesText, setJudgesText] = useState("");
  const [sectionsText, setSectionsText] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [originalEditId, setOriginalEditId] = useState<number | null>(null);
  const [displayOnWebsite, setDisplayOnWebsite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const nextSuggestedId = useMemo(() => {
    if (rows.length === 0) return 1;
    return Math.max(...rows.map((r) => r.id)) + 1;
  }, [rows]);

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ judgments: JudgmentListItem[] }>(
        "/api/v1/admin/reported-judgments",
      );
      setRows(data.judgments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.role]);

  if (!user) return null;
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  function openNew() {
    setEditing(emptyRecord(nextSuggestedId));
    setJudgesText("");
    setSectionsText("");
    setKeywordsText("");
    setDisplayOnWebsite(false);
    setOriginalEditId(null);
  }

  async function openEdit(id: number) {
    setError(null);
    try {
      const data = await apiJson<{
        judgment: { record: JudgmentRecord; displayOnWebsite?: boolean };
      }>(`/api/v1/admin/reported-judgments/${id}`);
      const rec = data.judgment.record;
      setEditing(rec);
      setDisplayOnWebsite(data.judgment.displayOnWebsite !== false);
      setJudgesText(rec.judges.join("\n"));
      setSectionsText(rec.sections.join("\n"));
      setKeywordsText(rec.keywords.join(", "));
      setOriginalEditId(id);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Failed to load judgment";
      setError(m);
      showToast(m, "error");
    }
  }

  function closeEditor() {
    setEditing(null);
    setJudgesText("");
    setSectionsText("");
    setKeywordsText("");
    setDisplayOnWebsite(false);
    setOriginalEditId(null);
  }

  async function importFromWebsite() {
    if (!editing) return;
    const origin = resolvePublicWebsiteOrigin();
    if (!origin) {
      showToast(
        "Set VITE_PUBLIC_WEBSITE_ORIGIN to your live site URL (e.g. https://example.com).",
        "error",
      );
      return;
    }
    const id = editing.id;
    setImporting(true);
    setError(null);
    try {
      const base = origin.replace(/\/$/, "");
      const res = await fetch(`${base}/api/reported-judgments?id=${encodeURIComponent(String(id))}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t?.slice(0, 200) || res.statusText);
      }
      const json = (await res.json()) as { data?: JudgmentRecord };
      const data = json.data;
      if (!data || typeof data.id !== "number") {
        throw new Error("Unexpected response from website API");
      }
      setEditing({
        ...data,
        judges: Array.isArray(data.judges) ? data.judges.map(String) : [],
        sections: Array.isArray(data.sections) ? data.sections.map(String) : [],
        keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
        parties: {
          petitioner: data.parties?.petitioner != null ? String(data.parties.petitioner) : "",
          respondent: data.parties?.respondent != null ? String(data.parties.respondent) : "",
        },
      });
      setJudgesText((data.judges ?? []).join("\n"));
      setSectionsText((data.sections ?? []).join("\n"));
      setKeywordsText((data.keywords ?? []).join(", "));
      showToast("Loaded from website catalog into the form.");
    } catch (e) {
      const m =
        e instanceof Error
          ? e.message
          : "Import failed (check CORS on the main site for your portal origin).";
      setError(m);
      showToast(m, "error");
    } finally {
      setImporting(false);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const rec: JudgmentRecord = {
      ...editing,
      id: Number(editing.id),
      judges: splitLines(judgesText),
      sections: splitLines(sectionsText),
      keywords: splitKeywords(keywordsText),
    };
    if (!Number.isFinite(rec.id) || rec.id < 1) {
      showToast("Sr. No. must be a positive integer.", "error");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiJson("/api/v1/admin/reported-judgments", {
        method: "POST",
        body: JSON.stringify({
          record: rec,
          displayOnWebsite,
          ...(originalEditId != null ? { previousId: originalEditId } : {}),
        }),
      });
      showToast(
        displayOnWebsite
          ? "Judgment saved and eligible for the public site."
          : "Judgment saved but hidden from the public site.",
      );
      closeEditor();
      await load();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Save failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(id: number) {
    const ok = await confirm({
      title: "Remove judgment override",
      message:
        "Remove this row from the database? The website will fall back to the static JSON for this Sr. No. if it exists there.",
      variant: "danger",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setError(null);
    try {
      await apiJson(`/api/v1/admin/reported-judgments/${id}`, { method: "DELETE" });
      await load();
      showToast("Override removed.");
      if (editing?.id === id) closeEditor();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Delete failed";
      setError(m);
      showToast(m, "error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-semibold text-primary-navy">Reported judgments</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {!editing && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-secondary-navy">Database overrides</h2>
            <button
              type="button"
              onClick={() => openNew()}
              className="h-10 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
            >
              New judgment
            </button>
          </div>
          {loading ? (
            <p className="mt-4 text-text-light">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="mt-4 text-sm text-text-light">
              No rows yet. Static JSON still drives the whole catalog until you save an override or a
              new Sr. No.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full min-w-[640px] table-fixed text-left text-sm">
                <thead className="border-b border-border-subtle bg-background-light text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
                  <tr>
                    <th className="w-16 px-4 py-3">Sr.</th>
                    <th className="px-4 py-3">Citation</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="w-28 px-4 py-3">Website</th>
                    <th className="w-[200px] px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-4 py-3 tabular-nums text-secondary-navy">{r.id}</td>
                      <td className="px-4 py-3 font-medium text-text-dark">{r.citation || "—"}</td>
                      <td className="px-4 py-3 text-text-light">{r.title || "—"}</td>
                      <td className="px-4 py-3 text-sm text-secondary-navy">
                        {r.displayOnWebsite ? (
                          <span className="text-green-800">Yes</span>
                        ) : (
                          <span className="text-text-light">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void openEdit(r.id)}
                            className="inline-flex h-9 items-center justify-center rounded-md border border-secondary-navy/25 px-3 text-sm font-medium text-secondary-navy hover:bg-background-light"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeRow(r.id)}
                            className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {editing && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-secondary-navy">
              {originalEditId !== null ? `Edit judgment (Sr. ${editing.id})` : "New judgment"}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={importing}
                onClick={() => void importFromWebsite()}
                className="h-9 rounded-lg border border-secondary-navy/25 px-3 text-sm font-medium text-secondary-navy hover:bg-background-light disabled:opacity-60"
              >
                {importing ? "Importing…" : "Load from website API"}
              </button>
              <button
                type="button"
                onClick={() => closeEditor()}
                className="h-9 rounded-lg border border-border-subtle px-3 text-sm text-secondary-navy hover:bg-background-light"
              >
                Back to list
              </button>
            </div>
          </div>

          <form onSubmit={(e) => void onSave(e)} className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-secondary-navy">Sr. No.</span>
                <input
                  type="number"
                  min={1}
                  required
                  value={editing.id}
                  onChange={(e) =>
                    setEditing({ ...editing, id: Number(e.target.value) || editing.id })
                  }
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-secondary-navy">Date</span>
                <input
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
                />
              </label>
            </div>
            {originalEditId !== null && originalEditId !== editing.id && (
              <p className="text-xs text-text-light">
                Saving moves this database row from Sr. {originalEditId} to Sr. {editing.id}. If Sr.{" "}
                {editing.id} already exists, it will be replaced by this save.
              </p>
            )}
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Citation</span>
              <input
                value={editing.citation}
                onChange={(e) => setEditing({ ...editing, citation: e.target.value })}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Title</span>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-secondary-navy">Court</span>
                <input
                  value={editing.court}
                  onChange={(e) => setEditing({ ...editing, court: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-secondary-navy">Case number</span>
                <input
                  value={editing.caseNumber}
                  onChange={(e) => setEditing({ ...editing, caseNumber: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Dictum / law</span>
              <input
                value={editing.dictumLaw}
                onChange={(e) => setEditing({ ...editing, dictumLaw: e.target.value })}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Subject</span>
              <input
                value={editing.subject}
                onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-secondary-navy">Petitioner</span>
                <input
                  value={editing.parties.petitioner}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      parties: { ...editing.parties, petitioner: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-secondary-navy">Respondent</span>
                <input
                  value={editing.parties.respondent}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      parties: { ...editing.parties, respondent: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Judges (one per line)</span>
              <textarea
                value={judgesText}
                onChange={(e) => setJudgesText(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Sections (one per line)</span>
              <textarea
                value={sectionsText}
                onChange={(e) => setSectionsText(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Keywords (comma or newline)</span>
              <textarea
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Full text</span>
              <textarea
                value={editing.fullText}
                onChange={(e) => setEditing({ ...editing, fullText: e.target.value })}
                rows={12}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={displayOnWebsite}
                onChange={(e) => setDisplayOnWebsite(e.target.checked)}
              />
              <span className="text-sm text-text-dark">
                Display on public website (reported judgments pages and API)
              </span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-primary-navy px-6 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save to database"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
