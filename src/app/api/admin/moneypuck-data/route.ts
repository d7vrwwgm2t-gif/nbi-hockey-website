import { NextResponse } from "next/server";
import {
  loadMoneyPuckDataset,
  type MoneyPuckDatasetType,
} from "@/lib/moneyPuckStorage";

export const runtime = "nodejs";

function getDatasetType(value: string | null): MoneyPuckDatasetType {
  if (value === "skaters" || value === "goalies" || value === "teams") {
    return value;
  }

  throw new Error("Invalid dataset type.");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const season = searchParams.get("season");

  if (!season) {
    return NextResponse.json(
      { success: false, error: "season is required." },
      { status: 400 }
    );
  }

  try {
    const datasetType = getDatasetType(searchParams.get("datasetType"));
    const rows = await loadMoneyPuckDataset({
      season,
      datasetType,
    });

    return NextResponse.json({
      success: true,
      season,
      datasetType,
      count: rows.length,
      rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load MoneyPuck dataset.",
      },
      { status: 404 }
    );
  }
}
