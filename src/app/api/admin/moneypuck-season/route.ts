import { NextResponse } from "next/server";
import { deleteMoneyPuckSeason } from "@/lib/moneyPuckStorage";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const season = String(body.season || "").trim();

    if (!season) {
      return NextResponse.json(
        { success: false, error: "season is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteMoneyPuckSeason(season);

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
