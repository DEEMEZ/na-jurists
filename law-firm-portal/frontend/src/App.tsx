import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { CaseCreatePage } from "@/pages/CaseCreatePage";
import { CaseDetailPage } from "@/pages/CaseDetailPage";
import { CasesListPage } from "@/pages/CasesListPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { AdminAlertsPage } from "@/pages/AdminAlertsPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

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
