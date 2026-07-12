export type PowerRankingTeam = {
  abbreviation: string;
  name: string;
  logoPath: string;
  order: number;
};

export type PowerRankingTier = {
  name: string;
  order: number;
  teams: PowerRankingTeam[];
};

export type PowerRankingSettings = {
  title: string;
  subtitle: string;
  updatedDate: string;
  description: string;
};

export type PowerRankingsData = {
  settings: PowerRankingSettings;
  tiers: PowerRankingTier[];
};

type RankingRow = {
  tier: string;
  abbreviation: string;
  order: number;
  tierOrder: number;
};

const GOOGLE_SHEET_ID =
  "1pUSpROCy6Ey0Af4pWk2YTFeIEv1tVeU_d6IpxhcAEv8";

const TEAM_NAMES: Record<string, string> = {
  ANA: "Anaheim Ducks",
  BOS: "Boston Bruins",
  BUF: "Buffalo Sabres",
  CGY: "Calgary Flames",
  CAR: "Carolina Hurricanes",
  CBJ: "Columbus Blue Jackets",
  CHI: "Chicago Blackhawks",
  COL: "Colorado Avalanche",
  DAL: "Dallas Stars",
  DET: "Detroit Red Wings",
  EDM: "Edmonton Oilers",
  FLA: "Florida Panthers",
  LAK: "Los Angeles Kings",
  MIN: "Minnesota Wild",
  MTL: "Montreal Canadiens",
  NJD: "New Jersey Devils",
  NSH: "Nashville Predators",
  NYI: "New York Islanders",
  NYR: "New York Rangers",
  OTT: "Ottawa Senators",
  PHI: "Philadelphia Flyers",
  PIT: "Pittsburgh Penguins",
  SEA: "Seattle Kraken",
  SJS: "San Jose Sharks",
  STL: "St. Louis Blues",
  TBL: "Tampa Bay Lightning",
  TOR: "Toronto Maple Leafs",
  UTA: "Utah Mammoth",
  VAN: "Vancouver Canucks",
  VGK: "Vegas Golden Knights",
  WPG: "Winnipeg Jets",
  WSH: "Washington Capitals",
};

const DEFAULT_SETTINGS: PowerRankingSettings = {
  title: "NBI Hockey Power Rankings",
  subtitle: "",
  updatedDate: "",
  description: "My current NHL team power rankings.",
};

function getSheetCsvUrl(sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    sheetName,
  )}`;
}

function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (
      (character === "\n" || character === "\r") &&
      !insideQuotes
    ) {
      row.push(cell.trim());

      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }

      row = [];
      cell = "";

      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      continue;
    }

    cell += character;
  }

  row.push(cell.trim());

  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

async function fetchSheet(sheetName: string): Promise<string[][]> {
  const response = await fetch(getSheetCsvUrl(sheetName), {
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(`Could not load the ${sheetName} sheet.`);
  }

  return parseCsv(await response.text());
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseNumber(value: string, fallback: number): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

async function getRankingRows(): Promise<RankingRow[]> {
  const rows = await fetchSheet("Rankings");

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(normalizeHeader);

  const tierIndex = headers.indexOf("tier");
  const teamIndex = headers.indexOf("team");
  const orderIndex = headers.indexOf("order");
  const tierOrderIndex = headers.indexOf("tierorder");

  if (
    tierIndex === -1 ||
    teamIndex === -1 ||
    orderIndex === -1 ||
    tierOrderIndex === -1
  ) {
    throw new Error(
      "The Rankings sheet must contain Tier, Team, Order, and Tier Order columns.",
    );
  }

  return rows
    .slice(1)
    .map((row, rowIndex) => {
      const tier = row[tierIndex]?.trim() ?? "";
      const abbreviation =
        row[teamIndex]?.trim().toUpperCase() ?? "";

      if (!tier || !abbreviation) {
        return null;
      }

      return {
        tier,
        abbreviation,
        order: parseNumber(row[orderIndex] ?? "", rowIndex + 1),
        tierOrder: parseNumber(
          row[tierOrderIndex] ?? "",
          rowIndex + 1,
        ),
      };
    })
    .filter((row): row is RankingRow => row !== null);
}

async function getSettings(): Promise<PowerRankingSettings> {
  try {
    const rows = await fetchSheet("Settings");
    const settings = new Map<string, string>();

    for (const row of rows.slice(1)) {
      const key = normalizeHeader(row[0] ?? "");
      const value = row[1]?.trim() ?? "";

      if (key) {
        settings.set(key, value);
      }
    }

    return {
      title: settings.get("title") || DEFAULT_SETTINGS.title,
      subtitle:
        settings.get("subtitle") || DEFAULT_SETTINGS.subtitle,
      updatedDate:
        settings.get("updateddate") ||
        DEFAULT_SETTINGS.updatedDate,
      description:
        settings.get("description") ||
        DEFAULT_SETTINGS.description,
    };
  } catch (error) {
    console.error("Could not load power rankings settings:", error);

    return DEFAULT_SETTINGS;
  }
}

function buildTiers(rows: RankingRow[]): PowerRankingTier[] {
  const tiers = new Map<string, PowerRankingTier>();
  const usedTeams = new Set<string>();

  for (const row of rows) {
    if (usedTeams.has(row.abbreviation)) {
      console.warn(
        `Duplicate power rankings team ignored: ${row.abbreviation}`,
      );
      continue;
    }

    usedTeams.add(row.abbreviation);

    const team: PowerRankingTeam = {
      abbreviation: row.abbreviation,
      name: TEAM_NAMES[row.abbreviation] ?? row.abbreviation,
      logoPath: `/team-logos/${row.abbreviation}.png`,
      order: row.order,
    };

    const existingTier = tiers.get(row.tier);

    if (existingTier) {
      existingTier.order = Math.min(
        existingTier.order,
        row.tierOrder,
      );
      existingTier.teams.push(team);
      continue;
    }

    tiers.set(row.tier, {
      name: row.tier,
      order: row.tierOrder,
      teams: [team],
    });
  }

  return Array.from(tiers.values())
    .map((tier) => ({
      ...tier,
      teams: [...tier.teams].sort(
        (firstTeam, secondTeam) =>
          firstTeam.order - secondTeam.order,
      ),
    }))
    .sort(
      (firstTier, secondTier) =>
        firstTier.order - secondTier.order,
    );
}

export async function getPowerRankings(): Promise<PowerRankingsData> {
  const [rankingRows, settings] = await Promise.all([
    getRankingRows(),
    getSettings(),
  ]);

  return {
    settings,
    tiers: buildTiers(rankingRows),
  };
}