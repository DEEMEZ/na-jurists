import { type FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { apiJson } from "@/lib/api";

type LiquidationOrg = {
  id: string;
  name: string;
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

export function AdminLiquidationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [orgs, setOrgs] = useState<LiquidationOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ organizations: LiquidationOrg[] }>(
        "/api/v1/admin/liquidation-orgs"
      );
      setOrgs(data.organizations ?? []);
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
    setOrgName("");
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setOrgName("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiJson("/api/v1/admin/liquidation-orgs", {
        method: "POST",
        body: JSON.stringify({ name: orgName }),
      });
      showToast("Organization added.");
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

  async function deleteOrg(id: string, name: string) {
    const ok = await confirm({
      title: "Delete organization",
      message: `Delete "${name}"? This cannot be undone.`,
      variant: "danger",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setError(null);
    try {
      await apiJson(`/api/v1/admin/liquidation-orgs/${id}`, { method: "DELETE" });
      showToast("Organization deleted.");
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
        <h1 className="text-2xl font-semibold text-primary-navy">Liquidation</h1>
        <p className="mt-1 text-sm text-text-light">
          Manage organizations undergoing liquidation. Click an organization to manage its news alerts.
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
            <h2 className="font-semibold text-secondary-navy">New organization</h2>
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
              <span className="font-medium text-secondary-navy">Organization name</span>
              <input
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Seedcred Financial Services"
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-primary-navy px-6 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add organization"}
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
                New organization
              </button>
            </div>
            <p className="mt-4 text-text-light">Loading…</p>
          </>
        ) : orgs.length === 0 && !showForm ? (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openForm}
                className="h-10 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
              >
                New organization
              </button>
            </div>
            <p className="mt-4 text-sm text-text-light">No organizations yet. Add one to get started.</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-text-light tabular-nums">
                {orgs.length} organization{orgs.length !== 1 ? "s" : ""}
              </p>
              {!showForm && (
                <button
                  type="button"
                  onClick={openForm}
                  className="h-10 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
                >
                  New organization
                </button>
              )}
            </div>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border-subtle">
              <table className="w-full min-w-[400px] table-fixed text-left text-sm">
                <thead className="border-b border-border-subtle bg-background-light text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
                  <tr>
                    <th className="px-4 py-3">Organization</th>
                    <th className="w-36 px-4 py-3">Added</th>
                    <th className="w-24 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b border-border-subtle last:border-0 hover:bg-background-light/50 cursor-pointer"
                      onClick={() => navigate(`/admin/news-alerts?org=${encodeURIComponent(org.name)}`)}
                    >
                      <td className="px-4 py-3 font-medium text-text-dark hover:text-accent-blue">
                        {org.name}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-text-light">
                        {formatDate(org.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => void deleteOrg(org.id, org.name)}
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
