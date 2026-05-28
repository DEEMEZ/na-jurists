import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { invalidatePortalProfileCache } from "@/lib/portalApi";
import { withPortalLoading } from "@/lib/portalLoadingBus";
import { getSupabase } from "@/lib/supabaseClient";
import type { AuthUser } from "@/lib/api";

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

  const loadProfile = useCallback(async () => {
    const sb = getSupabase();
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session?.user) {
      setUser(null);
      return;
    }
    const { data: p, error } = await sb
      .from("profiles")
      .select("id, email, role, disabled")
      .eq("id", session.user.id)
      .single();
    if (error || !p || p.disabled) {
      await sb.auth.signOut();
      setUser(null);
      return;
    }
    const next: AuthUser = {
      id: p.id,
      email: p.email,
      role: p.role as "ADMIN" | "CLIENT",
    };
    // Avoid new object identity on silent token refresh → stops /cases re-fetch loops.
    setUser((prev) =>
      prev &&
      prev.id === next.id &&
      prev.email === next.email &&
      prev.role === next.role
        ? prev
        : next,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadProfile();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    const sb = getSupabase();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event) => {
      // TOKEN_REFRESHED fires often; profile row does not change — skip to avoid re-renders + refetch loops.
      if (event === "TOKEN_REFRESHED") return;
      void loadProfile();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    await withPortalLoading(async () => {
      const sb = getSupabase();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      await loadProfile();
    });
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await withPortalLoading(async () => {
      await getSupabase().auth.signOut();
      invalidatePortalProfileCache();
      setUser(null);
    });
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
