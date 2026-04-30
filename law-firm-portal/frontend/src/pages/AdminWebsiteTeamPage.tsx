import { type FormEvent, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { apiJson } from "@/lib/api";
import { getSupabase } from "@/lib/supabaseClient";
import { uploadWebsiteTeamPhoto } from "@/lib/portalApi";
import { DEFAULT_WEBSITE_TEAM, WEBSITE_TEAM_IMAGE_KEYS } from "@site/lib/websiteTeamDefaults";
type TeamRow = {
  id: string;
  section: "founder" | "member";
  sortOrder: number;
  name: string;
  title: string;
  bio: string;
  imageKey: string | null;
  photoStoragePath: string | null;
  delayMs: number;
};

const TEAM_PHOTO_BUCKET = "website-team";

function teamPhotoPreviewUrl(storagePath: string | null): string | null {
  const p = storagePath?.trim();
  if (!p) return null;
  const { data } = getSupabase().storage.from(TEAM_PHOTO_BUCKET).getPublicUrl(p);
  return data.publicUrl ?? null;
}
const IMAGE_OPTIONS: string[] = ["", ...WEBSITE_TEAM_IMAGE_KEYS];

export function AdminWebsiteTeamPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const newPhotoFileRef = useRef<HTMLInputElement>(null);
  const editPhotoFileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<"founder" | "member">("member");
  const [editSort, setEditSort] = useState(0);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editPhotoStoragePath, setEditPhotoStoragePath] = useState<string | null>(null);
  const [editDelay, setEditDelay] = useState(100);

  const [newSection, setNewSection] = useState<"founder" | "member">("member");
  const [newSort, setNewSort] = useState(120);
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newDelay, setNewDelay] = useState(100);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ rows: TeamRow[] }>("/api/v1/admin/website-team");
      setRows(data.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.role]);

  useEffect(() => {
    const maxDefault = Math.max(...DEFAULT_WEBSITE_TEAM.members.map((m) => m.sortOrder));
    const memberRows = rows.filter((r) => r.section === "member");
    const maxDb =
      memberRows.length > 0 ? Math.max(...memberRows.map((r) => r.sortOrder)) : 0;
    setNewSort(Math.max(maxDefault, maxDb) + 10);
  }, [rows]);

  if (!user) return null;
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  function startEdit(r: TeamRow) {
    setEditingId(r.id);
    setEditSection(r.section);
    setEditSort(r.sortOrder);
    setEditName(r.name);
    setEditTitle(r.title);
    setEditBio(r.bio);
    setEditImage(r.imageKey ?? "");
    setEditPhotoStoragePath(r.photoStoragePath);
    setEditDelay(r.delayMs);
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const file = editPhotoFileRef.current?.files?.[0];
      let photoStoragePath = editPhotoStoragePath;
      if (file) {
        const up = await uploadWebsiteTeamPhoto(file);
        photoStoragePath = up.photoStoragePath;
      }
      if (editPhotoFileRef.current) editPhotoFileRef.current.value = "";

      await apiJson(`/api/v1/admin/website-team/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          section: editSection,
          sortOrder: editSort,
          name: editName,
          title: editTitle,
          bio: editBio,
          photoStoragePath,
          imageKey: editImage === "" ? null : editImage,
          delayMs: editDelay,
        }),
      });
      setEditingId(null);
      await load();
      showToast("Team row saved.");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Save failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(id: string) {
    const ok = await confirm({
      title: "Remove team row",
      message:
        "Remove this person from the database? The public site will fall back to built-in content when no rows exist, or omit this row from the live grid.",
      variant: "danger",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setError(null);
    try {
      await apiJson(`/api/v1/admin/website-team/${id}`, { method: "DELETE" });
      await load();
      showToast("Row removed.");
      if (editingId === id) setEditingId(null);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Delete failed";
      setError(m);
      showToast(m, "error");
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const file = newPhotoFileRef.current?.files?.[0];
      let photoStoragePath: string | null = null;
      let imageKeyVal: string | null = null;
      if (file) {
        const up = await uploadWebsiteTeamPhoto(file);
        photoStoragePath = up.photoStoragePath;
      } else if (newImage !== "") {
        imageKeyVal = newImage;
      }
      if (newPhotoFileRef.current) newPhotoFileRef.current.value = "";

      await apiJson("/api/v1/admin/website-team", {
        method: "POST",
        body: JSON.stringify({
          section: newSection,
          sortOrder: newSort,
          name: newName,
          title: newTitle,
          bio: newBio,
          photoStoragePath,
          imageKey: imageKeyVal,
          delayMs: newDelay,
        }),
      });
      setNewName("");
      setNewTitle("");
      setNewBio("");
      setNewImage("");
      setNewDelay(100);
      setNewSection("member");
      await load();
      showToast("Team row created.");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Create failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  const founders = rows.filter((r) => r.section === "founder");
  const members = rows.filter((r) => r.section === "member");

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-semibold text-primary-navy">Website team</h1>
        <p className="mt-1 text-sm text-text-light">
          Manage the Leadership spotlight and Our Team grid on the public site (names, titles, bios, photos,
          order).        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
        <h2 className="font-semibold text-secondary-navy">New row</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-secondary-navy">
            Section
            <select
              value={newSection}
              onChange={(e) => setNewSection(e.target.value as "founder" | "member")}
              className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            >
              <option value="founder">Founder (Leadership panel)</option>
              <option value="member">Member (Our Team grid)</option>
            </select>
          </label>
          <label className="text-xs font-medium text-secondary-navy">
            Sort order
            <input
              type="number"
              value={newSort}
              onChange={(e) => setNewSort(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-[11px] text-text-light">
              Built-in cards use 10–110. Use the suggested next value (or higher) to <strong>add</strong> a person
              without replacing an existing slot.
            </span>
          </label>
          <label className="text-xs font-medium text-secondary-navy sm:col-span-2">
            Name
            <input
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-secondary-navy sm:col-span-2">
            Title
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-secondary-navy sm:col-span-2">
            Bio / intro (use blank lines between paragraphs for the Leadership layout)
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-secondary-navy sm:col-span-2">
            Photo
            <input
              ref={newPhotoFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-1 block w-full text-sm text-secondary-navy file:mr-3 file:rounded-md file:border file:border-secondary-navy/25 file:bg-background-white file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <span className="mt-1 block text-[11px] text-text-light">
              JPEG, PNG, WebP, or GIF — max 5 MB. Uploaded photos replace preset library images for this row.
            </span>
          </label>
          <label className="text-xs font-medium text-secondary-navy sm:col-span-2">
            Preset photo (optional)
            <select
              value={newImage}
              onChange={(e) => {
                setNewImage(e.target.value);
                if (e.target.value !== "" && newPhotoFileRef.current) newPhotoFileRef.current.value = "";
              }}
              className="mt-1 w-full max-w-md rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            >
              {IMAGE_OPTIONS.map((k) => (
                <option key={k || "none"} value={k}>
                  {k === "" ? "(None)" : k}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-secondary-navy">
            Animation delay (ms)
            <input
              type="number"
              value={newDelay}
              onChange={(e) => setNewDelay(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-secondary-navy/20 px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-navy px-6 py-2 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add row"}
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <p className="text-text-light">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-text-light">No rows yet.</p>
      ) : (
        <div className="space-y-8">
          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-background-white shadow-sm">
            <h3 className="border-b border-border-subtle bg-background-light px-4 py-3 text-sm font-semibold text-secondary-navy">
              Founder / Leadership ({founders.length})
            </h3>
            <table className="w-full min-w-[640px] table-fixed text-left text-sm">
              <thead className="border-b border-border-subtle text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Photo</th>
                  <th className="w-[200px] px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {founders.map((r) => renderRow(r))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-background-white shadow-sm">
            <h3 className="border-b border-border-subtle bg-background-light px-4 py-3 text-sm font-semibold text-secondary-navy">
              Our Team grid ({members.length})
            </h3>
            <table className="w-full min-w-[640px] table-fixed text-left text-sm">
              <thead className="border-b border-border-subtle text-xs font-semibold uppercase tracking-wide text-secondary-navy/80">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Photo</th>
                  <th className="w-[200px] px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((r) => renderRow(r))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  function renderRow(r: TeamRow) {
    if (editingId === r.id) {
      return (
        <tr key={r.id} className="border-b border-border-subtle bg-background-light/60">
          <td className="px-4 py-3" colSpan={5}>
            <form onSubmit={saveEdit} className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium">
                  Section
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value as "founder" | "member")}
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  >
                    <option value="founder">Founder</option>
                    <option value="member">Member</option>
                  </select>
                </label>
                <label className="text-xs font-medium">
                  Sort order
                  <input
                    type="number"
                    value={editSort}
                    onChange={(e) => setEditSort(Number(e.target.value))}
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  />
                </label>
              </div>
              <input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded border px-2 py-1 text-sm"
                placeholder="Name"
              />
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="rounded border px-2 py-1 text-sm"
                placeholder="Title"
              />
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={5}
                className="rounded border px-2 py-1 text-sm"
                placeholder="Bio"
              />
              <div className="rounded border border-border-subtle bg-background-white p-3">
                <p className="text-xs font-medium text-secondary-navy">Photo</p>
                {teamPhotoPreviewUrl(editPhotoStoragePath) ? (
                  <img
                    src={teamPhotoPreviewUrl(editPhotoStoragePath) ?? ""}
                    alt=""
                    className="mt-2 h-20 w-20 rounded-full object-cover ring-1 ring-border-subtle"
                  />
                ) : null}
                <input
                  ref={editPhotoFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="mt-2 block w-full text-sm file:mr-2 file:rounded file:border file:px-2 file:py-1 file:text-xs"
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-red-700 underline"
                  onClick={() => {
                    setEditPhotoStoragePath(null);
                    if (editPhotoFileRef.current) editPhotoFileRef.current.value = "";
                  }}
                >
                  Remove uploaded photo
                </button>
                <label className="mt-2 block text-xs font-medium text-secondary-navy">
                  Preset photo (optional)
                  <select
                    value={editImage}
                    onChange={(e) => {
                      setEditImage(e.target.value);
                      if (e.target.value !== "") {
                        setEditPhotoStoragePath(null);
                        if (editPhotoFileRef.current) editPhotoFileRef.current.value = "";
                      }
                    }}
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  >
                    {IMAGE_OPTIONS.map((k) => (
                      <option key={k || "none"} value={k}>
                        {k === "" ? "(None)" : k}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  value={editDelay}
                  onChange={(e) => setEditDelay(Number(e.target.value))}
                  className="rounded border px-2 py-1 text-sm"
                  placeholder="Delay ms"
                />
              </div>              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="rounded bg-primary-navy px-3 py-1 text-xs text-white">
                  Save
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="rounded border px-3 py-1 text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      );
    }

    return (
      <tr key={r.id} className="border-b border-border-subtle last:border-0">
        <td className="px-4 py-3 align-middle">{r.sortOrder}</td>
        <td className="px-4 py-3 font-medium text-text-dark">{r.name}</td>
        <td className="px-4 py-3 text-text-light">{r.title || "—"}</td>
        <td className="px-4 py-3 align-middle">
          {r.photoStoragePath ? (
            <span className="text-green-800">Uploaded</span>
          ) : r.imageKey ? (
            <span className="font-mono text-xs text-text-light">{r.imageKey}</span>
          ) : (
            <span className="text-text-light">—</span>
          )}
        </td>        <td className="px-4 py-3 text-right align-middle">
          <div className="inline-flex gap-2">
            <button
              type="button"
              onClick={() => startEdit(r)}
              className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-md border border-secondary-navy/25 bg-background-white px-3 text-sm font-medium text-secondary-navy shadow-sm hover:bg-background-light"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => void removeRow(r.id)}
              className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    );
  }
}
