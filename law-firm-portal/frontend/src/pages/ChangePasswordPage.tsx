import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AuthShell } from "@/components/layout/AuthShell";
import { useToast } from "@/components/ui/ToastProvider";
import { withPortalLoading } from "@/lib/portalLoadingBus";
import { getSupabase } from "@/lib/supabaseClient";

const inputClass =
  "mt-1 w-full rounded-xl border border-secondary-navy/15 bg-background-light/90 px-3.5 py-2.5 text-text-dark outline-none ring-accent-blue/20 transition-shadow duration-200 placeholder:text-text-light/60 focus:border-accent-blue/40 focus:bg-background-white focus:ring-2";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return (
      <div className="portal-shell flex min-h-screen flex-col items-center justify-center gap-4 bg-background-light text-text-light">
        <div className="portal-spinner" aria-hidden />
        <p className="text-sm font-medium text-secondary-navy">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const actor = user;
    if (!actor) return;
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await withPortalLoading(async () => {
        const sb = getSupabase();
        const { error: ue } = await sb.auth.updateUser({ password });
        if (ue) throw new Error(ue.message);
      });
      setPassword("");
      setConfirm("");
      showToast("Password updated.");
      if (actor.role === "ADMIN") {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-blue">Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary-navy">Change password</h1>
        <p className="mt-2 text-sm text-text-light">
          Choose a strong password you have not used elsewhere.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={(e) => void handleSubmit(e)}>
        {error && (
          <div
            className="rounded-xl border border-red-200/80 bg-red-50/95 px-3.5 py-2.5 text-sm text-red-800 shadow-sm"
            role="alert"
          >
            {error}
          </div>
        )}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-text-dark">
            New password
          </label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
            minLength={8}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-text-dark">
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            required
            minLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary-navy px-4 py-3 text-sm font-semibold text-background-white shadow-md transition-all duration-200 hover:bg-secondary-navy hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Update password"}
        </button>
        <p className="text-center text-sm">
          <Link
            to="/dashboard"
            className="font-medium text-accent-blue underline-offset-4 hover:text-secondary-navy hover:underline"
          >
            Back to dashboard
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
