import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { PortalLogo } from "@/components/brand/PortalLogo";
import { ClientNotificationDropdown } from "@/components/layout/ClientNotificationDropdown";

const navLinkClass =
  "portal-nav-link text-secondary-navy hover:text-accent-blue";

const mobileRowClass =
  "block rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-navy transition-colors hover:bg-primary-navy/5 hover:text-accent-blue";

export function PortalHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navActive = (prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

  const linkClass = (active: boolean) =>
    active
      ? "portal-nav-link rounded-lg bg-primary-navy/8 px-3 py-1.5 text-secondary-navy shadow-sm ring-1 ring-secondary-navy/20"
      : navLinkClass;

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/90 bg-background-white/90 shadow-[0_1px_0_0_rgba(26,43,61,0.04)] backdrop-blur-md">
      <div className="container mx-auto flex min-h-[52px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="min-w-0 shrink-0">
          <PortalLogo to="/dashboard" />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex md:gap-2 lg:gap-4">
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
            {user?.role === "CLIENT" && (
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
                <ClientNotificationDropdown />
              </>
            )}
            <button
              type="button"
              onClick={() => {
                void logout().then(() => navigate("/login", { replace: true }));
              }}
              className="portal-nav-link rounded-md px-2 text-text-light hover:text-secondary-navy lg:px-3"
            >
              Sign out
            </button>
          </nav>

          {/* Mobile: notifications + menu (CLIENT keeps bell; ADMIN only hamburger) */}
          {user?.role === "CLIENT" && (
            <div className="md:hidden">
              <ClientNotificationDropdown />
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-secondary-navy transition-colors hover:bg-primary-navy/5 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="portal-mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" strokeWidth={2} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel — same pattern as marketing site Navbar */}
      {mobileOpen && (
        <div
          id="portal-mobile-nav"
          className="border-t border-border-subtle/80 bg-background-white shadow-lg md:hidden"
        >
          <nav
            className="container mx-auto flex max-h-[min(70vh,calc(100dvh-8rem))] flex-col gap-0.5 overflow-y-auto px-4 py-3"
            aria-label="Mobile navigation"
          >
            {user?.role === "ADMIN" && (
              <>
                <Link
                  to="/dashboard"
                  className={`${mobileRowClass} ${navActive("/dashboard") ? "bg-primary-navy/8 text-primary-navy ring-1 ring-secondary-navy/15" : ""}`}
                  onClick={closeMobile}
                >
                  Dashboard
                </Link>
                <Link
                  to="/cases"
                  className={`${mobileRowClass} ${navActive("/cases") ? "bg-primary-navy/8 text-primary-navy ring-1 ring-secondary-navy/15" : ""}`}
                  onClick={closeMobile}
                >
                  Cases
                </Link>
                <Link
                  to="/admin/alerts"
                  className={`${mobileRowClass} ${navActive("/admin/alerts") ? "bg-primary-navy/8 text-primary-navy ring-1 ring-secondary-navy/15" : ""}`}
                  onClick={closeMobile}
                >
                  Hearing alerts
                </Link>
                <Link
                  to="/admin/users"
                  className={`${mobileRowClass} ${navActive("/admin/users") ? "bg-primary-navy/8 text-primary-navy ring-1 ring-secondary-navy/15" : ""}`}
                  onClick={closeMobile}
                >
                  Users
                </Link>
              </>
            )}
            {user?.role === "CLIENT" && (
              <>
                <Link
                  to="/dashboard"
                  className={`${mobileRowClass} ${navActive("/dashboard") ? "bg-primary-navy/8 text-primary-navy ring-1 ring-secondary-navy/15" : ""}`}
                  onClick={closeMobile}
                >
                  Dashboard
                </Link>
                <Link
                  to="/cases"
                  className={`${mobileRowClass} ${navActive("/cases") ? "bg-primary-navy/8 text-primary-navy ring-1 ring-secondary-navy/15" : ""}`}
                  onClick={closeMobile}
                >
                  Cases
                </Link>
              </>
            )}
            <button
              type="button"
              className={`${mobileRowClass} w-full text-left text-text-light hover:text-secondary-navy`}
              onClick={() => {
                closeMobile();
                void logout().then(() => navigate("/login", { replace: true }));
              }}
            >
              Sign out
            </button>
          </nav>
        </div>
      )}

      <div
        className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-accent to-transparent"
        aria-hidden
      />
    </header>
  );
}
