import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ConfirmDialogProvider } from "./components/ui/ConfirmDialogProvider";
import { PortalLoadingProvider } from "./components/ui/PortalLoadingProvider";
import { ToastProvider } from "./components/ui/ToastProvider";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter
      basename={import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL}
    >
      <AuthProvider>
        <PortalLoadingProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <App />
            </ConfirmDialogProvider>
          </ToastProvider>
        </PortalLoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
