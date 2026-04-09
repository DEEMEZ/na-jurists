import { type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AuthShell } from "@/components/layout/AuthShell";
import { useToast } from "@/components/ui/ToastProvider";
import { getSupabase } from "@/lib/supabaseClient";

const inputClass =
  "mt-1 w-full rounded-xl border border-secondary-navy/15 bg-background-light/90 px-3.5 py-2.5 text-text-dark outline-none ring-accent-blue/20 transition-shadow duration-200 focus:border-accent-blue/40 focus:bg-background-white focus:ring-2";

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const { user, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const origin = window.location.origin.replace(/\/$/, "");
      const { error: supaErr } = await getSupabase().auth.resetPasswordForEmail(
        email,
        { redirectTo: `${origin}/reset-password` },
      );
      if (supaErr) throw new Error(supaErr.message);
      setDone(true);
      showToast(
        "If this email is registered, you will receive reset instructions shortly.",
        "info",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
          Back to sign in
        </Link>
      }
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-blue">
          Account recovery
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary-navy">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-text-light">
          Enter your email and we&apos;ll send a reset link if an account exists.
        </p>
      </div>

      {done ? (
        <p className="mt-8 rounded-xl border border-border-subtle bg-background-light/90 px-4 py-3.5 text-center text-sm leading-relaxed text-text-dark shadow-sm">
          If this email is registered, you will receive instructions shortly.
          Check your inbox and spam folder.
        </p>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-red-200/80 bg-red-50/95 px-3.5 py-2.5 text-sm text-red-800 shadow-sm">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-dark"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary-navy px-4 py-3 text-sm font-semibold text-background-white shadow-md transition-all duration-200 hover:bg-secondary-navy hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
