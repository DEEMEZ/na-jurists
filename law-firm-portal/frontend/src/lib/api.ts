export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

if (import.meta.env.PROD && typeof window !== "undefined") {
  const host = window.location.hostname;
  if (
    host &&
    host !== "localhost" &&
    host !== "127.0.0.1" &&
    /localhost|127\.0\.0\.1/i.test(API_BASE_URL)
  ) {
    console.error(
      "[law-firm-portal] This build calls localhost for the API. In Vercel → Environment Variables, set VITE_API_URL for Preview and Production to your public API HTTPS URL, then redeploy.",
    );
  }
}

const ACCESS_KEY = "law_firm_portal_access";
const REFRESH_KEY = "law_firm_portal_refresh";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "CLIENT";
};

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getStoredRefreshToken();
  if (!refresh) return false;
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return false;
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  isRetry = false,
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getStoredAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401 && !isRetry && path !== "/auth/refresh") {
    const ok = await tryRefresh();
    if (ok) {
      return apiFetch(path, init, true);
    }
  }

  return res;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const err = data as { error?: unknown } | null;
    let message = `Request failed (${res.status})`;
    if (typeof err?.error === "string") message = err.error;
    else if (err?.error && typeof err.error === "object")
      message = JSON.stringify(err.error);
    throw new Error(message);
  }
  return data as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Download failed (${res.status})`);
  }
  return res.blob();
}
