import { type FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { apiJson } from "@/lib/api";
import { withPortalLoading } from "@/lib/portalLoadingBus";
import { getSupabase } from "@/lib/supabaseClient";

const NEWS_ALERTS_BUCKET = "news-alerts";

type NewsAlertRow = {
  id: string;
  headline: string;
  organization: string;
  pdf_url: string;
  published_at: string;
  created_at: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

async function uploadNewsPdf(file: File): Promise<string> {
  return withPortalLoading(async () => {
    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const storagePath = `${Date.now()}-${safeName}`;
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(NEWS_ALERTS_BUCKET)
      .upload(storagePath, file, { upsert: false, contentType: "application/pdf" });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(NEWS_ALERTS_BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  });
}

export function AdminNewsAlertsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [rows, setRows] = useState<NewsAlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [headline, setHeadline] = useState("");
  const [organization, setOrganization] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ newsAlerts: NewsAlertRow[] }>(
        "/api/v1/admin/news-alerts"
      );
      setRows(data.newsAlerts ?? []);
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
  if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  function openForm() {
    setHeadline("");
    setOrganization("");
    setPdfFile(null);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setHeadline("");
    setOrganization("");
    setPdfFile(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pdfFile) {
      showToast("Please select a PDF file.", "error");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const pdfUrl = await uploadNewsPdf(pdfFile);
      await apiJson("/api/v1/admin/news-alerts", {
        method: "POST",
        body: JSON.stringify({ headline, organization, pdfUrl }),
      });
      showToast("News alert published.");
      closeForm();
      void load();
    } catch (err) {
      const m = err instanceof Error ? err.message : "Save failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id: string, hl: string) {
    const ok = await confirm({
      title: "Delete news alert",
      message: `Delete "${hl}"? This cannot be undone.`,
      variant: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setError(null);
    try {
      await apiJson(`/api/v1/admin/news-alerts/${id}`, { method: "DELETE" });
      showToast("News alert deleted.");
      void load();
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
        <h1 className="text-2xl font-semibold text-primary-navy">News &amp; alerts</h1>
        <p className="mt-1 text-sm text-text-light">
          Post a PDF news item. It will appear on the public website immediately.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-secondary-navy">New news alert</h2>
            <button
              type="button"
              onClick={closeForm}
              className="h-9 rounded-lg border border-border-subtle px-3 text-sm text-secondary-navy hover:bg-background-light"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Headline</span>
              <input
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Supreme Court rules on property rights"
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">Organization / Company</span>
              <input
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Supreme Court of Pakistan"
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-secondary-navy">PDF file</span>
              {pdfFile && (
                <p className="mt-1 text-sm text-secondary-navy">
                  Selected: <span className="font-medium">{pdfFile.name}</span>
                </p>
              )}
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-secondary-navy file:mr-3 file:rounded-md file:border file:border-secondary-navy/25 file:bg-background-white file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-primary-navy px-6 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60"
            >
              {saving ? "Publishing…" : "Publish"}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
        {loading ? (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openForm}
                className="h-10 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
              >
                New alert
              </button>
            </div>
            <p className="mt-4 text-text-light">Loading…</p>
          </>
        ) : rows.length === 0 && !showForm ? (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openForm}
                className="h-10 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
              >
                New alert
              </button>
            </div>
            <p className="mt-4 text-sm text-text-light">No news alerts yet.</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-text-light tabular-nums">
                {rows.length} alert{rows.length !== 1 ? "s" : ""}
              </p>
              {!showForm && (
                <button
                  type="button"
                  onClick={openForm}
                  className="h-10 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
                >
                  New alert
                </button>
              )}
            </div>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full min-w-[520px] table-fixed text-left text-sm">
                <thead className="border-b border-border-subtle bg-background-light text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
                  <tr>
                    <th className="px-4 py-3">Headline</th>
                    <th className="w-44 px-4 py-3">Organization</th>
                    <th className="w-32 px-4 py-3">Date</th>
                    <th className="w-24 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-4 py-3 font-medium text-text-dark">
                        <a
                          href={r.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-accent-blue hover:underline"
                        >
                          {r.headline}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-text-light">{r.organization}</td>
                      <td className="px-4 py-3 tabular-nums text-text-light">
                        {formatDate(r.published_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void deleteRow(r.id, r.headline)}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
