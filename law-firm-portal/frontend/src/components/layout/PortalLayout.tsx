import { Outlet } from "react-router-dom";
import { PortalFooter } from "./PortalFooter";
import { PortalHeader } from "./PortalHeader";

export function PortalLayout() {
  return (
    <div className="portal-shell flex min-h-screen flex-col">
      <PortalHeader />
      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <PortalFooter />
    </div>
  );
}
