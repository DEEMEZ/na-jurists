import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PortalFooter } from "./PortalFooter";
import { PortalHeader } from "./PortalHeader";

export function PortalLayout() {
  const { pathname } = useLocation();
  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <PortalHeader />
      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6">
        <div key={pathname} className="portal-page-enter">
          <Suspense
            fallback={
              <div className="flex min-h-[30vh] items-center justify-center text-text-light">
                Loading…
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
