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
import { getSupabase } from "@/lib/supabaseClient";
import type { AuthUser } from "@/lib/api";

type AuthState = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Creates a client account (Supabase Auth + profile trigger). Returns whether the user must confirm email before sign-in. */
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
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
    const sb = getSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    await loadProfile();
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    const origin = window.location.origin.replace(/\/$/, "");
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/login`,
      },
    });
    if (error) throw new Error(error.message);
    const needsEmailConfirmation = !data.session;
    // Always end on sign-in UX: Supabase may return a session when "Confirm email" is off — sign out so the portal does not open automatically.
    if (data.session) {
      await sb.auth.signOut();
      invalidatePortalProfileCache();
      setUser(null);
    }
    return { needsEmailConfirmation };
  }, []);

  const logout = useCallback(async () => {
    await getSupabase().auth.signOut();
    invalidatePortalProfileCache();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      signUp,
      logout,
    }),
    [user, ready, login, signUp, logout],
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
