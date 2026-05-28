import { NextRequest, NextResponse } from "next/server";
import { loadNewsAlerts } from "@/lib/newsAlertsData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const org = req.nextUrl.searchParams.get("organization") ?? undefined;
  const items = await loadNewsAlerts(org);
  return NextResponse.json(
    { data: items },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
