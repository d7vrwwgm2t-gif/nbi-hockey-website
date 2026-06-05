import * as XLSX from "xlsx";
import { REQUIRED_ID_COLUMNS, STAT_COLUMN_ALIASES } from "./columnAliases";
import type { GameSituation, ParsedDataset, RawPlayerRow } from "./types";
import { normalizeHeader, parseNumber } from "./utils";

function findColumn(headers: string[], aliases: string[]) {
  const normalizedHeaders = headers.map((header) => ({
    raw: header,
    normalized: normalizeHeader(header),
  }));

  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const match = normalizedHeaders.find((header) => header.normalized === normalizedAlias);
    if (match) return match.raw;
  }

  return null;
}

export async function parseInStatWorkbook({
  file,
  league,
  season,
  situation,
}: {
  file: ArrayBuffer;
  league: string;
  season: string;
  situation: GameSituation;
}): Promise<ParsedDataset> {
  const workbook = XLSX.read(file, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (rows.length === 0) {
    return {
      league,
      season,
      situation,
      players: [],
      columnsFound: [],
      missingAliases: ["No rows found"],
    };
  }

  const headers = Object.keys(rows[0]);

  const idColumns = {
    player: findColumn(headers, REQUIRED_ID_COLUMNS.player),
    dateOfBirth: findColumn(headers, REQUIRED_ID_COLUMNS.dateOfBirth),
    team: findColumn(headers, REQUIRED_ID_COLUMNS.team),
    position: findColumn(headers, REQUIRED_ID_COLUMNS.position),
    gamesPlayed: findColumn(headers, REQUIRED_ID_COLUMNS.gamesPlayed),
  };

  const missingAliases: string[] = [];

  Object.entries(idColumns).forEach(([key, value]) => {
    if (!value) missingAliases.push(`Missing required column: ${key}`);
  });

  const statColumns = Object.fromEntries(
    Object.entries(STAT_COLUMN_ALIASES).map(([key, aliases]) => {
      const column = findColumn(headers, aliases);
      if (!column) missingAliases.push(`Missing stat alias: ${key}`);
      return [key, column];
    })
  ) as Record<string, string | null>;

  const players: RawPlayerRow[] = rows
    .map((row) => {
      const stats = Object.fromEntries(
        Object.entries(statColumns).map(([key, column]) => [
          key,
          column ? parseNumber(row[column]) : null,
        ])
      );

      return {
        player: String(row[idColumns.player ?? ""] ?? "").trim(),
        dateOfBirth: String(row[idColumns.dateOfBirth ?? ""] ?? "").trim(),
        team: String(row[idColumns.team ?? ""] ?? "").trim(),
        position: String(row[idColumns.position ?? ""] ?? "").trim(),
        gamesPlayed: parseNumber(row[idColumns.gamesPlayed ?? ""]) ?? 0,
        stats,
      };
    })
    .filter((player) => player.player && player.dateOfBirth);

  return {
    league,
    season,
    situation,
    players,
    columnsFound: headers,
    missingAliases,
  };
}
