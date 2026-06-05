import { NextResponse } from "next/server";
import { parseInStatWorkbook } from "@/model/parser";
import { runModelForSeason } from "@/model/modelRunner";
import { saveModelSeason, type SeasonBannerSlot } from "@/lib/modelStorage";

export const runtime = "nodejs";

async function getRequiredFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File)) {
    throw new Error(`Missing required file: ${key}`);
  }

  return value;
}

async function fileToArrayBuffer(file: File) {
  return await file.arrayBuffer();
}

function getBannerSlot(value: FormDataEntryValue | null): SeasonBannerSlot {
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const league = String(formData.get("league") || "NHL").trim();
    const season = String(formData.get("season") || "").trim();
    const displayLabel = String(formData.get("displayLabel") || season).trim();
    const bannerSlot = getBannerSlot(formData.get("bannerSlot"));

    if (!season) {
      return NextResponse.json(
        { success: false, error: "Season is required." },
        { status: 400 }
      );
    }

    const allSituationsFile = await getRequiredFile(formData, "allSituations");
    const powerPlayFile = await getRequiredFile(formData, "powerPlay");
    const penaltyKillFile = await getRequiredFile(formData, "penaltyKill");

    const allSituations = await parseInStatWorkbook({
      file: await fileToArrayBuffer(allSituationsFile),
      league,
      season,
      situation: "all",
    });

    const powerPlay = await parseInStatWorkbook({
      file: await fileToArrayBuffer(powerPlayFile),
      league,
      season,
      situation: "pp",
    });

    const penaltyKill = await parseInStatWorkbook({
      file: await fileToArrayBuffer(penaltyKillFile),
      league,
      season,
      situation: "pk",
    });

    const grades = runModelForSeason({
      allSituations,
      powerPlay,
      penaltyKill,
    });

    const storedSeason = await saveModelSeason({
      league,
      season,
      grades,
      metadata: {
        displayLabel,
        bannerSlot,
        sortOrder: getDefaultSortOrder(bannerSlot),
        isVisible: bannerSlot !== "archive",
      },
    });

    return NextResponse.json({
      success: true,
      league: storedSeason.league,
      season: storedSeason.season,
      metadata: storedSeason.metadata,
      playerCount: storedSeason.playerCount,
      generatedAt: storedSeason.generatedAt,
      aliasAudit: {
        allSituations: allSituations.missingAliases,
        powerPlay: powerPlay.missingAliases,
        penaltyKill: penaltyKill.missingAliases,
      },
    });
  } catch (error) {
    console.error("Model upload failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown model upload error.",
      },
      { status: 500 }
    );
  }
}
