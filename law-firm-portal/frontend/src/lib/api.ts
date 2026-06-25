import {
  downloadCaseDocumentBlob,
  getCaseDocumentSignedUrl,
  portalApiJson,
  portalApiUpload,
  prefetchCaseDocumentSignedUrls,
  type AuthUser,
} from "./portalApi";

export type { AuthUser };

export const API_BASE_URL = "";

export function getStoredAccessToken(): string | null {
  return null;
}

export function getStoredRefreshToken(): string | null {
  return null;
}

export function setTokens(_access: string, _refresh: string): void {}

export function clearTokens(): void {}

function parseJsonBody(init?: RequestInit): unknown {
  if (!init?.body || typeof init.body !== "string") return undefined;
  try {
    return JSON.parse(init.body) as unknown;
  } catch {
    return undefined;
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? "GET";
  const body = parseJsonBody(init);
  const data = await portalApiJson(method, path, body);
  return data as T;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? "GET";
  if (init?.body instanceof FormData) {
    const m = path.match(/^\/api\/v1\/admin\/cases\/([^/]+)\/documents$/);
    if (!m || method !== "POST") {
      return new Response(JSON.stringify({ error: "Unsupported upload path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const file = init.body.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), { status: 400 });
    }
    const vis = init.body.get("visibleToClient");
    const visibleToClient = vis !== "false";
    try {
      const result = await portalApiUpload(m[1], file, { visibleToClient });
      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  const body = parseJsonBody(init);
  try {
    const data = await portalApiJson(method, path, body);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    const status =
      msg === "Unauthorized" ? 401 : msg === "Forbidden" || msg.includes("Forbidden") ? 403 : 400;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function apiBlob(path: string): Promise<Blob> {
  const m = path.match(/^\/api\/v1\/cases\/([^/]+)\/documents\/([^/]+)\/file$/);
  if (!m) throw new Error("Invalid document path");
  return downloadCaseDocumentBlob(m[1], m[2]);
}

export async function apiOpenDocument(
  caseId: string,
  docId: string,
): Promise<{ url: string; fileName: string }> {
  return getCaseDocumentSignedUrl(caseId, docId);
}

export async function apiPrefetchCaseDocumentUrls(
  caseId: string,
  docIds: string[],
): Promise<Record<string, string>> {
  return prefetchCaseDocumentSignedUrls(caseId, docIds);
}

if (import.meta.env.PROD && typeof window !== "undefined") {
  const host = window.location.hostname;
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    const url = import.meta.env.VITE_SUPABASE_URL?.trim();
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
      console.error(
        "[law-firm-portal] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.production.",
      );
    }
  }
}
