export type PlayerSlot = {
  name: string;
  position?: string;
};

export type SpecialTeamUnit = {
  unit: number;
  players: PlayerSlot[];
};

export type DepthChartTeam = {
  teamName: string;
  abbreviation: string;
  dailyFaceoffSlug: string;
  logoPath: string;
  updatedAt?: string;
  source?: string;
  debug?: string;
  forwards: {
    line: number;
    lw?: PlayerSlot;
    c?: PlayerSlot;
    rw?: PlayerSlot;
  }[];
  defense: {
    pair: number;
    ld?: PlayerSlot;
    rd?: PlayerSlot;
  }[];
  goalies: {
    starter?: PlayerSlot;
    backup?: PlayerSlot;
    extra?: PlayerSlot[];
  };
  powerPlay?: SpecialTeamUnit[];
  penaltyKill?: SpecialTeamUnit[];
  scratches?: PlayerSlot[];
  injuries?: PlayerSlot[];
};

const TEAM_SLUGS: Record<string, string> = {
  ANA: "anaheim-ducks",
  BOS: "boston-bruins",
  BUF: "buffalo-sabres",
  CAR: "carolina-hurricanes",
  CBJ: "columbus-blue-jackets",
  CGY: "calgary-flames",
  CHI: "chicago-blackhawks",
  COL: "colorado-avalanche",
  DAL: "dallas-stars",
  DET: "detroit-red-wings",
  EDM: "edmonton-oilers",
  FLA: "florida-panthers",
  LAK: "los-angeles-kings",
  MIN: "minnesota-wild",
  MTL: "montreal-canadiens",
  NJD: "new-jersey-devils",
  NSH: "nashville-predators",
  NYI: "new-york-islanders",
  NYR: "new-york-rangers",
  OTT: "ottawa-senators",
  PHI: "philadelphia-flyers",
  PIT: "pittsburgh-penguins",
  SEA: "seattle-kraken",
  SJS: "san-jose-sharks",
  STL: "st-louis-blues",
  TBL: "tampa-bay-lightning",
  TOR: "toronto-maple-leafs",
  UTA: "utah-mammoth",
  VAN: "vancouver-canucks",
  VGK: "vegas-golden-knights",
  WSH: "washington-capitals",
  WPG: "winnipeg-jets",
};

const TEAMS = [
  { teamName: "Anaheim Ducks", abbreviation: "ANA", dailyFaceoffSlug: TEAM_SLUGS.ANA, logoPath: "/team-logos/ANA.png" },
  { teamName: "Boston Bruins", abbreviation: "BOS", dailyFaceoffSlug: TEAM_SLUGS.BOS, logoPath: "/team-logos/BOS.png" },
  { teamName: "Buffalo Sabres", abbreviation: "BUF", dailyFaceoffSlug: TEAM_SLUGS.BUF, logoPath: "/team-logos/BUF.png" },
  { teamName: "Calgary Flames", abbreviation: "CGY", dailyFaceoffSlug: TEAM_SLUGS.CGY, logoPath: "/team-logos/CGY.png" },
  { teamName: "Carolina Hurricanes", abbreviation: "CAR", dailyFaceoffSlug: TEAM_SLUGS.CAR, logoPath: "/team-logos/CAR.png" },
  { teamName: "Chicago Blackhawks", abbreviation: "CHI", dailyFaceoffSlug: TEAM_SLUGS.CHI, logoPath: "/team-logos/CHI.png" },
  { teamName: "Colorado Avalanche", abbreviation: "COL", dailyFaceoffSlug: TEAM_SLUGS.COL, logoPath: "/team-logos/COL.png" },
  { teamName: "Columbus Blue Jackets", abbreviation: "CBJ", dailyFaceoffSlug: TEAM_SLUGS.CBJ, logoPath: "/team-logos/CBJ.png" },
  { teamName: "Dallas Stars", abbreviation: "DAL", dailyFaceoffSlug: TEAM_SLUGS.DAL, logoPath: "/team-logos/DAL.png" },
  { teamName: "Detroit Red Wings", abbreviation: "DET", dailyFaceoffSlug: TEAM_SLUGS.DET, logoPath: "/team-logos/DET.png" },
  { teamName: "Edmonton Oilers", abbreviation: "EDM", dailyFaceoffSlug: TEAM_SLUGS.EDM, logoPath: "/team-logos/EDM.png" },
  { teamName: "Florida Panthers", abbreviation: "FLA", dailyFaceoffSlug: TEAM_SLUGS.FLA, logoPath: "/team-logos/FLA.png" },
  { teamName: "Los Angeles Kings", abbreviation: "LAK", dailyFaceoffSlug: TEAM_SLUGS.LAK, logoPath: "/team-logos/LAK.png" },
  { teamName: "Minnesota Wild", abbreviation: "MIN", dailyFaceoffSlug: TEAM_SLUGS.MIN, logoPath: "/team-logos/MIN.png" },
  { teamName: "Montreal Canadiens", abbreviation: "MTL", dailyFaceoffSlug: TEAM_SLUGS.MTL, logoPath: "/team-logos/MTL.png" },
  { teamName: "Nashville Predators", abbreviation: "NSH", dailyFaceoffSlug: TEAM_SLUGS.NSH, logoPath: "/team-logos/NSH.png" },
  { teamName: "New Jersey Devils", abbreviation: "NJD", dailyFaceoffSlug: TEAM_SLUGS.NJD, logoPath: "/team-logos/NJD.png" },
  { teamName: "New York Islanders", abbreviation: "NYI", dailyFaceoffSlug: TEAM_SLUGS.NYI, logoPath: "/team-logos/NYI.png" },
  { teamName: "New York Rangers", abbreviation: "NYR", dailyFaceoffSlug: TEAM_SLUGS.NYR, logoPath: "/team-logos/NYR.png" },
  { teamName: "Ottawa Senators", abbreviation: "OTT", dailyFaceoffSlug: TEAM_SLUGS.OTT, logoPath: "/team-logos/OTT.png" },
  { teamName: "Philadelphia Flyers", abbreviation: "PHI", dailyFaceoffSlug: TEAM_SLUGS.PHI, logoPath: "/team-logos/PHI.png" },
  { teamName: "Pittsburgh Penguins", abbreviation: "PIT", dailyFaceoffSlug: TEAM_SLUGS.PIT, logoPath: "/team-logos/PIT.png" },
  { teamName: "San Jose Sharks", abbreviation: "SJS", dailyFaceoffSlug: TEAM_SLUGS.SJS, logoPath: "/team-logos/SJS.png" },
  { teamName: "Seattle Kraken", abbreviation: "SEA", dailyFaceoffSlug: TEAM_SLUGS.SEA, logoPath: "/team-logos/SEA.png" },
  { teamName: "St. Louis Blues", abbreviation: "STL", dailyFaceoffSlug: TEAM_SLUGS.STL, logoPath: "/team-logos/STL.png" },
  { teamName: "Tampa Bay Lightning", abbreviation: "TBL", dailyFaceoffSlug: TEAM_SLUGS.TBL, logoPath: "/team-logos/TBL.png" },
  { teamName: "Toronto Maple Leafs", abbreviation: "TOR", dailyFaceoffSlug: TEAM_SLUGS.TOR, logoPath: "/team-logos/TOR.png" },
  { teamName: "Utah Mammoth", abbreviation: "UTA", dailyFaceoffSlug: TEAM_SLUGS.UTA, logoPath: "/team-logos/UTA.png" },
  { teamName: "Vancouver Canucks", abbreviation: "VAN", dailyFaceoffSlug: TEAM_SLUGS.VAN, logoPath: "/team-logos/VAN.png" },
  { teamName: "Vegas Golden Knights", abbreviation: "VGK", dailyFaceoffSlug: TEAM_SLUGS.VGK, logoPath: "/team-logos/VGK.png" },
  { teamName: "Washington Capitals", abbreviation: "WSH", dailyFaceoffSlug: TEAM_SLUGS.WSH, logoPath: "/team-logos/WSH.png" },
  { teamName: "Winnipeg Jets", abbreviation: "WPG", dailyFaceoffSlug: TEAM_SLUGS.WPG, logoPath: "/team-logos/WPG.png" },
];

const IGNORE_LINES = new Set([
  "LW", "C", "RW", "LD", "RD",
  "Forwards", "Defensive Pairings", "Defense Pairings",
  "1st Powerplay Unit", "2nd Powerplay Unit",
  "1st Penalty Kill Unit", "2nd Penalty Kill Unit",
  "Goalies", "Injuries",
  "Click player jersey for news, stats and more!",
  "Team News", "Show Jerseys", "Last 10 Games", "Stats",
  "Season Stats", "Share", "Hide News Indicator", "Badges:",
  "Game-time decision", "IR Injured Reserve list", "DTD Day-to-Day", "OUT Out",
]);

const SECTION_BREAKS = {
  forwards: ["Defensive Pairings", "Defense Pairings", "1st Powerplay Unit"],
  defense: ["1st Powerplay Unit", "2nd Powerplay Unit"],
  pp1: ["2nd Powerplay Unit", "1st Penalty Kill Unit"],
  pp2: ["1st Penalty Kill Unit", "2nd Penalty Kill Unit"],
  pk1: ["2nd Penalty Kill Unit", "Goalies"],
  pk2: ["Goalies", "Injuries"],
  goalies: ["Injuries", "Badges:"],
};

function normalizeName(name: string) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function cleanTextLines(html: string) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  const text = decodeHtml(withoutScripts.replace(/<[^>]+>/g, "\n"));
  const cleaned: string[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (cleaned.slice(-3).includes(line)) continue;
    cleaned.push(line);
  }

  return cleaned;
}

function findHeadingIndex(lines: string[], possibleHeadings: string[]) {
  return lines.findIndex((line) => possibleHeadings.includes(line));
}

function extractSection(lines: string[], startHeadings: string[], endHeadings: string[]) {
  const startIndex = findHeadingIndex(lines, startHeadings);
  if (startIndex === -1) return [];

  const collected: string[] = [];

  for (const line of lines.slice(startIndex + 1)) {
    if (endHeadings.includes(line)) break;
    if (IGNORE_LINES.has(line)) continue;
    if (line.startsWith("Image:")) continue;
    if (line.toLowerCase().startsWith("last updated:")) continue;
    if (line.toLowerCase().startsWith("source:")) continue;
    if (/^(ir|out|dtd)$/i.test(line)) continue;
    collected.push(line);
  }

  return collected;
}

function chunkList<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

async function fetchDailyFaceoffRaw(teamAbbr: string) {
  const abbr = teamAbbr.toUpperCase().trim();
  const slug = TEAM_SLUGS[abbr];
  const url = `https://www.dailyfaceoff.com/teams/${slug}/line-combinations`;

  const response = await fetch(url, {
    next: { revalidate: 900 },
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html",
    },
  });

  if (!response.ok) throw new Error(`Daily Faceoff request failed for ${abbr}`);

  const lines = cleanTextLines(await response.text());

  const forwardsRaw = extractSection(lines, ["Forwards"], SECTION_BREAKS.forwards);
  const defenseRaw = extractSection(lines, ["Defensive Pairings", "Defense Pairings"], SECTION_BREAKS.defense);
  const pp1Raw = extractSection(lines, ["1st Powerplay Unit"], SECTION_BREAKS.pp1);
  const pp2Raw = extractSection(lines, ["2nd Powerplay Unit"], SECTION_BREAKS.pp2);
  const pk1Raw = extractSection(lines, ["1st Penalty Kill Unit"], SECTION_BREAKS.pk1);
  const pk2Raw = extractSection(lines, ["2nd Penalty Kill Unit"], SECTION_BREAKS.pk2);
  const goaliesRaw = extractSection(lines, ["Goalies"], SECTION_BREAKS.goalies);

  const forwards = chunkList(forwardsRaw.slice(0, 12), 3);
  const defense = chunkList(defenseRaw.slice(0, 6), 2);

  return {
    team: abbr,
    url,
    forwards: {
      "Line 1": forwards[0] ?? [],
      "Line 2": forwards[1] ?? [],
      "Line 3": forwards[2] ?? [],
      "Line 4": forwards[3] ?? [],
    },
    defense: {
      "Pair 1": defense[0] ?? [],
      "Pair 2": defense[1] ?? [],
      "Pair 3": defense[2] ?? [],
    },
    pp: {
      PP1: pp1Raw.slice(0, 5),
      PP2: pp2Raw.slice(0, 5),
    },
    pk: {
      PK1: pk1Raw.slice(0, 4),
      PK2: pk2Raw.slice(0, 4),
    },
    goalies: goaliesRaw.slice(0, 2),
  };
}

function getUsedNames(team: DepthChartTeam) {
  const names = new Set<string>();

  team.forwards.forEach((line) => [line.lw, line.c, line.rw].forEach((p) => p?.name && names.add(normalizeName(p.name))));
  team.defense.forEach((pair) => [pair.ld, pair.rd].forEach((p) => p?.name && names.add(normalizeName(p.name))));
  [team.goalies.starter, team.goalies.backup, ...(team.goalies.extra ?? [])].forEach((p) => p?.name && names.add(normalizeName(p.name)));
  team.powerPlay?.forEach((unit) => unit.players.forEach((p) => p.name && names.add(normalizeName(p.name))));
  team.penaltyKill?.forEach((unit) => unit.players.forEach((p) => p.name && names.add(normalizeName(p.name))));
  team.injuries?.forEach((p) => p.name && names.add(normalizeName(p.name)));

  return names;
}

async function getNhlRoster(teamCode: string): Promise<PlayerSlot[]> {
  try {
    const response = await fetch(`https://api-web.nhle.com/v1/roster/${teamCode}/current`, {
      next: { revalidate: 900 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const players = [...(data.forwards ?? []), ...(data.defensemen ?? []), ...(data.goalies ?? [])];

    return players.map((player: any) => ({
      name: `${player.firstName?.default ?? ""} ${player.lastName?.default ?? ""}`.trim(),
      position: player.positionCode,
    }));
  } catch {
    return [];
  }
}

async function addHealthyScratches(team: DepthChartTeam): Promise<DepthChartTeam> {
  const usedNames = getUsedNames(team);
  if (usedNames.size === 0) return { ...team, scratches: [] };

  const roster = await getNhlRoster(team.abbreviation);
  const scratches = roster.filter((player) => player.name && !usedNames.has(normalizeName(player.name)));

  return { ...team, scratches };
}

function convertRawChartToTeam(
  baseTeam: (typeof TEAMS)[number],
  rawChart: Awaited<ReturnType<typeof fetchDailyFaceoffRaw>>
): DepthChartTeam {
  return {
    ...baseTeam,
    source: "Daily Faceoff",
    updatedAt: new Date().toISOString(),
    debug: `DF parsed: ${Object.values(rawChart.forwards).flat().length} forwards, ${Object.values(rawChart.defense).flat().length} defensemen, ${rawChart.goalies.length} goalies.`,
    forwards: [1, 2, 3, 4].map((line) => {
      const players = rawChart.forwards[`Line ${line}` as keyof typeof rawChart.forwards];
      return {
        line,
        lw: players[0] ? { name: players[0] } : undefined,
        c: players[1] ? { name: players[1] } : undefined,
        rw: players[2] ? { name: players[2] } : undefined,
      };
    }).filter((line) => line.lw || line.c || line.rw),
    defense: [1, 2, 3].map((pair) => {
      const players = rawChart.defense[`Pair ${pair}` as keyof typeof rawChart.defense];
      return {
        pair,
        ld: players[0] ? { name: players[0] } : undefined,
        rd: players[1] ? { name: players[1] } : undefined,
      };
    }).filter((pair) => pair.ld || pair.rd),
    goalies: {
      starter: rawChart.goalies[0] ? { name: rawChart.goalies[0] } : undefined,
      backup: rawChart.goalies[1] ? { name: rawChart.goalies[1] } : undefined,
    },
    powerPlay: [
      { unit: 1, players: rawChart.pp.PP1.map((name) => ({ name })) },
      { unit: 2, players: rawChart.pp.PP2.map((name) => ({ name })) },
    ].filter((unit) => unit.players.length > 0),
    penaltyKill: [
      { unit: 1, players: rawChart.pk.PK1.map((name) => ({ name })) },
      { unit: 2, players: rawChart.pk.PK2.map((name) => ({ name })) },
    ].filter((unit) => unit.players.length > 0),
    scratches: [],
    injuries: [],
  };
}

async function getDailyFaceoffTeam(baseTeam: (typeof TEAMS)[number]) {
  const rawChart = await fetchDailyFaceoffRaw(baseTeam.abbreviation);
  return convertRawChartToTeam(baseTeam, rawChart);
}

export async function getDepthCharts(): Promise<DepthChartTeam[]> {
  const teams: DepthChartTeam[] = [];

  for (const team of TEAMS) {
    try {
      const dailyFaceoffTeam = await getDailyFaceoffTeam(team);
      const completeTeam = await addHealthyScratches(dailyFaceoffTeam);

      teams.push(completeTeam);

      // Small delay so NHL.com and Daily Faceoff are not hit by every request at once.
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      teams.push({
        ...team,
        source: "Daily Faceoff unavailable",
        debug:
          error instanceof Error
            ? error.message
            : "Daily Faceoff fetch failed.",
        forwards: [],
        defense: [],
        goalies: {},
        powerPlay: [],
        penaltyKill: [],
        scratches: [],
        injuries: [],
      });
    }
  }

  return teams;
}