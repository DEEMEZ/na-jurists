import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { apiJson } from "@/lib/api";
import {
  getReportedJudgmentsWebsiteApiBases,
  type ReportedJudgmentsWebsiteBase,
} from "@/lib/publicWebsiteOrigin";
import { getSupabase } from "@/lib/supabaseClient";

type JudgmentListItem = {
  id: number;
  citation: string;
  title: string;
  updatedAt: string;
  displayOnWebsite: boolean;
  hasOverride: boolean;
  source: "database" | "website";
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
  pdfUrl: string;
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
    pdfUrl: "",
  };
}

type ReportedJudgmentsApiPayload = {
  data?: JudgmentRecord[];
  pagination?: { totalPages?: number };
};

function formatApiBaseForMessage(base: ReportedJudgmentsWebsiteBase): string {
  if (base === null) return "same origin (current tab)";
  return base;
}

/** Next `/api/reported-judgments` must return JSON; HTML (SPA/404/login) breaks `response.json()`. */
async function fetchWebsiteReportedJudgmentsJson(
  base: ReportedJudgmentsWebsiteBase,
  page: number,
  limit: number,
): Promise<ReportedJudgmentsApiPayload | null> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  const path = `/api/reported-judgments?${params.toString()}`;
  const url =
    base != null && base !== "" ? `${base.replace(/\/$/, "")}${path}` : path;
  const res = await fetch(url);
  if (!res.ok) return null;
  const raw = await res.text();
  const trimmed = raw.trimStart();
  const ct = (res.headers.get("content-type") ?? "").toLowerCase();
  const looksJson = ct.includes("application/json") || trimmed.startsWith("{") || trimmed.startsWith("[");
  if (!looksJson || trimmed.startsWith("<")) {
    throw new Error(
      `The judgments API at ${formatApiBaseForMessage(base)} returned a web page instead of JSON (wrong host, SPA fallback, or /api not routed). Set VITE_PUBLIC_WEBSITE_ORIGIN or VITE_WEBSITE_URL to the live Next.js site origin, or run the site on the same host as the portal.`,
    );
  }
  try {
    return JSON.parse(raw) as ReportedJudgmentsApiPayload;
  } catch {
    throw new Error(
      `The judgments API at ${formatApiBaseForMessage(base)} did not return valid JSON.`,
    );
  }
}

export function AdminReportedJudgmentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState<JudgmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<JudgmentRecord | null>(null);
  const [originalEditId, setOriginalEditId] = useState<number | null>(null);
  const [displayOnWebsite, setDisplayOnWebsite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [websiteRecordsById, setWebsiteRecordsById] = useState<Map<number, JudgmentRecord>>(new Map());

  const nextSuggestedId = useMemo(() => {
    if (rows.length === 0) return 1;
    return Math.max(...rows.map((r) => r.id)) + 1;
  }, [rows]);

  useEffect(() => {
    setEditing((prev) => {
      if (!prev || originalEditId !== null) return prev;
      if (prev.id === nextSuggestedId) return prev;
      return { ...prev, id: nextSuggestedId };
    });
  }, [nextSuggestedId, originalEditId]);

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{
        judgments: Array<
          Omit<JudgmentListItem, "hasOverride" | "source"> & {
            displayOnWebsite: boolean;
          }
        >;
      }>(
        "/api/v1/admin/reported-judgments",
      );

      const dbRows = data.judgments.map((j) => ({
        ...j,
        hasOverride: true,
        source: "database" as const,
      }));
      const dbById = new Map<number, (typeof dbRows)[number]>(dbRows.map((row) => [row.id, row]));

      const bases = getReportedJudgmentsWebsiteApiBases();
      if (bases.length === 0) {
        setRows(dbRows);
        return;
      }

      let allWebsiteRows: JudgmentRecord[] = [];
      let mergeErr: unknown = null;
      let websiteCatalogFetched = false;
      for (const base of bases) {
        try {
          const pageSize = 50;
          let page = 1;
          let totalPages = 1;
          const acc: JudgmentRecord[] = [];
          do {
            const payload = await fetchWebsiteReportedJudgmentsJson(base, page, pageSize);
            if (payload === null) {
              if (page === 1) {
                throw new Error(
                  `HTTP error from ${formatApiBaseForMessage(base)} — is the Next.js site running?`,
                );
              }
              break;
            }
            acc.push(...(payload.data ?? []));
            totalPages = Math.max(1, Number(payload.pagination?.totalPages) || 1);
            page += 1;
          } while (page <= totalPages);
          allWebsiteRows = acc;
          websiteCatalogFetched = true;
          break;
        } catch (e) {
          mergeErr = e;
        }
      }

      if (!websiteCatalogFetched) {
        const msg =
          mergeErr instanceof Error ? mergeErr.message : "Could not load website judgment catalog.";
        setError(`${msg} Showing database judgments only.`);
        setWebsiteRecordsById(new Map());
        setRows(dbRows);
        return;
      }

      const websiteById = new Map<number, JudgmentRecord>();
      for (const rec of allWebsiteRows) {
        websiteById.set(rec.id, rec);
      }
      setWebsiteRecordsById(websiteById);

      const mergedRows: JudgmentListItem[] = [...dbRows];
      for (const rec of allWebsiteRows) {
        if (dbById.has(rec.id)) continue;
        mergedRows.push({
          id: rec.id,
          citation: rec.citation ?? "",
          title: rec.title ?? "",
          updatedAt: "",
          displayOnWebsite: true,
          hasOverride: false,
          source: "website",
        });
      }
      mergedRows.sort((a, b) => a.id - b.id);
      setRows(mergedRows);
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
    setDisplayOnWebsite(false);
    setOriginalEditId(null);
    setPdfFile(null);
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
      setOriginalEditId(id);
      return;
    } catch (e) {
      const websiteFallback = websiteRecordsById.get(id);
      if (!websiteFallback) {
        const m = e instanceof Error ? e.message : "Failed to load judgment";
        setError(m);
        showToast(m, "error");
        return;
      }
      setEditing(websiteFallback);
      setDisplayOnWebsite(true);
      setOriginalEditId(id);
      showToast("Loaded website judgment. Saving will create an editable record.");
    }
  }

  function closeEditor() {
    setEditing(null);
    setDisplayOnWebsite(false);
    setOriginalEditId(null);
    setPdfFile(null);
  }

  async function uploadPdfOnly(current: JudgmentRecord, file: File): Promise<JudgmentRecord> {
    const normalizedFileName = `reported-judgments/${current.id}-${Date.now()}-${file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "")}`;

    const supabase = getSupabase();
    const { error: uploadErr } = await supabase.storage
      .from("reportedjudgements")
      .upload(normalizedFileName, file, { upsert: true, contentType: "application/pdf" });
    if (uploadErr) throw new Error(uploadErr.message);

    const { data } = supabase.storage.from("reportedjudgements").getPublicUrl(normalizedFileName);
    const pdfUrl = data.publicUrl ?? "";
    return { ...current, pdfUrl: pdfUrl || current.pdfUrl };
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    let rec: JudgmentRecord = {
      ...editing,
      id: Number(editing.id),
      judges: editing.judges,
      sections: editing.sections,
      keywords: editing.keywords,
    };
    if (!Number.isFinite(rec.id) || rec.id < 1) {
      showToast("Sr. No. must be a positive integer.", "error");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (pdfFile) {
        rec = await uploadPdfOnly(rec, pdfFile);
      }

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
          ? "Judgment saved and published on the website."
          : "Judgment saved successfully.",
      );
      closeEditor();
      void load();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Save failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(id: number) {
    const rowMeta = rows.find((r) => r.id === id);
    const ok = await confirm({
      title: "Remove judgment record",
      message:
        rowMeta?.hasOverride
          ? "Remove this row from the database? The website will fall back to the static dataset for this serial number if available."
          : "This row currently comes from the website dataset. Remove will hide it from the website list. Continue?",
      variant: "danger",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setError(null);
    try {
      if (rowMeta?.hasOverride) {
        await apiJson(`/api/v1/admin/reported-judgments/${id}`, { method: "DELETE" });
        showToast("Judgment record removed.");
      } else {
        const rec = websiteRecordsById.get(id);
        if (!rec) {
          throw new Error("Could not resolve website judgment row.");
        }
        await apiJson("/api/v1/admin/reported-judgments", {
          method: "POST",
          body: JSON.stringify({
            record: rec,
            displayOnWebsite: false,
          }),
        });
        showToast("Judgment removed from website listing.");
      }
      await load();
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
            <h2 className="font-semibold text-secondary-navy">Website + Database judgments</h2>
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
              No rows yet.
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
                    <th className="w-28 px-4 py-3">Source</th>
                    <th className="w-[220px] px-4 py-3 text-right">Actions</th>
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
                      <td className="px-4 py-3 text-sm">
                        {r.source === "database" ? (
                          <span className="text-secondary-navy">Portal record</span>
                        ) : (
                          <span className="text-text-light">Website baseline</span>
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
                onClick={() => closeEditor()}
                className="h-9 rounded-lg border border-border-subtle px-3 text-sm text-secondary-navy hover:bg-background-light"
              >
                Back to list
              </button>
            </div>
          </div>

          <form onSubmit={(e) => void onSave(e)} className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-secondary-navy">Sr. No.</span>
              <input
                type="number"
                min={1}
                required
                readOnly={originalEditId === null}
                value={editing.id}
                onChange={(e) =>
                  setEditing({ ...editing, id: Number(e.target.value) || editing.id })
                }
                className={`w-full max-w-xs rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm ${
                  originalEditId === null ? "cursor-not-allowed bg-background-light" : ""
                }`}
              />
              {originalEditId === null ? (
                <p className="mt-1 text-xs text-text-light">
                  Assigned automatically (next free number). Edit an existing row to change a serial
                  already in the database.
                </p>
              ) : null}
            </label>
            {originalEditId !== null && originalEditId !== editing.id && (
              <p className="text-xs text-text-light">
                Saving moves this row from Sr. {originalEditId} to Sr. {editing.id}. If Sr.{" "}
                {editing.id} is already taken, save will be blocked so nothing is overwritten.
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
              <span className="font-medium text-secondary-navy">Law</span>
              <input
                value={editing.dictumLaw}
                onChange={(e) => setEditing({ ...editing, dictumLaw: e.target.value })}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Upload PDF</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-secondary-navy file:mr-3 file:rounded-md file:border file:border-secondary-navy/25 file:bg-background-white file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              {editing.pdfUrl ? (
                <a
                  href={editing.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-secondary-navy underline"
                >
                  View current PDF
                </a>
              ) : null}
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
