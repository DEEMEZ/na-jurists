import type { ReactNode } from "react";
import { PortalLogo } from "@/components/brand/PortalLogo";

type AuthShellProps = {
  children: ReactNode;
  /** e.g. “Back to sign in” link */
  headerRight?: ReactNode;
};

/**
 * Shared auth layout: split hero panel (desktop) + elevated card with entrance motion.
 */
export function AuthShell({ children, headerRight }: AuthShellProps) {
  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <header className="portal-header-auth border-b border-border-subtle bg-background-white/90 shadow-sm backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <PortalLogo />
          {headerRight ?? <span className="w-20 sm:w-24" aria-hidden />}
        </div>
        <div
          className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold-accent to-transparent"
          aria-hidden
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          className="portal-auth-hero relative hidden min-h-[200px] flex-col justify-end overflow-hidden bg-gradient-to-br from-primary-navy via-secondary-navy to-[#1e3048] px-10 py-12 text-white lg:flex lg:w-[42%] lg:min-h-0 lg:justify-center lg:py-16"
          aria-hidden
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
            <div
              className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold-accent/30 blur-3xl"
              style={{ animation: "portal-float 14s ease-in-out infinite" }}
            />
            <div
              className="absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-accent-blue/25 blur-3xl"
              style={{ animation: "portal-float 18s ease-in-out infinite reverse" }}
            />
          </div>
          <div className="relative z-10 max-w-md space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-accent/90">
              Secure client access
            </p>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white">
              Your matters, hearings, and documents — in one place.
            </h2>
            <p className="text-sm leading-relaxed text-white/75">
              N&amp;A Jurists — Advocates, Corporate &amp; Legal Consultants.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-16">
          <div className="portal-auth-card w-full max-w-md rounded-2xl border border-border-subtle/80 bg-background-white/95 p-8 shadow-[0_25px_50px_-12px_rgba(26,43,61,0.15)] backdrop-blur-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
