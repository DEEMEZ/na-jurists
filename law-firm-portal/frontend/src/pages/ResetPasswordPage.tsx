import { type FormEvent, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AuthShell } from "@/components/layout/AuthShell";
import { useToast } from "@/components/ui/ToastProvider";
import { getSupabase } from "@/lib/supabaseClient";

const inputClass =
  "mt-1 w-full rounded-xl border border-secondary-navy/15 bg-background-light/90 px-3.5 py-2.5 text-text-dark outline-none ring-accent-blue/20 transition-shadow duration-200 focus:border-accent-blue/40 focus:bg-background-white focus:ring-2";

export function ResetPasswordPage() {
  const { showToast } = useToast();
  const { user, ready } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (params.get("type") === "recovery") setRecoveryReady(true);
    const sb = getSupabase();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="portal-shell flex min-h-screen flex-col items-center justify-center gap-4 bg-background-light text-text-light">
        <div className="portal-spinner" aria-hidden />
        <p className="text-sm font-medium text-secondary-navy">Loading…</p>
      </div>
    );
  }

  if (user && !recoveryReady) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: supaErr } = await getSupabase().auth.updateUser({
        password,
      });
      if (supaErr) throw new Error(supaErr.message);
      setDone(true);
      showToast("Password updated. You can sign in with your new password.");
      await getSupabase().auth.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      headerRight={
        <Link
          to="/login"
          className="portal-nav-link text-sm font-medium text-secondary-navy hover:text-accent-blue"
        >
          Sign in
        </Link>
      }
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-blue">
          Security
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary-navy">
          Set new password
        </h1>
      </div>

      {!recoveryReady ? (
        <p className="mt-6 text-center text-sm leading-relaxed text-text-light">
          Open the reset link from your email (it expires). Or{" "}
          <Link
            to="/forgot-password"
            className="font-medium text-accent-blue underline-offset-4 hover:underline"
          >
            request a new one
          </Link>
          .
        </p>
      ) : done ? (
        <div className="mt-8 space-y-5 text-center">
          <p className="rounded-xl border border-border-subtle bg-background-light/90 px-4 py-3 text-sm text-text-dark shadow-sm">
            Your password was updated.
          </p>
          <Link
            to="/login"
            className="inline-flex w-full justify-center rounded-xl bg-primary-navy px-4 py-3 text-sm font-semibold text-background-white shadow-md transition-all hover:bg-secondary-navy hover:shadow-lg"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-red-200/80 bg-red-50/95 px-3.5 py-2.5 text-sm text-red-800 shadow-sm">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-dark"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary-navy px-4 py-3 text-sm font-semibold text-background-white shadow-md transition-all duration-200 hover:bg-secondary-navy hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
