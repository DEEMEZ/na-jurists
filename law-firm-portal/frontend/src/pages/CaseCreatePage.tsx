import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { BackToDashboard } from "@/components/layout/BackToDashboard";
import { useToast } from "@/components/ui/ToastProvider";
import { apiJson } from "@/lib/api";
import {
  WEBSITE_CASE_COURTS,
  WEBSITE_CASE_SUBJECTS,
} from "@site/constants/caseTaxonomy";

export function CaseCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [court, setCourt] = useState<string>(WEBSITE_CASE_COURTS[0] ?? "");
  const [subject, setSubject] = useState<string>(WEBSITE_CASE_SUBJECTS[0] ?? "");
  const [displayOnWebsite, setDisplayOnWebsite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;
  if (user.role !== "ADMIN") {
    return <Navigate to="/cases" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiJson<{ case: { id: string } }>("/api/v1/admin/cases", {
        method: "POST",
        body: JSON.stringify({
          title,
          reference: reference.trim() || undefined,
          court,
          subject,
          displayOnWebsite,
        }),
      });
      showToast("Case created.");
      navigate(`/cases/${res.case.id}`, { replace: true });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Failed";
      setError(m);
      showToast(m, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <BackToDashboard />
      <h1 className="text-2xl font-semibold text-primary-navy">New case</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border border-border-subtle bg-background-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-text-dark">
            Title
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark">
            Reference (optional)
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark">
            Court
          </label>
          <p className="mt-0.5 text-xs text-text-light">
            Same options as the public website cases page — used for filters and the court column.
          </p>
          <select
            required
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 focus:ring-2"
          >
            {WEBSITE_CASE_COURTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark">
            Subject
          </label>
          <p className="mt-0.5 text-xs text-text-light">
            Same subject list as the website — shown in the subject column when published.
          </p>
          <select
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 focus:ring-2"
          >
            {WEBSITE_CASE_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={displayOnWebsite}
            onChange={(e) => setDisplayOnWebsite(e.target.checked)}
          />
          <span className="text-sm text-text-dark">
            Display on public website (firm cases page) when published
          </span>
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-background-white hover:bg-secondary-navy disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-dark hover:bg-background-light"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
