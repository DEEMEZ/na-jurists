import { NextResponse } from "next/server";
import { loadNewsAlerts } from "@/lib/newsAlertsData";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await loadNewsAlerts();
  return NextResponse.json(
    { data: items },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
