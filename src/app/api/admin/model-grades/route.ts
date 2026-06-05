import { NextResponse } from "next/server";
import { loadModelSeason } from "@/lib/modelStorage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const league = searchParams.get("league");
  const season = searchParams.get("season");

  if (!league || !season) {
    return NextResponse.json(
      { success: false, error: "league and season are required." },
      { status: 400 }
    );
  }

  try {
    const storedSeason = await loadModelSeason({
      league,
      season,
    });

    return NextResponse.json({
      success: true,
      ...storedSeason,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Could not find model output for that league and season.",
      },
      { status: 404 }
    );
  }
}
