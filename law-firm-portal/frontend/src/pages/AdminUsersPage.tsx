import { type FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { apiJson } from "@/lib/api";

type UserRow = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  disabled: boolean;
  createdAt: string;
};

export function AdminUsersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"CLIENT" | "ADMIN">("CLIENT");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"CLIENT" | "ADMIN">("CLIENT");
  const [editDisabled, setEditDisabled] = useState(false);
  const [editPassword, setEditPassword] = useState("");

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ users: UserRow[] }>("/api/v1/admin/users");
      setRows(data.users);
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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiJson<{ user: UserRow }>("/api/v1/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      setNewEmail("");
      setNewPassword("");
      setNewRole("CLIENT");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(u: UserRow) {
    setEditingId(u.id);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDisabled(u.disabled);
    setEditPassword("");
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    try {
      const body: Record<string, unknown> = {
        email: editEmail,
        role: editRole,
        disabled: editDisabled,
      };
      if (editPassword.trim()) body.password = editPassword;
      await apiJson(`/api/v1/admin/users/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm("Delete this user permanently?")) return;
    setError(null);
    try {
      await apiJson(`/api/v1/admin/users/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-semibold text-primary-navy">Users</h1>
        <p className="mt-1 text-sm text-text-light">
          Create and manage portal accounts (admin and client).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
        <h2 className="font-semibold text-secondary-navy">New user</h2>
        <form
          onSubmit={onCreate}
          className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
        >
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "ADMIN" | "CLIENT")}
              className="w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            >
              <option value="CLIENT">Client</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="h-10 shrink-0 rounded-lg bg-primary-navy px-6 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60 lg:min-w-[120px]"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </form>
      </section>

      {loading ? (
        <p className="text-text-light">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-subtle bg-background-white shadow-sm">
          <table className="w-full min-w-[640px] table-fixed text-left text-sm">
            <thead className="border-b border-border-subtle bg-background-light text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
              <tr>
                <th className="w-[32%] px-4 py-3">Email</th>
                <th className="w-[14%] px-4 py-3">Role</th>
                <th className="w-[14%] px-4 py-3">Status</th>
                <th className="w-[200px] px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border-subtle last:border-0"
                >
                  {editingId === u.id ? (
                    <>
                      <td className="px-4 py-3" colSpan={4}>
                        <form
                          onSubmit={saveEdit}
                          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
                        >
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="rounded border px-2 py-1"
                            required
                          />
                          <select
                            value={editRole}
                            onChange={(e) =>
                              setEditRole(e.target.value as "ADMIN" | "CLIENT")
                            }
                            className="rounded border px-2 py-1"
                          >
                            <option value="CLIENT">Client</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={editDisabled}
                              onChange={(e) => setEditDisabled(e.target.checked)}
                            />
                            Disabled
                          </label>
                          <input
                            type="password"
                            placeholder="New password (optional)"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="rounded border px-2 py-1"
                          />
                          <button
                            type="submit"
                            className="rounded bg-primary-navy px-3 py-1 text-xs text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded border px-3 py-1 text-xs"
                          >
                            Cancel
                          </button>
                        </form>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-text-dark">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3">
                        {u.disabled ? (
                          <span className="text-red-700">Disabled</span>
                        ) : (
                          <span className="text-green-800">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-md border border-secondary-navy/25 bg-background-white px-3 text-sm font-medium text-secondary-navy shadow-sm transition-colors hover:border-accent-blue/40 hover:bg-background-light hover:text-accent-blue"
                          >
                            Edit
                          </button>
                          {u.id !== user.id ? (
                            <button
                              type="button"
                              onClick={() => void removeUser(u.id)}
                              className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              Delete
                            </button>
                          ) : (
                            <span
                              className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-md border border-transparent px-3 text-xs text-text-light"
                              title="You cannot delete your own account"
                            >
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-text-light">
        Deleting users removes their data from the portal database. You cannot
        delete the last admin or your own account.
      </p>
    </div>
  );
}
