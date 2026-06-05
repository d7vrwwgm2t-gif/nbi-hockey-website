import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import {
  saveMoneyPuckDataset,
  type MoneyPuckDatasetType,
  type MoneyPuckRow,
} from "@/lib/moneyPuckStorage";

export const runtime = "nodejs";

function getDatasetType(value: FormDataEntryValue | null): MoneyPuckDatasetType {
  const normalized = String(value || "").trim();

  if (normalized === "skaters" || normalized === "goalies" || normalized === "teams") {
    return normalized;
  }

  throw new Error("Invalid dataset type.");
}

async function getRequiredFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File)) {
    throw new Error(`Missing required file: ${key}`);
  }

  return value;
}

function normalizeValue(value: unknown): string | number | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") return value;

  const asString = String(value).trim();

  if (asString === "") return null;

  const asNumber = Number(asString);

  if (!Number.isNaN(asNumber) && asString !== "") {
    return asNumber;
  }

  return asString;
}

function parseCsv(buffer: ArrayBuffer): MoneyPuckRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  return XLSX.utils
    .sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
    })
    .map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, normalizeValue(value)])
      );
    });
}

function getString(row: MoneyPuckRow, key: string) {
  const value = row[key];

  if (value === null || value === undefined) return "";

  return String(value).trim();
}

function getNumber(row: MoneyPuckRow, key: string) {
  const value = row[key];

  if (typeof value === "number") return value;

  if (value === null || value === undefined) return 0;

  const parsed = Number(value);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function cleanRowsForDataset({
  rows,
  datasetType,
}: {
  rows: MoneyPuckRow[];
  datasetType: MoneyPuckDatasetType;
}) {
  if (datasetType === "skaters") {
    return rows.filter((row) => {
      const situation = getString(row, "situation").toLowerCase();
      const gamesPlayed = getNumber(row, "games_played");

      return situation === "all" && gamesPlayed >= 10;
    });
  }

  if (datasetType === "goalies") {
    return rows.filter((row) => {
      const situation = getString(row, "situation").toLowerCase();
      const gamesPlayed = getNumber(row, "games_played");

      return situation === "all" && gamesPlayed >= 10;
    });
  }

  if (datasetType === "teams") {
    return rows.filter((row) => {
      const situation = getString(row, "situation").toLowerCase();

      return situation === "all";
    });
  }

  return rows;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const season = String(formData.get("season") || "").trim();
    const displayLabel = String(formData.get("displayLabel") || season).trim();
    const datasetType = getDatasetType(formData.get("datasetType"));
    const file = await getRequiredFile(formData, "file");

    if (!season) {
      return NextResponse.json(
        { success: false, error: "Season is required." },
        { status: 400 }
      );
    }

    const rows = parseCsv(await file.arrayBuffer());
    const cleanedRows = cleanRowsForDataset({
      rows,
      datasetType,
    });

    const metadata = await saveMoneyPuckDataset({
      season,
      displayLabel,
      datasetType,
      rows: cleanedRows,
    });

    return NextResponse.json({
      success: true,
      season,
      displayLabel,
      datasetType,
      rawRowCount: rows.length,
      savedRowCount: cleanedRows.length,
      metadata,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown MoneyPuck upload error.",
      },
      { status: 500 }
    );
  }
}
