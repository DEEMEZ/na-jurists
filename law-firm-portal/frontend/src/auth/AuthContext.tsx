import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  API_BASE_URL,
  apiFetch,
  apiJson,
  clearTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setTokens,
  type AuthUser,
} from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const loadMe = useCallback(async () => {
    const data = await apiJson<{ user: AuthUser }>("/auth/me");
    setUser(data.user);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getStoredAccessToken()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        await loadMe();
      } catch {
        setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as {
      accessToken?: string;
      refreshToken?: string;
      user?: AuthUser;
      error?: unknown;
    };
    if (!res.ok) {
      const msg =
        typeof data.error === "string" ? data.error : "Sign in failed";
      throw new Error(msg);
    }
    if (!data.accessToken || !data.refreshToken || !data.user) {
      throw new Error("Invalid response from server");
    }
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const rt = getStoredRefreshToken();
    if (rt) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: rt }),
        });
      } catch {
        /* ignore */
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
    }),
    [user, ready, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
