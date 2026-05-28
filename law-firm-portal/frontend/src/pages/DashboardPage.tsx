import {
  Briefcase,
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Scale,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { apiJson } from "@/lib/api";

type ClientDash = {
  /** All matters assigned to you (open + archived). */
  activeMatters: number;
  /** Non-archived assigned matters (optional on older API). */
  openMatters?: number;
  upcomingHearings30d: number;
  unreadNotifications: number;
  messagesFromFirm: number;
  nextHearings?: Array<{
    id: string;
    caseId: string;
    caseTitle: string;
    scheduledAt: string;
    venue: string | null;
  }>;
  recentFirmMessages?: Array<{
    id: string;
    caseId: string;
    caseTitle: string;
    body: string;
    createdAt: string;
  }>;
};

type AdminDash = {
  openCases: number;
  upcomingHearings30d: number;
  casesMissingUpcomingHearing: number;
  recentClientMessages: number;
};

export function DashboardPage() {
  const { user } = useAuth();
  const [clientStats, setClientStats] = useState<ClientDash | null>(null);
  const [adminStats, setAdminStats] = useState<AdminDash | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoadErr(null);
    const path =
      user.role === "ADMIN"
        ? "/api/v1/admin/dashboard"
        : "/api/v1/me/dashboard";
    apiJson<ClientDash | AdminDash>(path)
      .then((data) => {
        if (user.role === "ADMIN") setAdminStats(data as AdminDash);
        else setClientStats(data as ClientDash);
      })
      .catch((e: Error) => setLoadErr(e.message));
  }, [user?.id, user?.role]);

  const statItems = useMemo(() => {
    if (user?.role === "ADMIN" && adminStats) {
      return [
        {
          label: "Open matters",
          value: String(adminStats.openCases),
          sub: "Non-archived cases",
          icon: Briefcase,
          gradient: "from-[#1a2b3d] to-[#2c415e]",
          to: "/cases",
        },
        {
          label: "Upcoming hearings",
          value: String(adminStats.upcomingHearings30d),
          sub: "Next 30 days",
          icon: CalendarDays,
          gradient: "from-[#2c415e] to-[#4a6789]",
          to: "/admin/hearings",
        },
        {
          label: "Need hearing date",
          value: String(adminStats.casesMissingUpcomingHearing),
          sub: "Open matters, no future hearing",
          icon: MessageSquare,
          gradient: "from-[#4a6789] to-[#5a7a9b]",
          to: "/admin/alerts",
        },
        {
          label: "Client messages",
          value: String(adminStats.recentClientMessages),
          sub: "Last 7 days",
          icon: Mail,
          gradient: "from-[#5a7a9b] to-[#6b8bab]",
          to: "/admin/messages",
        },
      ];
    }
    if (user?.role === "CLIENT" && clientStats) {
      const open = clientStats.openMatters ?? clientStats.activeMatters;
      const archived =
        clientStats.openMatters !== undefined
          ? Math.max(0, clientStats.activeMatters - clientStats.openMatters)
          : 0;
      const mattersSub =
        clientStats.openMatters !== undefined
          ? archived > 0
            ? `${open} open · ${archived} archived`
            : `${open} open`
          : "Assigned to you";
      return [
        {
          label: "Your matters",
          value: String(clientStats.activeMatters),
          sub: mattersSub,
          icon: Briefcase,
          gradient: "from-[#1a2b3d] to-[#2c415e]",
          to: "/cases",
        },
        {
          label: "Upcoming hearings",
          value: String(clientStats.upcomingHearings30d),
          sub: "Next 30 days",
          icon: CalendarDays,
          gradient: "from-[#2c415e] to-[#4a6789]",
          to: "/hearings",
        },
        {
          label: "Unread notifications",
          value: String(clientStats.unreadNotifications),
          sub: "Status and matter alerts",
          icon: MessageSquare,
          gradient: "from-[#4a6789] to-[#5a7a9b]",
          to: "/notifications",
        },
      ];
    }
    const loadingAdmin = [
      {
        label: "Open matters",
        value: "—",
        sub: "Loading…",
        icon: Briefcase,
        gradient: "from-[#1a2b3d] to-[#2c415e]",
        to: "/cases",
      },
      {
        label: "Upcoming hearings",
        value: "—",
        sub: "Next 30 days",
        icon: CalendarDays,
        gradient: "from-[#2c415e] to-[#4a6789]",
        to: "/admin/hearings",
      },
      {
        label: "Need hearing date",
        value: "—",
        sub: "—",
        icon: MessageSquare,
        gradient: "from-[#4a6789] to-[#5a7a9b]",
        to: "/admin/alerts",
      },
      {
        label: "Client messages",
        value: "—",
        sub: "Last 7 days",
        icon: Mail,
        gradient: "from-[#5a7a9b] to-[#6b8bab]",
        to: "/admin/messages",
      },
    ];
    const loadingClient = [
      {
        label: "Your matters",
        value: "—",
        sub: "Loading…",
        icon: Briefcase,
        gradient: "from-[#1a2b3d] to-[#2c415e]",
      },
      {
        label: "Upcoming hearings",
        value: "—",
        sub: "Next 30 days",
        icon: CalendarDays,
        gradient: "from-[#2c415e] to-[#4a6789]",
      },
      {
        label: "Unread notifications",
        value: "—",
        sub: "—",
        icon: MessageSquare,
        gradient: "from-[#4a6789] to-[#5a7a9b]",
      },
    ];
    if (user?.role === "ADMIN") return loadingAdmin;
    if (user?.role === "CLIENT") return loadingClient;
    return loadingClient;
  }, [user?.role, adminStats, clientStats]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <section className="portal-dashboard-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-navy via-secondary-navy to-[#243652] px-6 py-8 text-background-white shadow-[0_20px_40px_-15px_rgba(26,43,61,0.35)] ring-1 ring-white/10 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-accent/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-accent-blue/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-white/70">
              {user?.role === "ADMIN" ? "Admin portal" : "Client portal"}
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              <LayoutDashboard
                className="h-8 w-8 shrink-0 text-gold-accent"
                strokeWidth={1.75}
              />
              Dashboard
            </h1>
            <div className="mt-3 h-0.5 max-w-xs bg-gradient-to-r from-gold-accent via-gold-accent/60 to-transparent" />
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
              Track matters, hearings, documents, and messages with N&amp;A
              Jurists — summary numbers update from live data.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <Scale className="h-10 w-10 text-gold-accent/90" strokeWidth={1.25} />
            <div className="text-left text-xs text-white/80">
              <p className="font-semibold text-white">Integrity &amp; excellence</p>
              <p>Your case updates, when you need them.</p>
            </div>
          </div>
        </div>
      </section>

      {loadErr && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Could not load dashboard stats: {loadErr}
        </div>
      )}

      <section className="flex flex-wrap gap-3">
        <Link
          to="/cases"
          className="portal-link-chip rounded-xl border border-border-subtle bg-background-white px-4 py-2.5 text-sm font-medium text-secondary-navy shadow-sm hover:bg-background-light"
        >
          Open cases
        </Link>
        {user?.role === "ADMIN" && (
          <>
            <Link
              to="/cases/new"
              className="portal-link-chip rounded-xl bg-primary-navy px-4 py-2.5 text-sm font-semibold text-background-white shadow-md hover:bg-secondary-navy hover:shadow-lg"
            >
              New case
            </Link>
            <Link
              to="/admin/alerts"
              className="portal-link-chip rounded-xl border border-border-subtle bg-background-white px-4 py-2.5 text-sm font-medium text-secondary-navy shadow-sm hover:bg-background-light"
            >
              Hearing alerts
            </Link>
            <Link
              to="/admin/reported-judgments"
              className="portal-link-chip rounded-xl border border-border-subtle bg-background-white px-4 py-2.5 text-sm font-medium text-secondary-navy shadow-sm hover:bg-background-light"
            >
              Judgments
            </Link>
            <Link
              to="/admin/website-team"
              className="portal-link-chip rounded-xl border border-border-subtle bg-background-white px-4 py-2.5 text-sm font-medium text-secondary-navy shadow-sm hover:bg-background-light"
            >
              Website team
            </Link>
            <Link
              to="/admin/users"
              className="portal-link-chip rounded-xl border border-border-subtle bg-background-white px-4 py-2.5 text-sm font-medium text-secondary-navy shadow-sm hover:bg-background-light"
            >
              Users
            </Link>
          </>
        )}
      </section>

      <section aria-label="Summary">
        <h2 className="sr-only">At a glance</h2>
        <div
          className={`grid gap-4 ${statItems.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}
        >
          {statItems.map((item, idx) => {
            const { label, value, sub, icon: Icon, gradient } = item;
            const to = "to" in item ? item.to : undefined;
            const inner = (
              <>
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-light">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-primary-navy">
                    {value}
                  </p>
                  <p className="mt-0.5 text-xs text-text-light">{sub}</p>
                </div>
              </>
            );
            const className =
              "portal-stagger-item portal-stat-tile group flex gap-4 rounded-xl border border-border-subtle/90 bg-background-white p-5 shadow-md" +
              (to ? " cursor-pointer transition-shadow hover:shadow-lg hover:ring-1 hover:ring-accent-blue/20" : "");
            return to ? (
              <Link
                key={label}
                to={to}
                className={className}
                style={{ animationDelay: `${idx * 55}ms` }}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={label}
                className={className}
                style={{ animationDelay: `${idx * 55}ms` }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {user?.role === "CLIENT" && clientStats && (clientStats.nextHearings?.length ?? 0) > 0 && (
        <section
          className="rounded-2xl border border-border-subtle/90 bg-background-white p-6 shadow-md"
          aria-label="Upcoming hearings"
        >
          <h2 className="text-lg font-semibold text-primary-navy">
            Your upcoming hearings
          </h2>
          <p className="mt-1 text-sm text-text-light">
            See all hearings on the hearings page; open a matter when you need documents or messages.
          </p>
          <ul className="mt-4 divide-y divide-border-subtle text-sm">
            {clientStats.nextHearings!.map((h) => (
              <li
                key={h.id}
                className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-text-dark">
                    {new Date(h.scheduledAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {h.venue ? ` · ${h.venue}` : ""}
                  </p>
                  <p className="text-text-light">{h.caseTitle}</p>
                </div>
                <Link
                  to="/hearings"
                  className="shrink-0 text-sm font-semibold text-accent-blue hover:underline"
                >
                  All hearings
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user?.role === "CLIENT" && clientStats && (clientStats.recentFirmMessages?.length ?? 0) > 0 && (
        <section
          className="rounded-2xl border border-border-subtle/90 bg-background-white p-6 shadow-md"
          aria-label="Messages from your legal team"
        >
          <h2 className="text-lg font-semibold text-primary-navy">
            Recent messages from your legal team
          </h2>
          <p className="mt-1 text-sm text-text-light">
            Open the matter to reply or see the full thread.
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {clientStats.recentFirmMessages!.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-border-subtle/80 bg-background-light/50 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-secondary-navy">{m.caseTitle}</span>
                  <span className="text-xs text-text-light">
                    {new Date(m.createdAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-text-dark">
                  {m.body}
                </p>
                {m.caseId ? (
                  <Link
                    to={`/cases/${m.caseId}`}
                    className="mt-2 inline-block text-sm font-semibold text-accent-blue hover:underline"
                  >
                    Open messages
                  </Link>
                ) : (
                  <Link
                    to="/cases"
                    className="mt-2 inline-block text-sm font-semibold text-accent-blue hover:underline"
                  >
                    Open messages
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {user?.role === "CLIENT" && clientStats && (
        <p className="text-sm text-text-light">
          Total messages from your legal team (all matters):{" "}
          <span className="font-semibold text-text-dark">
            {clientStats.messagesFromFirm}
          </span>
        </p>
      )}

      <section
        className={`grid gap-6 ${user?.role === "ADMIN" ? "lg:grid-cols-2" : ""}`}
        aria-label={user?.role === "ADMIN" ? "Cases and messages" : "Cases"}
      >
        <article className="portal-stat-tile relative overflow-hidden rounded-2xl border border-border-subtle/90 bg-background-white shadow-md hover:shadow-xl">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold-accent to-gold-accent/40" />
          <div className="p-6 pl-7 sm:p-8 sm:pl-9">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-navy/5 text-primary-navy ring-1 ring-primary-navy/10">
                <FolderOpen className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-primary-navy">
                  {user?.role === "ADMIN" ? "All cases" : "My cases"}
                </h2>
                <p className="mt-1 text-sm text-text-light">
                  Matter numbers, status, hearings, documents, and messages.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/cases"
                className="portal-link-chip inline-flex rounded-xl bg-primary-navy px-4 py-2.5 text-sm font-semibold text-background-white shadow-sm hover:bg-secondary-navy hover:shadow-md"
              >
                View cases
              </Link>
              {user?.role === "CLIENT" && (
                <Link
                  to="/hearings"
                  className="portal-link-chip inline-flex rounded-xl border border-border-subtle bg-background-white px-4 py-2.5 text-sm font-semibold text-secondary-navy shadow-sm hover:bg-background-light"
                >
                  Hearings
                </Link>
              )}
            </div>
          </div>
        </article>

        {user?.role === "ADMIN" && (
          <article className="portal-stat-tile relative overflow-hidden rounded-2xl border border-border-subtle/90 bg-background-white shadow-md hover:shadow-xl">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold-accent to-gold-accent/40" />
            <div className="p-6 pl-7 sm:p-8 sm:pl-9">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-navy/5 text-primary-navy ring-1 ring-primary-navy/10">
                  <Mail className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-primary-navy">
                    Client messages
                  </h2>
                  <p className="mt-1 text-sm text-text-light">
                    Threads with clients on their matters — reply from the portal.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  to="/admin/messages"
                  className="portal-link-chip inline-flex rounded-xl bg-primary-navy px-4 py-2.5 text-sm font-semibold text-background-white shadow-sm hover:bg-secondary-navy hover:shadow-md"
                >
                  Open messages
                </Link>
              </div>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
