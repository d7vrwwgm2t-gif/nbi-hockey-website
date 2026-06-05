import { NextResponse } from "next/server";
import { listModelSeasons } from "@/lib/modelStorage";

export const runtime = "nodejs";

export async function GET() {
  const seasons = await listModelSeasons();

  return NextResponse.json({
    success: true,
    seasons,
  });
}
