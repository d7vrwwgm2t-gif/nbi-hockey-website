import { NextResponse } from "next/server";
import { listMoneyPuckSeasons } from "@/lib/moneyPuckStorage";

export const runtime = "nodejs";

export async function GET() {
  const seasons = await listMoneyPuckSeasons();

  return NextResponse.json({
    success: true,
    seasons,
  });
}
