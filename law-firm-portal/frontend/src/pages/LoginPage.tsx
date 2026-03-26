import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { PortalLogo } from "@/components/brand/PortalLogo";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, ready, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <header className="border-b border-border-subtle bg-background-white/95 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex items-center px-4 py-4">
          <PortalLogo />
        </div>
        <div
          className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-accent to-transparent"
          aria-hidden
        />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-border-subtle bg-background-white p-8 shadow-lg">
          <h1 className="text-center text-xl font-semibold text-primary-navy">
            Sign in
          </h1>
          <p className="mt-2 text-center text-sm text-text-light">
            Access your cases and messages securely.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
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
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 transition-shadow focus:ring-2"
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
                className="mt-1 w-full rounded-lg border border-secondary-navy/20 bg-background-light px-3 py-2 text-text-dark outline-none ring-accent-blue/30 transition-shadow focus:ring-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary-navy px-4 py-2.5 text-sm font-semibold text-background-white transition-colors hover:bg-secondary-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-center text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-accent-blue hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
