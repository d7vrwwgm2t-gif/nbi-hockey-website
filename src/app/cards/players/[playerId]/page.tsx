"use client";

import Link from "next/link";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PlayerRow = Record<string, string | number | null>;

type PlayerBio = {
  birthDate?: string;
  fullName?: string;
};

type PlayerCardMetric = {
  label: string;
  value: number | null;
  percentile: number | null;
};

type PlayerCardSection = {
  title: string;
  metrics: PlayerCardMetric[];
};

type Props = {
  params: Promise<{
    playerId: string;
  }>;
  searchParams: Promise<{
    season?: string;
  }>;
};

const SEASON_FALLBACK = "2008-09";
const CARD_WIDTH = 760;

const TEAM_ABBREVIATIONS: Record<string, string> = {
  ANA: "ANA",
  Anaheim: "ANA",
  ARI: "ARI",
  Arizona: "ARI",
  ATL: "ATL",
  Atlanta: "ATL",
  BOS: "BOS",
  Boston: "BOS",
  BUF: "BUF",
  Buffalo: "BUF",
  CGY: "CGY",
  Calgary: "CGY",
  CAR: "CAR",
  Carolina: "CAR",
  CHI: "CHI",
  Chicago: "CHI",
  COL: "COL",
  Colorado: "COL",
  CBJ: "CBJ",
  Columbus: "CBJ",
  DAL: "DAL",
  Dallas: "DAL",
  DET: "DET",
  Detroit: "DET",
  EDM: "EDM",
  Edmonton: "EDM",
  FLA: "FLA",
  Florida: "FLA",
  LAK: "LAK",
  "Los Angeles": "LAK",
  MIN: "MIN",
  Minnesota: "MIN",
  MTL: "MTL",
  Montreal: "MTL",
  NSH: "NSH",
  Nashville: "NSH",
  NJD: "NJD",
  "New Jersey": "NJD",
  NYI: "NYI",
  "New York Islanders": "NYI",
  NYR: "NYR",
  "New York Rangers": "NYR",
  NY: "NY",
  "New York": "NY",
  OTT: "OTT",
  Ottawa: "OTT",
  PHI: "PHI",
  Philadelphia: "PHI",
  PIT: "PIT",
  Pittsburgh: "PIT",
  SJS: "SJS",
  "San Jose": "SJS",
  SEA: "SEA",
  Seattle: "SEA",
  STL: "STL",
  "St. Louis": "STL",
  TBL: "TBL",
  "Tampa Bay": "TBL",
  TOR: "TOR",
  Toronto: "TOR",
  UTA: "UTA",
  Utah: "UTA",
  VAN: "VAN",
  Vancouver: "VAN",
  VGK: "VGK",
  Vegas: "VGK",
  WSH: "WSH",
  Washington: "WSH",
  WPG: "WPG",
  Winnipeg: "WPG",
};

const TEAM_NAMES: Record<string, string> = {
  ANA: "Anaheim Ducks",
  ARI: "Arizona Coyotes",
  ATL: "Atlanta Thrashers",
  BOS: "Boston Bruins",
  BUF: "Buffalo Sabres",
  CGY: "Calgary Flames",
  CAR: "Carolina Hurricanes",
  CHI: "Chicago Blackhawks",
  COL: "Colorado Avalanche",
  CBJ: "Columbus Blue Jackets",
  DAL: "Dallas Stars",
  DET: "Detroit Red Wings",
  EDM: "Edmonton Oilers",
  FLA: "Florida Panthers",
  LAK: "Los Angeles Kings",
  MIN: "Minnesota Wild",
  MTL: "Montreal Canadiens",
  NSH: "Nashville Predators",
  NJD: "New Jersey Devils",
  NYI: "New York Islanders",
  NYR: "New York Rangers",
  OTT: "Ottawa Senators",
  PHI: "Philadelphia Flyers",
  PIT: "Pittsburgh Penguins",
  SJS: "San Jose Sharks",
  SEA: "Seattle Kraken",
  STL: "St. Louis Blues",
  TBL: "Tampa Bay Lightning",
  TOR: "Toronto Maple Leafs",
  UTA: "Utah Mammoth",
  VAN: "Vancouver Canucks",
  VGK: "Vegas Golden Knights",
  WSH: "Washington Capitals",
  WPG: "Winnipeg Jets",
  "L.A": "Los Angeles Kings",
  "N.J": "New Jersey Devils",
  "S.J": "San Jose Sharks",
  "T.B": "Tampa Bay Lightning",
};

const POSITION_LABELS: Record<string, string> = {
  L: "LW",
  R: "RW",
  C: "C",
  D: "D",
  F: "F",
};

const METRIC_GROUPS = {
  finishing: [
    { label: "Goals / 60", key: "I_F_goals", type: "per60" },
    { label: "xGoals / 60", key: "I_F_xGoals", type: "per60" },
    { label: "High Danger Shots / 60", key: "I_F_highDangerShots", type: "per60" },
    {
      label: "xG + Rebounds / 60",
      key: "I_F_xGoals_with_earned_rebounds",
      type: "per60",
    },
  ],
  playmaking: [
    { label: "Primary Assists / 60", key: "I_F_primaryAssists", type: "per60" },
    { label: "Secondary Assists / 60", key: "I_F_secondaryAssists", type: "per60" },
    { label: "Rebounds Created / 60", key: "I_F_xRebounds", type: "per60" },
    {
      label: "xG From Rebounds / 60",
      key: "I_F_xGoalsFromxReboundsOfShots",
      type: "per60",
    },
  ],
  possession: [
    { label: "On-Ice xG%", key: "onIce_xGoalsPercentage", type: "percentage" },
    { label: "On-Ice Corsi%", key: "onIce_corsiPercentage", type: "percentage" },
    { label: "On-Ice Fenwick%", key: "onIce_fenwickPercentage", type: "percentage" },
  ],
  defense: [
    { label: "Takeaways / 60", key: "I_F_takeaways", type: "per60" },
    { label: "Giveaways / 60", key: "I_F_giveaways", type: "inversePer60" },
    { label: "DZ Giveaways / 60", key: "I_F_dZoneGiveaways", type: "inversePer60" },
    { label: "Blocked Shots / 60", key: "shotsBlockedByPlayer", type: "per60" },
  ],
} as const;

function getNumber(row: PlayerRow | null | undefined, key: string) {
  if (!row) return null;

  const value = row[key];

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function getString(row: PlayerRow | null | undefined, key: string) {
  if (!row) return "";

  const value = row[key];

  if (value === null || value === undefined) return "";

  return String(value);
}

function getPer60(row: PlayerRow, key: string) {
  const value = getNumber(row, key);
  const iceTime = getNumber(row, "icetime");

  if (value === null || !iceTime || iceTime <= 0) return null;

  return (value / iceTime) * 3600;
}

function getGameScorePerGame(row: PlayerRow) {
  const gameScore = getNumber(row, "gameScore");
  const gamesPlayed = getNumber(row, "games_played");

  if (gameScore === null || !gamesPlayed || gamesPlayed <= 0) return null;

  return gameScore / gamesPlayed;
}

function getMetricValue(row: PlayerRow, metric: { key: string; type: string }) {
  if (metric.type === "per60" || metric.type === "inversePer60") {
    return getPer60(row, metric.key);
  }

  if (metric.type === "percentage") {
    return getNumber(row, metric.key);
  }

  return getNumber(row, metric.key);
}

function getPositionGroup(row: PlayerRow) {
  const position = getString(row, "position").toUpperCase();

  return position === "D" ? "D" : "F";
}

function percentileRank({
  value,
  comparisonValues,
  inverse = false,
}: {
  value: number | null;
  comparisonValues: number[];
  inverse?: boolean;
}) {
  if (value === null || comparisonValues.length === 0) return null;

  const validValues = comparisonValues.filter((item) => Number.isFinite(item));

  if (validValues.length === 0) return null;

  const betterOrEqualCount = inverse
    ? validValues.filter((item) => item >= value).length
    : validValues.filter((item) => item <= value).length;

  return Math.round((betterOrEqualCount / validValues.length) * 100);
}

function ordinal(value: number | null) {
  if (value === null) return "—";

  const suffix =
    value % 10 === 1 && value % 100 !== 11
      ? "st"
      : value % 10 === 2 && value % 100 !== 12
      ? "nd"
      : value % 10 === 3 && value % 100 !== 13
      ? "rd"
      : "th";

  return `${value}${suffix}`;
}

function formatValue(value: number | null, decimals = 2) {
  if (value === null || !Number.isFinite(value)) return "—";

  return value.toFixed(decimals);
}

function getPercentileColor(percentile: number | null) {
  if (percentile === null) return "linear-gradient(90deg, #3B4452, #1B2433)";
  if (percentile >= 90) return "linear-gradient(90deg, #4DB5FF, #8ED8FF)";
  if (percentile >= 75) return "linear-gradient(90deg, #2E86DE, #4DB5FF)";
  if (percentile >= 50) return "linear-gradient(90deg, #7B8794, #B3BAC5)";
  if (percentile >= 25) return "linear-gradient(90deg, #9A4D5D, #C45B6C)";
  return "linear-gradient(90deg, #4A1018, #8B1E2D)";
}

function normalizePlayerId(value: unknown) {
  return String(value ?? "").trim();
}

function getTeamAbbreviation(team: string) {
  return TEAM_ABBREVIATIONS[team] ?? team.slice(0, 3).toUpperCase();
}

function getTeamDisplayName(teamCode: string, fallback: string) {
  return TEAM_NAMES[teamCode] ?? fallback;
}

function getPositionLabel(position: string) {
  return POSITION_LABELS[position.toUpperCase()] ?? position;
}

function getTeamLogoSrc(teamCode: string) {
  return `/team-logos/${teamCode}.png`;
}

function getPlayerPhotoSrc(playerId: string) {
  return `/api/nhl-player-image?playerId=${playerId}`;
}

function calculateAgeForSeason({
  birthDate,
  season,
}: {
  birthDate?: string;
  season: string;
}) {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const seasonStartYear = Number(season.split("-")[0]);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(seasonStartYear)) {
    return null;
  }

  const comparisonDate = new Date(`${seasonStartYear}-10-01T00:00:00Z`);
  let age = comparisonDate.getUTCFullYear() - birth.getUTCFullYear();

  const beforeBirthday =
    comparisonDate.getUTCMonth() < birth.getUTCMonth() ||
    (comparisonDate.getUTCMonth() === birth.getUTCMonth() &&
      comparisonDate.getUTCDate() < birth.getUTCDate());

  if (beforeBirthday) age -= 1;

  return age;
}

function buildMetricSection({
  title,
  metrics,
  player,
  comparisonRows,
}: {
  title: string;
  metrics: readonly {
    label: string;
    key: string;
    type: string;
  }[];
  player: PlayerRow;
  comparisonRows: PlayerRow[];
}): PlayerCardSection {
  return {
    title,
    metrics: metrics.map((metric) => {
      const value = getMetricValue(player, metric);
      const comparisonValues = comparisonRows
        .map((row) => getMetricValue(row, metric))
        .filter((item): item is number => item !== null && Number.isFinite(item));

      return {
        label: metric.label,
        value,
        percentile: percentileRank({
          value,
          comparisonValues,
          inverse: metric.type === "inversePer60",
        }),
      };
    }),
  };
}

export default function PlayerCardPageWrapper({ params, searchParams }: Props) {
  const [resolvedParams, setResolvedParams] = useState<{
    playerId: string;
    season: string;
  } | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const awaitedParams = await params;
      const awaitedSearchParams = await searchParams;

      setResolvedParams({
        playerId: awaitedParams.playerId,
        season: awaitedSearchParams.season ?? SEASON_FALLBACK,
      });
    }

    resolveParams();
  }, [params, searchParams]);

  if (!resolvedParams) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-6 py-24">Loading...</div>
      </main>
    );
  }

  return (
    <PlayerCardPage
      playerId={resolvedParams.playerId}
      season={resolvedParams.season}
    />
  );
}

function PlayerCardPage({
  playerId,
  season,
}: {
  playerId: string;
  season: string;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [rows, setRows] = useState<PlayerRow[]>([]);
  const [bio, setBio] = useState<PlayerBio | null>(null);
  const [isLoadingBio, setIsLoadingBio] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRows() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/moneypuck-data?season=${encodeURIComponent(
            season
          )}&datasetType=skaters`
        );

        const data = await response.json();

        if (!data.success) {
          setError("Could not load player card data.");
          setRows([]);
          return;
        }

        setRows(data.rows);
      } catch {
        setError("Could not load player card data.");
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRows();
  }, [season]);

  useEffect(() => {
    async function loadBio() {
      setIsLoadingBio(true);

      try {
        const response = await fetch(
          `/api/nhl-player-bio?playerId=${encodeURIComponent(playerId)}`
        );

        const data = await response.json();

        if (!data.success) {
          setBio(null);
          return;
        }

        setBio({
          birthDate: data.birthDate ?? undefined,
          fullName: data.fullName || undefined,
        });
      } catch {
        setBio(null);
      } finally {
        setIsLoadingBio(false);
      }
    }

    loadBio();
  }, [playerId]);

  const player = useMemo(() => {
    return rows.find((row) => normalizePlayerId(row.playerId) === playerId);
  }, [playerId, rows]);

  const comparisonRows = useMemo(() => {
    if (!player) return [];

    const playerPositionGroup = getPositionGroup(player);

    return rows.filter((row) => getPositionGroup(row) === playerPositionGroup);
  }, [player, rows]);

  const gameScorePerGame = player ? getGameScorePerGame(player) : null;

  const gameScorePercentile = useMemo(() => {
    if (!player) return null;

    const comparisonValues = comparisonRows
      .map((row) => getGameScorePerGame(row))
      .filter((item): item is number => item !== null && Number.isFinite(item));

    return percentileRank({
      value: gameScorePerGame,
      comparisonValues,
    });
  }, [comparisonRows, gameScorePerGame, player]);

  const sections = useMemo(() => {
    if (!player) return [];

    return [
      buildMetricSection({
        title: "Finishing",
        metrics: METRIC_GROUPS.finishing,
        player,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Playmaking",
        metrics: METRIC_GROUPS.playmaking,
        player,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Possession",
        metrics: METRIC_GROUPS.possession,
        player,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Defensive Impact",
        metrics: METRIC_GROUPS.defense,
        player,
        comparisonRows,
      }),
    ];
  }, [comparisonRows, player]);

  if (isLoading || isLoadingBio) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-6 py-24">Loading player card...</div>
      </main>
    );
  }

  if (error || !player) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <Link
            href="/cards/players"
            className="mb-6 inline-flex text-sm font-semibold text-[#4DB5FF] hover:text-[#FFD54A]"
          >
            ← Back to Player Search
          </Link>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
            {error || "Player not found for this season."}
          </div>
        </div>
      </main>
    );
  }

  const playerName = bio?.fullName || getString(player, "name");
  const team = getString(player, "team");
  const position = getString(player, "position");
  const gamesPlayed = getNumber(player, "games_played");
  const teamCode = getTeamAbbreviation(team);
  const teamDisplayName = getTeamDisplayName(teamCode, team);
  const positionLabel = getPositionLabel(position);
  const age = calculateAgeForSeason({
    birthDate: bio?.birthDate,
    season,
  });
  const teamLogoSrc = getTeamLogoSrc(teamCode);
  const playerPhotoSrc = getPlayerPhotoSrc(playerId);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/cards/players"
            className="inline-flex text-sm font-semibold text-[#4DB5FF] hover:text-[#FFD54A]"
          >
            ← Back to Player Search
          </Link>

          <p className="text-sm text-gray-400">
            Screenshot the card to share for now.
          </p>
        </div>

        <PlayerCard
          ref={cardRef}
          playerName={playerName}
          teamDisplayName={teamDisplayName}
          positionLabel={positionLabel}
          age={age}
          season={season}
          gamesPlayed={gamesPlayed}
          teamLogoSrc={teamLogoSrc}
          playerPhotoSrc={playerPhotoSrc}
          gameScorePerGame={gameScorePerGame}
          gameScorePercentile={gameScorePercentile}
          sections={sections}
        />
      </div>
    </main>
  );
}

const PlayerCard = forwardRef<
  HTMLElement,
  {
    playerName: string;
    teamDisplayName: string;
    positionLabel: string;
    age: number | null;
    season: string;
    gamesPlayed: number | null;
    teamLogoSrc: string;
    playerPhotoSrc: string;
    gameScorePerGame: number | null;
    gameScorePercentile: number | null;
    sections: PlayerCardSection[];
  }
>(function PlayerCard(
  {
    playerName,
    teamDisplayName,
    positionLabel,
    age,
    season,
    gamesPlayed,
    teamLogoSrc,
    playerPhotoSrc,
    gameScorePerGame,
    gameScorePercentile,
    sections,
  },
  ref
) {
  const ageText = age === null ? "" : ` • Age ${age}`;

  return (
    <section
      ref={ref}
      style={{ width: `${CARD_WIDTH}px` }}
      className="mx-auto overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F] shadow-2xl"
    >
      <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#132B45] to-[#07111F] p-8">
        <img
          src={playerPhotoSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-42"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-[#07111F]" />

        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#4DB5FF]/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#FFD54A]/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-[260px] flex-col justify-between">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-[#FFD54A]">
                NBI Hockey Card
              </p>

              <h1 className="max-w-[520px] text-5xl font-black uppercase leading-none md:text-6xl">
                {playerName}
              </h1>

              <p className="mt-4 text-lg font-semibold text-gray-200">
                {teamDisplayName} • {positionLabel}
                {ageText} • {season}
              </p>
            </div>

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 p-2">
              <img
                src={teamLogoSrc}
                alt={teamDisplayName}
                className="max-h-[92%] max-w-[92%] object-contain"
                onError={(event) => {
                  const image = event.currentTarget;

                  if (image.src.includes("/team-logos/NBI.png")) {
                    image.style.display = "none";
                    return;
                  }

                  image.src = "/team-logos/NBI.png";
                }}
              />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <StatPill
              label="Game Score / GP"
              value={formatValue(gameScorePerGame, 3)}
            />

            <StatPill
              label="Impact Percentile"
              value={ordinal(gameScorePercentile)}
            />

            <StatPill
              label="Games Played"
              value={gamesPlayed === null ? "—" : gamesPlayed.toString()}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5">
        {sections.map((section) => (
          <CardSection key={section.title} section={section} />
        ))}
      </div>

      <footer className="flex items-center justify-between border-t border-white/10 bg-[#0D1B2A] px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/nbi_logo copy 2.png"
            alt=""
            className="h-7 w-7 rounded-full object-contain"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#FFD54A]">
            Created by NBI Hockey
          </div>
        </div>

        <div className="text-xs font-semibold text-gray-400">
          Data from MoneyPuck
        </div>
      </footer>
    </section>
  );
});

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </div>

      <div className="mt-1 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function CardSection({ section }: { section: PlayerCardSection }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0D1B2A]/95 p-5">
      <h2 className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#FFD54A]">
        {section.title}
      </h2>

      <div className="grid gap-4">
        {section.metrics.map((metric) => (
          <MetricBar key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

function MetricBar({ metric }: { metric: PlayerCardMetric }) {
  const width = metric.percentile === null ? 0 : metric.percentile;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-300">
          {metric.label}
        </span>

        <span className="text-xs font-bold text-white">
          {ordinal(metric.percentile)}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-black/35">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: getPercentileColor(metric.percentile),
          }}
        />
      </div>

      <div className="mt-1 text-[10px] text-gray-500">
        Value: {formatValue(metric.value)}
      </div>
    </div>
  );
}
