import depthChartData from "../../public/data/depth-charts.json";

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
  sourceUrl?: string;

  forwards: {
    line: number;
    lw?: PlayerSlot | null;
    c?: PlayerSlot | null;
    rw?: PlayerSlot | null;
  }[];

  defense: {
    pair: number;
    ld?: PlayerSlot | null;
    rd?: PlayerSlot | null;
  }[];

  goalies: {
    starter?: PlayerSlot | null;
    backup?: PlayerSlot | null;
    extra?: PlayerSlot[];
  };

  powerPlay?: SpecialTeamUnit[];
  penaltyKill?: SpecialTeamUnit[];
  scratches?: PlayerSlot[];
  injuries?: PlayerSlot[];
};

type DepthChartPayload = {
  generatedAt: string | null;
  teams: DepthChartTeam[];
  errors?: {
    team: string;
    error: string;
  }[];
};

/**
 * Converts common shortened first names to a consistent full-name form.
 *
 * This lets names such as "Matt Boldy" and "Matthew Boldy" count as
 * the same player when comparing the projected lineup to the NHL roster.
 */
const FIRST_NAME_ALIASES: Record<string, string> = {
  alex: "alexander",
  alec: "alexander",
  andy: "andrew",
  ben: "benjamin",
  benny: "benjamin",
  bill: "william",
  billy: "william",
  bob: "robert",
  bobby: "robert",
  brad: "bradley",
  chris: "christopher",
  dan: "daniel",
  danny: "daniel",
  dave: "david",
  ed: "edward",
  eddie: "edward",
  gabe: "gabriel",
  greg: "gregory",
  hank: "henry",
  jack: "john",
  jake: "jacob",
  jamie: "james",
  jay: "jason",
  jeff: "jeffrey",
  jim: "james",
  jimmy: "james",
  joe: "joseph",
  joey: "joseph",
  johnny: "john",
  jon: "jonathan",
  jonny: "jonathan",
  josh: "joshua",
  joshy: "joshua",
  kev: "kevin",
  kris: "kristopher",
  leo: "leonard",
  luke: "lucas",
  marc: "mark",
  matt: "matthew",
  matty: "matthew",
  max: "maximilian",
  mike: "michael",
  mitch: "mitchell",
  nate: "nathan",
  nick: "nicholas",
  nicky: "nicholas",
  pat: "patrick",
  pete: "peter",
  phil: "philip",
  rob: "robert",
  robbie: "robert",
  sam: "samuel",
  sammy: "samuel",
  seb: "sebastian",
  steve: "steven",
  stevie: "steven",
  theo: "theodore",
  tim: "timothy",
  tom: "thomas",
  tommy: "thomas",
  tony: "anthony",
  ty: "tyler",
  will: "william",
  willie: "william",
  zach: "zachary",
  zack: "zachary",
  zac: "zachary",
};

/**
 * Removes accents and formatting differences so names from different
 * sources can be compared consistently.
 */
function cleanName(name: string): string {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’\-]/g, " ")
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Produces a comparison key for a player's name.
 *
 * Only the first name is passed through the alias list. The rest of the
 * name is preserved, preventing unrelated players from being combined.
 */
function normalizePlayerName(name: string): string {
  const cleanedName = cleanName(name);

  if (!cleanedName) {
    return "";
  }

  const nameParts = cleanedName.split(" ");

  if (nameParts.length === 1) {
    return FIRST_NAME_ALIASES[nameParts[0]] ?? nameParts[0];
  }

  const firstName = nameParts[0];
  const canonicalFirstName = FIRST_NAME_ALIASES[firstName] ?? firstName;

  return [canonicalFirstName, ...nameParts.slice(1)].join(" ");
}

function addPlayerName(
  names: Set<string>,
  player?: PlayerSlot | null,
): void {
  if (!player?.name) {
    return;
  }

  const normalizedName = normalizePlayerName(player.name);

  if (normalizedName) {
    names.add(normalizedName);
  }
}

/**
 * Collects every player already included in the team's main lineup.
 *
 * Power-play and penalty-kill players are included as an additional
 * safeguard, although they will normally already appear at even strength.
 */
function getLineupPlayerNames(team: DepthChartTeam): Set<string> {
  const names = new Set<string>();

  for (const line of team.forwards ?? []) {
    addPlayerName(names, line.lw);
    addPlayerName(names, line.c);
    addPlayerName(names, line.rw);
  }

  for (const pair of team.defense ?? []) {
    addPlayerName(names, pair.ld);
    addPlayerName(names, pair.rd);
  }

  addPlayerName(names, team.goalies?.starter);
  addPlayerName(names, team.goalies?.backup);

  for (const goalie of team.goalies?.extra ?? []) {
    addPlayerName(names, goalie);
  }

  for (const unit of team.powerPlay ?? []) {
    for (const player of unit.players ?? []) {
      addPlayerName(names, player);
    }
  }

  for (const unit of team.penaltyKill ?? []) {
    for (const player of unit.players ?? []) {
      addPlayerName(names, player);
    }
  }

  return names;
}

/**
 * Removes players from the scratches list when an equivalent version of
 * their name already appears in the projected lineup.
 *
 * It also prevents the same player from appearing more than once in the
 * scratches list.
 */
function filterDuplicateScratches(team: DepthChartTeam): PlayerSlot[] {
  const lineupNames = getLineupPlayerNames(team);
  const scratchNames = new Set<string>();

  return (team.scratches ?? []).filter((player) => {
    const normalizedName = normalizePlayerName(player.name);

    if (!normalizedName) {
      return false;
    }

    if (lineupNames.has(normalizedName)) {
      return false;
    }

    if (scratchNames.has(normalizedName)) {
      return false;
    }

    scratchNames.add(normalizedName);
    return true;
  });
}

function cleanDepthChartTeam(team: DepthChartTeam): DepthChartTeam {
  return {
    ...team,
    scratches: filterDuplicateScratches(team),
  };
}

export async function getDepthCharts(): Promise<DepthChartTeam[]> {
  const payload = depthChartData as DepthChartPayload;

  return (payload.teams ?? []).map(cleanDepthChartTeam);
}

export function getDepthChartGeneratedAt(): string | null {
  const payload = depthChartData as DepthChartPayload;

  return payload.generatedAt ?? null;
}