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
import { withPortalLoading } from "@/lib/portalLoadingBus";
import { getSupabase } from "@/lib/supabaseClient";
import { reportedJudgmentsList } from "../../../../src/data/reportedJudgmentsList";

const CATALOG_BY_ID = new Map(
  reportedJudgmentsList.map((item) => [
    item.srNo,
    { citation: item.citation, dictumLaw: item.dictumLaw },
  ]),
);

/** Sr 1–69: list Citation/Law match the public site catalog (ignore bad DB overrides). */
function applyCatalogListColumns(row: JudgmentListItem): JudgmentListItem {
  const cat = CATALOG_BY_ID.get(row.id);
  if (!cat || row.id < 1 || row.id > 69) return row;
  return {
    ...row,
    citation: cat.citation.trim() || row.citation,
    dictumLaw: cat.dictumLaw.trim() || row.dictumLaw,
  };
}

function applyCatalogRecordFields(rec: JudgmentRecord): JudgmentRecord {
  const cat = CATALOG_BY_ID.get(rec.id);
  if (!cat || rec.id < 1 || rec.id > 69) return rec;
  return {
    ...rec,
    citation: cat.citation.trim() || rec.citation,
    dictumLaw: cat.dictumLaw.trim() || rec.dictumLaw,
  };
}

type JudgmentListItem = {
  id: number;
  citation: string;
  title: string;
  /** Law column (list view); aligns with public site wording. */
  dictumLaw: string;
  updatedAt: string;
  displayOnWebsite: boolean;
  hasOverride: boolean;
};

const ADMIN_JUDGMENTS_LIST_PAGE_SIZE = 20;

type JudgmentRecord = {
  id: number;
  citation: string;
  title: string;
  court: string;
  date: string;
  caseNumber: string;
  dictumLaw: string;
  /** Stored in DB only — admin internal notes; not shown on the public site or appended to PDFs. */
  judgmentHeading?: string;
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
    judgmentHeading: "",
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

function currentPdfDisplayName(record: JudgmentRecord, pendingFile: File | null): string | null {
  if (pendingFile?.name) return pendingFile.name;
  const url = record.pdfUrl?.trim();
  if (url) {
    if (url.startsWith("/")) {
      const base = url.split("/").filter(Boolean).pop();
      if (base) return base;
    }
    try {
      const base = new URL(url).pathname.split("/").filter(Boolean).pop();
      if (base) return decodeURIComponent(base);
    } catch {
      /* ignore */
    }
  }
  if (record.id >= 1 && record.id <= 69) return `${record.id}.pdf`;
  return null;
}

/** Next `/api/reported-judgments` must return JSON; HTML (SPA/404/login) breaks `response.json()`. */
async function fetchWebsiteReportedJudgmentsJson(
  base: ReportedJudgmentsWebsiteBase,
  page: number,
  limit: number,
): Promise<ReportedJudgmentsApiPayload | null> {
  return withPortalLoading(async () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("includeFullText", "1");
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
  });
}

async function fetchWebsiteCatalogRowsForMerge(
  bases: ReturnType<typeof getReportedJudgmentsWebsiteApiBases>,
): Promise<{ ok: true; rows: JudgmentRecord[] } | { ok: false; error: unknown }> {
  let mergeErr: unknown = null;
  for (const base of bases) {
    try {
      const pageSize = 500;
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
      return { ok: true, rows: acc };
    } catch (e) {
      mergeErr = e;
    }
  }
  return { ok: false, error: mergeErr };
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [websiteRecordsById, setWebsiteRecordsById] = useState<Map<number, JudgmentRecord>>(new Map());
  const [adminListPage, setAdminListPage] = useState(1);

  const nextSuggestedId = useMemo(() => {
    if (rows.length === 0) return 1;
    return Math.max(...rows.map((r) => r.id)) + 1;
  }, [rows]);

  const displayedPdfName = useMemo(
    () => (editing ? currentPdfDisplayName(editing, pdfFile) : null),
    [editing, pdfFile],
  );

  useEffect(() => {
    setEditing((prev) => {
      if (!prev || originalEditId !== null) return prev;
      if (prev.id === nextSuggestedId) return prev;
      return { ...prev, id: nextSuggestedId };
    });
  }, [nextSuggestedId, originalEditId]);

  const adminListTotalPages = Math.max(1, Math.ceil(rows.length / ADMIN_JUDGMENTS_LIST_PAGE_SIZE));
  const adminListPageSafe = Math.min(Math.max(1, adminListPage), adminListTotalPages);
  const adminPagedRows = useMemo(() => {
    const start = (adminListPageSafe - 1) * ADMIN_JUDGMENTS_LIST_PAGE_SIZE;
    return rows.slice(start, start + ADMIN_JUDGMENTS_LIST_PAGE_SIZE);
  }, [rows, adminListPageSafe]);

  useEffect(() => {
    setAdminListPage((p) =>
      Math.min(Math.max(1, p), Math.max(1, Math.ceil(rows.length / ADMIN_JUDGMENTS_LIST_PAGE_SIZE))),
    );
  }, [rows.length]);

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const bases = getReportedJudgmentsWebsiteApiBases();
      const adminPromise = apiJson<{
        judgments: Array<
          Omit<JudgmentListItem, "hasOverride"> & {
            displayOnWebsite: boolean;
          }
        >;
      }>("/api/v1/admin/reported-judgments");

      if (bases.length === 0) {
        const data = await adminPromise;
        const dbRows = data.judgments.map((j) =>
          applyCatalogListColumns({ ...j, hasOverride: true }),
        );
        setRows(dbRows);
        return;
      }

      const [data, website] = await Promise.all([
        adminPromise,
        fetchWebsiteCatalogRowsForMerge(bases),
      ]);

      const dbRows = data.judgments.map((j) =>
        applyCatalogListColumns({ ...j, hasOverride: true }),
      );
      const dbById = new Map<number, (typeof dbRows)[number]>(dbRows.map((row) => [row.id, row]));

      if (!website.ok) {
        const msg =
          website.error instanceof Error
            ? website.error.message
            : "Could not load website judgment catalog.";
        setError(`${msg} Showing database judgments only.`);
        setWebsiteRecordsById(new Map());
        setRows(dbRows);
        return;
      }

      const allWebsiteRows = website.rows;

      const websiteById = new Map<number, JudgmentRecord>();
      for (const rec of allWebsiteRows) {
        websiteById.set(rec.id, applyCatalogRecordFields(rec));
      }
      setWebsiteRecordsById(websiteById);

      const mergedRows: JudgmentListItem[] = [...dbRows];
      for (const rec of allWebsiteRows) {
        if (dbById.has(rec.id)) continue;
        mergedRows.push(
          applyCatalogListColumns({
            id: rec.id,
            citation: rec.citation ?? "",
            title: rec.title ?? "",
            dictumLaw: rec.dictumLaw ?? "",
            updatedAt: "",
            displayOnWebsite: true,
            hasOverride: false,
          }),
        );
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
    setOriginalEditId(null);
    setPdfFile(null);
  }

  async function openEdit(id: number) {
    setError(null);
    try {
      const data = await apiJson<{
        judgment: { record: JudgmentRecord; displayOnWebsite?: boolean };
      }>(`/api/v1/admin/reported-judgments/${id}`);
      const rec = applyCatalogRecordFields(data.judgment.record as JudgmentRecord);
      setEditing({ ...rec, judgmentHeading: rec.judgmentHeading ?? "" });
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
      setEditing({
        ...applyCatalogRecordFields(websiteFallback),
        judgmentHeading: websiteFallback.judgmentHeading ?? "",
      });
      setOriginalEditId(id);
      showToast("Loaded website judgment. Saving will create an editable record.");
    }
  }

  function closeEditor() {
    setEditing(null);
    setOriginalEditId(null);
    setPdfFile(null);
  }

  async function uploadPdfOnly(current: JudgmentRecord, file: File): Promise<JudgmentRecord> {
    return withPortalLoading(async () => {
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
    });
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
          ...(originalEditId != null ? { previousId: originalEditId } : {}),
        }),
      });
      showToast("Judgment saved and published on the website.");
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
          {loading ? (
            <>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openNew()}
                  className="h-10 shrink-0 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
                >
                  New judgment
                </button>
              </div>
              <p className="mt-4 text-text-light">Loading…</p>
            </>
          ) : rows.length === 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openNew()}
                  className="h-10 shrink-0 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
                >
                  New judgment
                </button>
              </div>
              <p className="mt-4 text-sm text-text-light">No rows yet.</p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <p className="min-h-10 flex items-center text-xs text-text-light tabular-nums">
                  Showing{" "}
                  {(adminListPageSafe - 1) * ADMIN_JUDGMENTS_LIST_PAGE_SIZE + 1}–
                  {Math.min(adminListPageSafe * ADMIN_JUDGMENTS_LIST_PAGE_SIZE, rows.length)} of {rows.length}
                </p>
                <button
                  type="button"
                  onClick={() => openNew()}
                  className="h-10 shrink-0 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
                >
                  New judgment
                </button>
              </div>
              <div className="mt-2 overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full min-w-[520px] table-fixed text-left text-sm">
                  <thead className="border-b border-border-subtle bg-background-light text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
                    <tr>
                      <th className="w-16 px-4 py-3">Sr.</th>
                      <th className="px-4 py-3">Citation</th>
                      <th className="px-4 py-3">Law</th>
                      <th className="w-[220px] px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminPagedRows.map((r) => (
                      <tr key={r.id} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-3 tabular-nums text-secondary-navy">{r.id}</td>
                        <td className="px-4 py-3 font-medium text-text-dark">{r.citation || "—"}</td>
                        <td className="max-w-md px-4 py-3 align-middle text-text-light">
                          <span className="line-clamp-2">{r.dictumLaw?.trim() || "—"}</span>
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
              {adminListTotalPages > 1 ? (
                <nav
                  className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-border-subtle pt-4"
                  aria-label="Judgments list pagination"
                >
                  <button
                    type="button"
                    onClick={() => setAdminListPage((p) => Math.max(1, p - 1))}
                    disabled={adminListPageSafe <= 1}
                    className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-secondary-navy transition-colors hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm tabular-nums text-text-light">
                    Page {adminListPageSafe} of {adminListTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdminListPage((p) => Math.min(adminListTotalPages, p + 1))}
                    disabled={adminListPageSafe >= adminListTotalPages}
                    className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-secondary-navy transition-colors hover:bg-background-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </>
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
              <p className="mt-0.5 text-xs text-text-light">
                Provide the official headnote or digest for the public Law field. Transcribe directly from the
                reported judgment; automated extraction is not applied here.
              </p>
              <input
                value={editing.dictumLaw}
                onChange={(e) => setEditing({ ...editing, dictumLaw: e.target.value })}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Internal notes (portal only)</span>
              <textarea
                value={editing.judgmentHeading ?? ""}
                onChange={(e) => setEditing({ ...editing, judgmentHeading: e.target.value })}
                rows={8}
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm leading-relaxed"
                placeholder="Private notes for your team (not shown to website visitors)."
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Upload PDF</span>
              {displayedPdfName ? (
                <p className="mt-1 text-sm text-secondary-navy">
                  Current file: <span className="font-medium">{displayedPdfName}</span>
                </p>
              ) : (
                <p className="mt-1 text-xs text-text-light">No PDF on file</p>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-secondary-navy file:mr-3 file:rounded-md file:border file:border-secondary-navy/25 file:bg-background-white file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-primary-navy px-6 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
