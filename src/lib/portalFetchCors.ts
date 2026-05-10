import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/** Origins allowed to call selected JSON APIs from the law firm portal (browser fetch). */
function allowedPortalOrigins(): Set<string> {
  const out = new Set<string>();
  if (process.env.NODE_ENV === 'development') {
    for (const p of [5173, 5174, 5175, 5176, 5177, 5178]) {
      out.add(`http://localhost:${p}`);
      out.add(`http://127.0.0.1:${p}`);
    }
  }
  const portal = process.env.NEXT_PUBLIC_PORTAL_URL?.trim();
  if (portal) {
    try {
      out.add(new URL(portal).origin);
    } catch {
      /* ignore invalid URL */
    }
  }
  const list = process.env.FRONTEND_ORIGIN?.split(',') ?? [];
  for (const raw of list) {
    const t = raw.trim();
    if (!t) continue;
    try {
      out.add(new URL(t).origin);
    } catch {
      /* ignore */
    }
  }
  return out;
}

export function withPortalFetchCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  if (origin && allowedPortalOrigins().has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.append('Vary', 'Origin');
  }
  return response;
}
