import { type FormEvent, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { PortalLogo } from "@/components/brand/PortalLogo";
import { apiJson } from "@/lib/api";

export function ResetPasswordPage() {
  const { user, ready } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
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
      await apiJson<{ ok: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
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
            Sign in
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
            Set new password
          </h1>

          {!token ? (
            <p className="mt-4 text-center text-sm text-text-light">
              Missing reset token. Open the link from your email or{" "}
              <Link to="/forgot-password" className="text-accent-blue underline">
                request a new one
              </Link>
              .
            </p>
          ) : done ? (
            <div className="mt-6 space-y-4 text-center">
              <p className="text-sm text-text-dark">Your password was updated.</p>
              <Link
                to="/login"
                className="inline-block rounded-lg bg-primary-navy px-4 py-2 text-sm font-semibold text-background-white"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
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
                  className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 focus:ring-2"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary-navy px-4 py-2.5 text-sm font-semibold text-background-white hover:bg-secondary-navy disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
