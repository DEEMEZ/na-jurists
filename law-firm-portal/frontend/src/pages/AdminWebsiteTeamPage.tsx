import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Navigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { useConfirm } from "@/components/ui/ConfirmDialogProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { apiJson } from "@/lib/api";
import { uploadWebsiteTeamPhoto } from "@/lib/portalApi";
import { getSupabase } from "@/lib/supabaseClient";
import { WEBSITE_TEAM_IMAGE_KEYS } from "@site/lib/websiteTeamDefaults";

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

const FIXED_DELAY_MS = 100;

/** Match GET /website-team: founders by sortOrder, then members. */
function canonicalTeamRows(prev: TeamRow[]): TeamRow[] {
  const founders = prev
    .filter((r) => r.section === "founder")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const members = prev
    .filter((r) => r.section === "member")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return [...founders, ...members];
}

function canonicalAfterSectionReorder(prev: TeamRow[], ordered: TeamRow[]): TeamRow[] {
  const sortPatch = new Map(ordered.map((r, i) => [r.id, (i + 1) * 10]));
  const merged = prev.map((r) =>
    sortPatch.has(r.id) ? { ...r, sortOrder: sortPatch.get(r.id)! } : r,
  );
  return canonicalTeamRows(merged);
}

function canonicalReplaceRow(prev: TeamRow[], replacement: TeamRow): TeamRow[] {
  const merged = prev.map((r) => (r.id === replacement.id ? replacement : r));
  return canonicalTeamRows(merged);
}

function canonicalInsertRow(prev: TeamRow[], inserted: TeamRow): TeamRow[] {
  return canonicalTeamRows([...prev, inserted]);
}

function canonicalRemoveRow(prev: TeamRow[], id: string): TeamRow[] {
  return canonicalTeamRows(prev.filter((r) => r.id !== id));
}

function SortableTeamCard({
  row,
  dragDisabled,
  photoHint,
  onEdit,
  onDelete,
}: {
  row: TeamRow;
  dragDisabled: boolean;
  photoHint: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: dragDisabled,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-stretch gap-3 rounded-xl border border-border-subtle bg-background-white p-4 shadow-sm"
    >
      {/* Whole primary column draggable (not only the grip) — keeps Edit/Delete clickable */}
      <div
        className={`flex min-w-0 flex-1 cursor-grab touch-none select-none items-start gap-3 rounded-lg active:cursor-grabbing ${
          dragDisabled ? "cursor-not-allowed opacity-40" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-secondary-navy/20 text-secondary-navy"
          aria-hidden
        >
          <GripVertical className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-semibold text-text-dark">{row.name}</p>
          <p className="text-sm text-text-light">{row.title || "—"}</p>
          <p className="mt-1 text-xs text-secondary-navy/80">{photoHint}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 min-w-[4rem] items-center justify-center rounded-md border border-secondary-navy/25 px-3 text-sm font-medium text-secondary-navy hover:bg-background-light"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 min-w-[4rem] items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState<"founder" | "member">("member");
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newImage, setNewImage] = useState("");
  const [saving, setSaving] = useState(false);

  const rowsRef = useRef<TeamRow[]>([]);
  rowsRef.current = rows;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function load() {
    if (user?.role !== "ADMIN") return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<{ rows: TeamRow[] }>("/api/v1/admin/website-team");
      setRows(canonicalTeamRows(data.rows));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.role]);

  const founders = rows.filter((r) => r.section === "founder");
  const members = rows.filter((r) => r.section === "member");

  const nextSortForSection = (section: "founder" | "member") => {
    const slice = rows.filter((r) => r.section === section);
    if (slice.length === 0) return 10;
    return Math.max(...slice.map((r) => r.sortOrder)) + 10;
  };

  if (!user) return null;
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  async function seedBuiltInTeam() {
    const ok =
      rows.length === 0
        ? await confirm({
            title: "Load built-in website team?",
            message:
              "Insert the default founder + Our Team roster into the database so you can edit it here. Safe when the table is empty.",
            variant: "default",
            confirmLabel: "Load defaults",
            cancelLabel: "Cancel",
          })
        : await confirm({
            title: "Replace entire website team?",
            message:
              "This deletes all existing website team rows and inserts the built-in roster from the marketing site. Continue?",
            variant: "danger",
            confirmLabel: "Replace all",
            cancelLabel: "Cancel",
          });
    if (!ok) return;
    setSaving(true);
    setError(null);
    try {
      await apiJson("/api/v1/admin/website-team/seed-defaults", { method: "POST", body: "{}" });
      const data = await apiJson<{ rows: TeamRow[] }>("/api/v1/admin/website-team");
      setRows(canonicalTeamRows(data.rows));
      showToast("Website team loaded from defaults.");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Seed failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  function photoHintForRow(r: TeamRow): string {
    if (r.photoStoragePath) return "Photo: uploaded";
    if (r.imageKey) return `Photo: preset (${r.imageKey})`;
    return "Photo: none";
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

      const { row } = await apiJson<{ row: TeamRow }>(`/api/v1/admin/website-team/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          section: editSection,
          sortOrder: editSort,
          name: editName,
          title: editTitle,
          bio: editBio,
          photoStoragePath,
          imageKey: editImage === "" ? null : editImage,
          delayMs: FIXED_DELAY_MS,
        }),
      });
      setEditingId(null);
      setRows((prev) => canonicalReplaceRow(prev, row));
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
      setRows((prev) => canonicalRemoveRow(prev, id));
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

      const { row } = await apiJson<{ row: TeamRow }>("/api/v1/admin/website-team", {
        method: "POST",
        body: JSON.stringify({
          section: newSection,
          sortOrder: nextSortForSection(newSection),
          name: newName,
          title: newTitle,
          bio: newBio,
          photoStoragePath,
          imageKey: imageKeyVal,
          delayMs: FIXED_DELAY_MS,
        }),
      });
      setNewName("");
      setNewTitle("");
      setNewBio("");
      setNewImage("");
      setShowAddForm(false);
      setRows((prev) => canonicalInsertRow(prev, row));
      showToast("Team row created.");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Create failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  async function runReorder(section: "founder" | "member", ordered: TeamRow[]) {
    if (editingId) {
      showToast("Finish or cancel editing before reordering.", "error");
      return;
    }
    const snapshot = rowsRef.current.map((r) => ({ ...r }));
    setSaving(true);
    setError(null);
    setRows(canonicalAfterSectionReorder(rowsRef.current, ordered));
    try {
      await apiJson<{ ok: boolean }>("/api/v1/admin/website-team/reorder", {
        method: "POST",
        body: JSON.stringify({
          section,
          orderedIds: ordered.map((r) => r.id),
        }),
      });
      showToast("Order saved.");
    } catch (err) {
      setRows(snapshot);
      const m = err instanceof Error ? err.message : "Reorder failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSaving(false);
    }
  }

  function onDragEnd(section: "founder" | "member", list: TeamRow[], e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = list.findIndex((x) => x.id === active.id);
    const newIdx = list.findIndex((x) => x.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    void runReorder(section, arrayMove(list, oldIdx, newIdx));
  }

  const dragLocked = Boolean(editingId) || saving;

  const editingRow = useMemo(() => rows.find((r) => r.id === editingId), [rows, editingId]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <BackToDashboard />
      <div>
        <h1 className="text-2xl font-semibold text-primary-navy">Website team</h1>
        <p className="mt-1 text-sm text-text-light">
          Drag rows by the handle area or anywhere on the name/title block (long-press on touch). The order here matches
          the Our Team grid on the public site. New members are added at the end of their section.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}

      {loading ? (
        <p className="text-text-light">Loading…</p>
      ) : rows.length === 0 ? (
        <section className="rounded-xl border border-border-subtle bg-background-white p-8 text-center shadow-sm">
          <p className="text-sm text-text-dark">
            No team rows in the database yet. The public site still uses built-in defaults from code until you add rows
            here—or load them in one step.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => void seedBuiltInTeam()}
            className="mt-4 h-11 rounded-lg bg-primary-navy px-6 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60"
          >
            {saving ? "Working…" : "Load built-in website team"}
          </button>
          <p className="mt-3 text-xs text-text-light">
            After loading, you can reorder, edit photos, or add members. Empty database is normal on new projects.
          </p>
        </section>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-secondary-navy">
                Founder / Leadership ({founders.length})
              </h2>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => onDragEnd("founder", founders, e)}
            >
              <SortableContext items={founders.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {founders.map((r) => (
                    <SortableTeamCard
                      key={r.id}
                      row={r}
                      dragDisabled={dragLocked}
                      photoHint={photoHintForRow(r)}
                      onEdit={() => startEdit(r)}
                      onDelete={() => void removeRow(r.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-secondary-navy">Our Team grid ({members.length})</h2>
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="h-10 rounded-lg bg-primary-navy px-4 text-sm font-semibold text-white hover:bg-secondary-navy"
              >
                {showAddForm ? "Hide add form" : "Add team member"}
              </button>
            </div>

            {showAddForm && (
              <div className="rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm">
                <h3 className="font-semibold text-secondary-navy">New row</h3>
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
                  <div className="hidden sm:block" aria-hidden />
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
                    Photo upload
                    <input
                      ref={newPhotoFileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="mt-1 block w-full text-sm text-secondary-navy file:mr-3 file:rounded-md file:border file:border-secondary-navy/25 file:bg-background-white file:px-3 file:py-1.5 file:text-sm file:font-medium"
                    />
                    <span className="mt-1 block text-[11px] text-text-light">
                      JPEG, PNG, WebP, or GIF — max 5 MB.
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
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-primary-navy px-6 py-2 text-sm font-semibold text-white hover:bg-secondary-navy disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save new row"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => onDragEnd("member", members, e)}
            >
              <SortableContext items={members.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {members.map((r) => (
                    <SortableTeamCard
                      key={r.id}
                      row={r}
                      dragDisabled={dragLocked}
                      photoHint={photoHintForRow(r)}
                      onEdit={() => startEdit(r)}
                      onDelete={() => void removeRow(r.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        </div>
      )}

      {editingRow && editingId && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4">
        <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-accent-blue/30 bg-background-white p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-secondary-navy">Edit {editName || editingRow.name}</h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="h-9 rounded-lg border border-border-subtle px-3 text-sm text-secondary-navy hover:bg-background-light"
            >
              Cancel edit
            </button>
          </div>
          <form onSubmit={(e) => void saveEdit(e)} className="mt-6 flex flex-col gap-3">
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
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded bg-primary-navy px-4 py-2 text-sm text-white">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </section>
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
