import { NextResponse } from "next/server";
import { deleteModelSeason } from "@/lib/modelStorage";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
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

    const deleted = await deleteModelSeason({
      league,
      season,
    });

    return NextResponse.json({
      success: true,
      ...deleted,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown delete season error.",
      },
      { status: 500 }
    );
  }
}