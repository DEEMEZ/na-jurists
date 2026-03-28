import { type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { PortalLogo } from "@/components/brand/PortalLogo";
import { getSupabase } from "@/lib/supabaseClient";

export function ForgotPasswordPage() {
  const { user, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light text-text-light">
        Loading…
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <header className="border-b border-border-subtle bg-background-white/95 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <PortalLogo />
          <Link
            to="/login"
            className="text-sm font-medium text-secondary-navy hover:text-accent-blue"
          >
            Back to sign in
          </Link>
        </div>
        <div
          className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-accent to-transparent"
          aria-hidden
        />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-background-white p-8 shadow-lg">
          <h1 className="text-center text-xl font-semibold text-primary-navy">
            Forgot password
          </h1>
          <p className="mt-2 text-center text-sm text-text-light">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>

          {done ? (
            <p className="mt-4 rounded-lg border border-border-subtle bg-background-light px-3 py-3 text-sm text-text-dark">
              If this email is registered, you will receive instructions shortly.
              Check your inbox and spam folder.
            </p>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
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
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 focus:ring-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary-navy px-4 py-2.5 text-sm font-semibold text-background-white hover:bg-secondary-navy disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
