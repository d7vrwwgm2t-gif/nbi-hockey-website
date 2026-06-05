import { NextResponse } from "next/server";
import { shiftSeasonBannerSlots } from "@/lib/modelStorage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const league = String(body.league || "NHL").trim();

    const updated = await shiftSeasonBannerSlots({ league });

    return NextResponse.json({
      success: true,
      league,
      updated,
      message:
        "Season labels shifted. Current became Last Season, Last Season became Two Years Ago, and Two Years Ago was archived.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown season shift error.",
      },
      { status: 500 }
    );
  }
}
