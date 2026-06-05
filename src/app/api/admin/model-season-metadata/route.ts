import { NextResponse } from "next/server";
import {
  updateSeasonMetadata,
  type SeasonBannerSlot,
} from "@/lib/modelStorage";

export const runtime = "nodejs";

function getBannerSlot(value: unknown): SeasonBannerSlot {
  const normalized = String(value || "archive");

  if (
    normalized === "current" ||
    normalized === "lastYear" ||
    normalized === "twoYearsAgo" ||
    normalized === "archive"
  ) {
    return normalized;
  }

  return "archive";
}

function getDefaultSortOrder(slot: SeasonBannerSlot) {
  if (slot === "current") return 1;
  if (slot === "lastYear") return 2;
  if (slot === "twoYearsAgo") return 3;
  return 999;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const league = String(body.league || "").trim();
    const season = String(body.season || "").trim();

    if (!league || !season) {
      return NextResponse.json(
        { success: false, error: "league and season are required." },
        { status: 400 }
      );
    }

    const bannerSlot = getBannerSlot(body.bannerSlot);

    const metadata = await updateSeasonMetadata({
      league,
      season,
      metadata: {
        displayLabel: String(body.displayLabel || season).trim(),
        bannerSlot,
        sortOrder:
          typeof body.sortOrder === "number"
            ? body.sortOrder
            : getDefaultSortOrder(bannerSlot),
        isVisible:
          typeof body.isVisible === "boolean"
            ? body.isVisible
            : bannerSlot !== "archive",
      },
    });

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown metadata update error.",
      },
      { status: 500 }
    );
  }
}
