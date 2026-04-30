import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CasesListPage } from "@/pages/CasesListPage";
import { CaseCreatePage } from "@/pages/CaseCreatePage";
import { CaseDetailPage } from "@/pages/CaseDetailPage";
import { AdminAlertsPage } from "@/pages/AdminAlertsPage";
import { AdminHearingsPage } from "@/pages/AdminHearingsPage";
import { AdminClientMessagesPage } from "@/pages/AdminClientMessagesPage";
import { AdminReportedJudgmentsPage } from "@/pages/AdminReportedJudgmentsPage";
import { AdminWebsiteTeamPage } from "@/pages/AdminWebsiteTeamPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";
import { ClientNotificationsPage } from "@/pages/ClientNotificationsPage";
import { ClientHearingsPage } from "@/pages/ClientHearingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/account/password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
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
        <Route path="/notifications" element={<ClientNotificationsPage />} />
        <Route path="/hearings" element={<ClientHearingsPage />} />
        <Route path="/admin/hearings" element={<AdminHearingsPage />} />
        <Route path="/admin/messages" element={<AdminClientMessagesPage />} />
        <Route path="/admin/alerts" element={<AdminAlertsPage />} />
        <Route path="/admin/website-team" element={<AdminWebsiteTeamPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/reported-judgments" element={<AdminReportedJudgmentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
