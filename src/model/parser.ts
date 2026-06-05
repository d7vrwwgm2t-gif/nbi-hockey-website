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
    const match = normalizedHeaders.find(
      (header) => header.normalized === normalizedAlias
    );
    if (match) return match.raw;
  }

  return null;
}

function normalizeDuplicateText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeDateOfBirth(value: string) {
  const trimmed = value.trim();

  const parsedDate = new Date(trimmed);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().slice(0, 10);
  }

  return trimmed
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[./]/g, "-");
}

function makeDuplicateKey(player: RawPlayerRow) {
  return `${normalizeDuplicateText(player.player)}|${normalizeDateOfBirth(
    player.dateOfBirth
  )}`;
}

function mergeDuplicatePlayers(players: RawPlayerRow[]) {
  const mergedPlayers = new Map<string, RawPlayerRow>();

  for (const player of players) {
    const key = makeDuplicateKey(player);
    const existing = mergedPlayers.get(key);

    if (!existing) {
      mergedPlayers.set(key, {
        ...player,
        stats: { ...player.stats },
      });
      continue;
    }

    const existingGp = existing.gamesPlayed || 0;
    const incomingGp = player.gamesPlayed || 0;
    const totalGp = existingGp + incomingGp;

    existing.gamesPlayed = totalGp;

    // Keep the original uploaded team unless it was blank.
    if (!existing.team && player.team) {
      existing.team = player.team;
    }

    // Keep the original position unless it was blank.
    if (!existing.position && player.position) {
      existing.position = player.position;
    }

    for (const [statKey, incomingValue] of Object.entries(player.stats)) {
      const existingValue = existing.stats[statKey];

      if (incomingValue === null || incomingValue === undefined) {
        continue;
      }

      if (existingValue === null || existingValue === undefined) {
        existing.stats[statKey] = incomingValue;
        continue;
      }

      const isPercentageStat =
        statKey.toLowerCase().includes("pct") ||
        statKey.toLowerCase().includes("percentage") ||
        statKey.toLowerCase().includes("accuracy");

      if (isPercentageStat) {
        if (totalGp === 0) {
          existing.stats[statKey] = incomingValue;
          continue;
        }

        existing.stats[statKey] =
          (existingValue * existingGp + incomingValue * incomingGp) / totalGp;

        continue;
      }

      existing.stats[statKey] = existingValue + incomingValue;
    }
  }

  return Array.from(mergedPlayers.values());
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

  const rawPlayers: RawPlayerRow[] = rows
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

  const players = mergeDuplicatePlayers(rawPlayers);

  return {
    league,
    season,
    situation,
    players,
    columnsFound: headers,
    missingAliases,
  };
}