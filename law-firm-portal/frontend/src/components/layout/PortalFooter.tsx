import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
const FOOTER_PATTERN =
  'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M50 50m-40 0a40 40 0 1 1 80 0a40 40 0 1 1 -80 0M25 25l50 50M75 25l-50 50\'/%3E%3C/g%3E%3C/svg%3E")';

/**
 * Portal footer — same navy gradient language as the main site footer,
 * with routes and copy appropriate for the portal (not the marketing site).
 */
export function PortalFooter() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-br from-primary-navy via-secondary-navy to-primary-navy text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: FOOTER_PATTERN,
          backgroundSize: "150px 150px",
        }}
        aria-hidden
      />
      <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-accent-blue/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <img
              src="/text-logo.png"
              alt="N&A Jurists"
              className="h-11 w-auto max-w-[200px] opacity-90 brightness-0 invert"
              width={200}
              height={48}
            />
            <p className="max-w-sm text-sm leading-relaxed text-blue-100/90">
              Secure access to your matters, documents, hearings, and firm
              communications.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Portal
            </h4>
            <ul className="space-y-2 text-sm text-blue-100/90">
              <li>
                <Link
                  to="/dashboard"
                  className="transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/cases" className="transition-colors hover:text-white">
                  Cases
                </Link>
              </li>
              {user?.role === "ADMIN" && (
                <>
                  <li>
                    <Link
                      to="/admin/hearings"
                      className="transition-colors hover:text-white"
                    >
                      Upcoming hearings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/messages"
                      className="transition-colors hover:text-white"
                    >
                      Client messages
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/alerts"
                      className="transition-colors hover:text-white"
                    >
                      Hearing alerts
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/users"
                      className="transition-colors hover:text-white"
                    >
                      Users
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">
              Firm
            </h4>
            <p className="text-sm leading-relaxed text-blue-100/90">
              N&amp;A Jurists — Advocates, Corporate &amp; Legal Consultants.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-blue-100/85">
              © {year} N&A Jurists. All rights reserved.
            </p>
            <p className="text-xs text-blue-200/80">
              Advocates, Corporate & Legal Consultants
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
