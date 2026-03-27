import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { PortalLogo } from "@/components/brand/PortalLogo";
import { ClientNotificationDropdown } from "@/components/layout/ClientNotificationDropdown";

const navLinkClass =
  "text-secondary-navy transition-colors duration-300 hover:text-accent-blue";

export function PortalHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navActive = (prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);
  const linkClass = (active: boolean) =>
    active
      ? "rounded-md bg-primary-navy/5 px-3 py-1.5 text-secondary-navy ring-1 ring-secondary-navy/15"
      : navLinkClass;

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background-white/95 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <PortalLogo to="/dashboard" />
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm font-medium sm:gap-6">
          {user?.role === "ADMIN" && (
            <>
              <Link
                to="/dashboard"
                className={linkClass(navActive("/dashboard"))}
              >
                Dashboard
              </Link>
              <Link to="/cases" className={linkClass(navActive("/cases"))}>
                Cases
              </Link>
              <Link
                to="/admin/alerts"
                className={linkClass(navActive("/admin/alerts"))}
              >
                Hearing alerts
              </Link>
              <Link
                to="/admin/users"
                className={linkClass(navActive("/admin/users"))}
              >
                Users
              </Link>
            </>
          )}
          {user?.role === "CLIENT" && <ClientNotificationDropdown />}
          <button
            type="button"
            onClick={() => {
              void logout().then(() => navigate("/login", { replace: true }));
            }}
            className="text-text-light transition-colors hover:text-secondary-navy"
          >
            Sign out
          </button>
        </nav>
      </div>
      {/* Gold accent line — same motif as SectionTransition on main site */}
      <div
        className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-accent to-transparent"
        aria-hidden
      />
    </header>
  );
}
