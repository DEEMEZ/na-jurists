import { NextRequest, NextResponse } from "next/server";
import { loadNewsAlertById } from "@/lib/newsAlertsData";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = await loadNewsAlertById(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(
    { data: item },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
