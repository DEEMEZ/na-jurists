import { NextResponse } from "next/server";
import { loadWebsiteTeamPayload } from "@/lib/websiteTeamData";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await loadWebsiteTeamPayload();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
    },
  });
}
