import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const CasesListPage = lazy(() =>
  import("@/pages/CasesListPage").then((m) => ({ default: m.CasesListPage })),
);
const CaseCreatePage = lazy(() =>
  import("@/pages/CaseCreatePage").then((m) => ({ default: m.CaseCreatePage })),
);
const CaseDetailPage = lazy(() =>
  import("@/pages/CaseDetailPage").then((m) => ({ default: m.CaseDetailPage })),
);
const AdminAlertsPage = lazy(() =>
  import("@/pages/AdminAlertsPage").then((m) => ({ default: m.AdminAlertsPage })),
);
const AdminUsersPage = lazy(() =>
  import("@/pages/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })),
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        element={
          <ProtectedRoute>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cases" element={<CasesListPage />} />
        <Route path="/cases/new" element={<CaseCreatePage />} />
        <Route path="/cases/:caseId" element={<CaseDetailPage />} />
        <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/alerts" element={<AdminAlertsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
