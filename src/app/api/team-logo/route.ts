import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];

function parseSeasonStartYear(season: string) {
  const year = Number(season.split("-")[0]);

  return Number.isNaN(year) ? null : year;
}

function parseLogoFileRange(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  if (!VALID_EXTENSIONS.includes(extension)) return null;

  const baseName = fileName.replace(extension, "");

  const currentMatch = baseName.match(/^(\d{4})-current$/i);

  if (currentMatch) {
    return {
      start: Number(currentMatch[1]),
      end: Number.POSITIVE_INFINITY,
      fileName,
    };
  }

  const rangeMatch = baseName.match(/^(\d{4})-(\d{2}|\d{4})$/);

  if (!rangeMatch) return null;

  const start = Number(rangeMatch[1]);
  const rawEnd = rangeMatch[2];

  const end =
    rawEnd.length === 2
      ? Number(`${String(start).slice(0, 2)}${rawEnd}`)
      : Number(rawEnd);

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return {
    start,
    end,
    fileName,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const teamCode = String(searchParams.get("teamCode") || "")
    .trim()
    .toUpperCase();

  const season = String(searchParams.get("season") || "").trim();
  const seasonStartYear = parseSeasonStartYear(season);

  if (!teamCode || seasonStartYear === null) {
    return NextResponse.json({
      success: false,
      src: "/team-logos/NBI.png",
      error: "teamCode and season are required.",
    });
  }

  const teamLogoFolder = path.join(
    process.cwd(),
    "public",
    "team-logos",
    teamCode
  );

  try {
    const files = await fs.readdir(teamLogoFolder);

    const logoRanges = files
      .map(parseLogoFileRange)
      .filter(
        (
          logoRange
        ): logoRange is {
          start: number;
          end: number;
          fileName: string;
        } => logoRange !== null
      )
      .sort((a, b) => a.start - b.start);

    const matchingLogo = logoRanges.find((logoRange) => {
      return seasonStartYear >= logoRange.start && seasonStartYear < logoRange.end;
    });

    if (!matchingLogo) {
      return NextResponse.json({
        success: true,
        src: "/team-logos/NBI.png",
        teamCode,
        season,
        matched: false,
      });
    }

    return NextResponse.json({
      success: true,
      src: `/team-logos/${teamCode}/${matchingLogo.fileName}`,
      teamCode,
      season,
      matched: true,
      fileName: matchingLogo.fileName,
    });
  } catch {
    return NextResponse.json({
      success: true,
      src: "/team-logos/NBI.png",
      teamCode,
      season,
      matched: false,
    });
  }
}
