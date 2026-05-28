import { NextResponse } from "next/server";
import { loadLiquidationOrgs } from "@/lib/newsAlertsData";

export const dynamic = "force-dynamic";

export async function GET() {
  const orgs = await loadLiquidationOrgs();
  return NextResponse.json(
    { data: orgs },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
