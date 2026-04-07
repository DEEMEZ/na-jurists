import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { AuthShell } from "@/components/layout/AuthShell";

const inputClass =
  "mt-1 w-full rounded-xl border border-secondary-navy/15 bg-background-light/90 px-3.5 py-2.5 text-text-dark outline-none ring-accent-blue/20 transition-shadow duration-200 placeholder:text-text-light/60 focus:border-accent-blue/40 focus:bg-background-white focus:ring-2";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return (
      <div className="portal-shell flex min-h-screen flex-col items-center justify-center gap-4 bg-background-light text-text-light">
        <div className="portal-spinner" aria-hidden />
        <p className="text-sm font-medium text-secondary-navy">Loading portal…</p>
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
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-blue">
          Welcome back
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary-navy">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-text-light">
          Access your cases and messages securely.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div
            className="rounded-xl border border-red-200/80 bg-red-50/95 px-3.5 py-2.5 text-sm text-red-800 shadow-sm"
            role="alert"
          >
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
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-dark"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary-navy px-4 py-3 text-sm font-semibold text-background-white shadow-md transition-all duration-200 hover:bg-secondary-navy hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-accent-blue underline-offset-4 transition-colors hover:text-secondary-navy hover:underline"
          >
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
