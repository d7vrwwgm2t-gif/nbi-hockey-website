"use client";

import Link from "next/link";
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type GoalieRow = Record<string, string | number | null>;

type PlayerBio = {
  birthDate?: string;
  fullName?: string;
};

type GoalieCardMetric = {
  label: string;
  value: number | null;
  percentile: number | null;
};

type GoalieCardSection = {
  title: string;
  metrics: GoalieCardMetric[];
};

type CareerImpactSeason = {
  season: string;
  percentile: number | null;
};

type Props = {
  params: Promise<{
    playerId: string;
  }>;
  searchParams: Promise<{
    season?: string;
  }>;
};

type MoneyPuckSeason = {
  season: string;
  displayLabel: string;
  generatedAt: string;
  datasets: {
    skaters: boolean;
    goalies: boolean;
    teams: boolean;
  };
  counts: {
    skaters: number;
    goalies: number;
    teams: number;
  };
};

type SeasonsResponse = {
  success: boolean;
  seasons: MoneyPuckSeason[];
};

type GoaliesResponse = {
  success: boolean;
  rows: GoalieRow[];
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

const METRIC_GROUPS = {
  shotStopping: [
    { label: "GSAx / 60", key: "goalsSavedAboveExpected", type: "per60" },
    { label: "Goals Against / 60", key: "goals", type: "inversePer60" },
    { label: "Save %", key: "savePercentage", type: "percentage" },
    {
      label: "Flurry Adj. Save %",
      key: "flurryAdjustedSavePercentage",
      type: "percentage",
    },
  ],
  highDanger: [
    { label: "High Danger Save %", key: "highDangerSavePercentage", type: "percentage" },
    { label: "Medium Danger Save %", key: "mediumDangerSavePercentage", type: "percentage" },
    { label: "Low Danger Save %", key: "lowDangerSavePercentage", type: "percentage" },
    { label: "High Danger GSAx", key: "highDangerGoalsSavedAboveExpected", type: "raw" },
  ],
  rebounds: [
    { label: "Rebounds / 60", key: "rebounds", type: "inversePer60" },
    { label: "xRebounds / 60", key: "xRebounds", type: "inversePer60" },
    { label: "Rebounds Saved / 60", key: "reboundsSavedAboveExpected", type: "per60" },
    { label: "Rebound Control", key: "reboundControlPercentage", type: "percentage" },
  ],
  puckManagement: [
    { label: "Play Stopped Above Expected", key: "playStoppedAboveExpected", type: "raw" },
    {
      label: "Outside Zone Continued Above Expected",
      key: "playContinuedOutsideZoneAboveExpected",
      type: "raw",
    },
    {
      label: "In-Zone Continuations Prevented",
      key: "inZoneContinuationsPrevented",
      type: "raw",
    },
    { label: "Freezes / 60", key: "freeze", type: "per60" },
  ],
} as const;

function getNumber(row: GoalieRow | null | undefined, key: string) {
  if (!row) return null;

  const value = row[key];

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function getString(row: GoalieRow | null | undefined, key: string) {
  if (!row) return "";

  const value = row[key];

  if (value === null || value === undefined) return "";

  return String(value);
}

function safeDivide(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || denominator <= 0) return null;

  return numerator / denominator;
}

function getPer60(row: GoalieRow, key: string) {
  const value = getGoalieMetricRawValue(row, key);
  const iceTime = getNumber(row, "icetime");

  if (value === null || !iceTime || iceTime <= 0) return null;

  return (value / iceTime) * 3600;
}

function getGoalieMetricRawValue(row: GoalieRow, key: string) {
  const xGoals = getNumber(row, "xGoals");
  const goals = getNumber(row, "goals");
  const flurryAdjustedxGoals = getNumber(row, "flurryAdjustedxGoals");
  const shotsOnGoal = getNumber(row, "ongoal");
  const highDangerShots = getNumber(row, "highDangerShots");
  const mediumDangerShots = getNumber(row, "mediumDangerShots");
  const lowDangerShots = getNumber(row, "lowDangerShots");
  const highDangerGoals = getNumber(row, "highDangerGoals");
  const mediumDangerGoals = getNumber(row, "mediumDangerGoals");
  const lowDangerGoals = getNumber(row, "lowDangerGoals");
  const highDangerxGoals = getNumber(row, "highDangerxGoals");
  const xRebounds = getNumber(row, "xRebounds");
  const rebounds = getNumber(row, "rebounds");
  const xPlayStopped = getNumber(row, "xPlayStopped");
  const playStopped = getNumber(row, "playStopped");
  const xPlayContinuedOutsideZone = getNumber(row, "xPlayContinuedOutsideZone");
  const playContinuedOutsideZone = getNumber(row, "playContinuedOutsideZone");
  const xPlayContinuedInZone = getNumber(row, "xPlayContinuedInZone");
  const playContinuedInZone = getNumber(row, "playContinuedInZone");

  if (key === "goalsSavedAboveExpected") {
    if (xGoals === null || goals === null) return null;
    return xGoals - goals;
  }

  if (key === "savePercentage") {
    if (shotsOnGoal === null || goals === null) return null;
    return safeDivide(shotsOnGoal - goals, shotsOnGoal);
  }

  if (key === "flurryAdjustedSavePercentage") {
    if (shotsOnGoal === null || flurryAdjustedxGoals === null) return null;
    return safeDivide(shotsOnGoal - flurryAdjustedxGoals, shotsOnGoal);
  }

  if (key === "highDangerSavePercentage") {
    if (highDangerShots === null || highDangerGoals === null) return null;
    return safeDivide(highDangerShots - highDangerGoals, highDangerShots);
  }

  if (key === "mediumDangerSavePercentage") {
    if (mediumDangerShots === null || mediumDangerGoals === null) return null;
    return safeDivide(mediumDangerShots - mediumDangerGoals, mediumDangerShots);
  }

  if (key === "lowDangerSavePercentage") {
    if (lowDangerShots === null || lowDangerGoals === null) return null;
    return safeDivide(lowDangerShots - lowDangerGoals, lowDangerShots);
  }

  if (key === "highDangerGoalsSavedAboveExpected") {
    if (highDangerxGoals === null || highDangerGoals === null) return null;
    return highDangerxGoals - highDangerGoals;
  }

  if (key === "reboundsSavedAboveExpected") {
    if (xRebounds === null || rebounds === null) return null;
    return xRebounds - rebounds;
  }

  if (key === "reboundControlPercentage") {
    if (xRebounds === null || rebounds === null) return null;

    if (xRebounds === 0) return rebounds === 0 ? 1 : 0;

    return (xRebounds - rebounds) / xRebounds;
  }

  if (key === "playStoppedAboveExpected") {
    if (playStopped === null || xPlayStopped === null) return null;
    return playStopped - xPlayStopped;
  }

  if (key === "playContinuedOutsideZoneAboveExpected") {
    if (
      playContinuedOutsideZone === null ||
      xPlayContinuedOutsideZone === null
    ) {
      return null;
    }

    return playContinuedOutsideZone - xPlayContinuedOutsideZone;
  }

  if (key === "inZoneContinuationsPrevented") {
    if (playContinuedInZone === null || xPlayContinuedInZone === null) {
      return null;
    }

    return xPlayContinuedInZone - playContinuedInZone;
  }

  return getNumber(row, key);
}

function getMetricValue(row: GoalieRow, metric: { key: string; type: string }) {
  if (metric.type === "per60" || metric.type === "inversePer60") {
    return getPer60(row, metric.key);
  }

  return getGoalieMetricRawValue(row, metric.key);
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

function formatMetricValue(metric: GoalieCardMetric) {
  if (metric.value === null || !Number.isFinite(metric.value)) return "—";

  if (metric.label.includes("%") || metric.label.includes("Save")) {
    return `${(metric.value * 100).toFixed(1)}%`;
  }

  return formatValue(metric.value);
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
  goalie,
  comparisonRows,
}: {
  title: string;
  metrics: readonly {
    label: string;
    key: string;
    type: string;
  }[];
  goalie: GoalieRow;
  comparisonRows: GoalieRow[];
}): GoalieCardSection {
  return {
    title,
    metrics: metrics.map((metric) => {
      const value = getMetricValue(goalie, metric);
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

export default function GoalieCardPageWrapper({ params, searchParams }: Props) {
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
        <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-24">Loading...</div>
      </main>
    );
  }

  return (
    <GoalieCardPage
      playerId={resolvedParams.playerId}
      season={resolvedParams.season}
    />
  );
}

function GoalieCardPage({
  playerId,
  season,
}: {
  playerId: string;
  season: string;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [rows, setRows] = useState<GoalieRow[]>([]);
  const [careerImpact, setCareerImpact] = useState<CareerImpactSeason[]>([]);
  const [isLoadingCareerImpact, setIsLoadingCareerImpact] = useState(true);
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
          )}&datasetType=goalies`
        );

        const data = await response.json();

        if (!data.success) {
          setError("Could not load goalie card data.");
          setRows([]);
          return;
        }

        setRows(data.rows);
      } catch {
        setError("Could not load goalie card data.");
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRows();
  }, [season]);

  useEffect(() => {
    async function loadCareerImpact() {
      setIsLoadingCareerImpact(true);

      try {
        const seasonsResponse = await fetch("/api/admin/moneypuck-seasons");
        const seasonsData = (await seasonsResponse.json()) as SeasonsResponse;

        if (!seasonsData.success) {
          setCareerImpact([]);
          return;
        }

        const goalieSeasons = seasonsData.seasons
          .filter((seasonItem) => seasonItem.datasets.goalies)
          .sort((a, b) => a.season.localeCompare(b.season));

        const seasonResults = await Promise.all(
          goalieSeasons.map(async (seasonItem) => {
            try {
              const response = await fetch(
                `/api/admin/moneypuck-data?season=${encodeURIComponent(
                  seasonItem.season
                )}&datasetType=goalies`
              );

              const data = (await response.json()) as GoaliesResponse;

              if (!data.success) return null;

              const seasonRows = data.rows;
              const seasonGoalie = seasonRows.find(
                (row) => normalizePlayerId(row.playerId) === playerId
              );

              if (!seasonGoalie) return null;

              const value = getPer60(seasonGoalie, "goalsSavedAboveExpected");
              const comparisonValues = seasonRows
                .map((row) => getPer60(row, "goalsSavedAboveExpected"))
                .filter(
                  (item): item is number =>
                    item !== null && Number.isFinite(item)
                );

              return {
                season: seasonItem.season,
                percentile: percentileRank({
                  value,
                  comparisonValues,
                }),
              };
            } catch {
              return null;
            }
          })
        );

        setCareerImpact(
          seasonResults.filter(
            (item): item is CareerImpactSeason => item !== null
          )
        );
      } catch {
        setCareerImpact([]);
      } finally {
        setIsLoadingCareerImpact(false);
      }
    }

    loadCareerImpact();
  }, [playerId]);

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

  const goalie = useMemo(() => {
    return rows.find((row) => normalizePlayerId(row.playerId) === playerId);
  }, [playerId, rows]);

  const comparisonRows = rows;

  const gsaxPer60 = goalie
    ? getPer60(goalie, "goalsSavedAboveExpected")
    : null;

  const gsaxPercentile = useMemo(() => {
    if (!goalie) return null;

    const comparisonValues = comparisonRows
      .map((row) => getPer60(row, "goalsSavedAboveExpected"))
      .filter((item): item is number => item !== null && Number.isFinite(item));

    return percentileRank({
      value: gsaxPer60,
      comparisonValues,
    });
  }, [comparisonRows, goalie, gsaxPer60]);

  const sections = useMemo(() => {
    if (!goalie) return [];

    return [
      buildMetricSection({
        title: "Shot Stopping",
        metrics: METRIC_GROUPS.shotStopping,
        goalie,
        comparisonRows,
      }),
      buildMetricSection({
        title: "High Danger",
        metrics: METRIC_GROUPS.highDanger,
        goalie,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Rebounds",
        metrics: METRIC_GROUPS.rebounds,
        goalie,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Puck Management",
        metrics: METRIC_GROUPS.puckManagement,
        goalie,
        comparisonRows,
      }),
    ];
  }, [comparisonRows, goalie]);

  if (isLoading || isLoadingBio) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-24">Loading goalie card...</div>
      </main>
    );
  }

  if (error || !goalie) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-24">
          <Link
            href="/cards/goalies"
            className="mb-6 inline-flex text-sm font-semibold text-[#4DB5FF] hover:text-[#FFD54A]"
          >
            ← Back to Goalie Search
          </Link>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
            {error || "Goalie not found for this season."}
          </div>
        </div>
      </main>
    );
  }

  const goalieName = bio?.fullName || getString(goalie, "name");
  const team = getString(goalie, "team");
  const gamesPlayed = getNumber(goalie, "games_played");
  const teamCode = getTeamAbbreviation(team);
  const teamDisplayName = getTeamDisplayName(teamCode, team);
  const age = calculateAgeForSeason({
    birthDate: bio?.birthDate,
    season,
  });
  const teamLogoSrc = getTeamLogoSrc(teamCode);
  const playerPhotoSrc = getPlayerPhotoSrc(playerId);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/cards/goalies"
            className="inline-flex text-sm font-semibold text-[#4DB5FF] hover:text-[#FFD54A]"
          >
            ← Back to Goalie Search
          </Link>

          <p className="text-sm text-gray-400">
            Screenshot the card to share for now.
          </p>
        </div>

        <GoalieCard
          ref={cardRef}
          goalieName={goalieName}
          teamDisplayName={teamDisplayName}
          age={age}
          season={season}
          gamesPlayed={gamesPlayed}
          teamLogoSrc={teamLogoSrc}
          playerPhotoSrc={playerPhotoSrc}
          gsaxPer60={gsaxPer60}
          gsaxPercentile={gsaxPercentile}
          sections={sections}
        />

        <CareerImpactPanel
          careerImpact={careerImpact}
          currentSeason={season}
          playerId={playerId}
          isLoading={isLoadingCareerImpact}
        />
      </div>
    </main>
  );
}

const GoalieCard = forwardRef<
  HTMLElement,
  {
    goalieName: string;
    teamDisplayName: string;
    age: number | null;
    season: string;
    gamesPlayed: number | null;
    teamLogoSrc: string;
    playerPhotoSrc: string;
    gsaxPer60: number | null;
    gsaxPercentile: number | null;
    sections: GoalieCardSection[];
  }
>(function GoalieCard(
  {
    goalieName,
    teamDisplayName,
    age,
    season,
    gamesPlayed,
    teamLogoSrc,
    playerPhotoSrc,
    gsaxPer60,
    gsaxPercentile,
    sections,
  },
  ref
) {
  const ageText = age === null ? "" : ` • Age ${age}`;
  const [cardScale, setCardScale] = useState(1);

useEffect(() => {
  function updateCardScale() {
    const availableWidth = document.documentElement.clientWidth - 24;
    const nextScale = Math.min(1, availableWidth / CARD_WIDTH);

    setCardScale(nextScale);
  }

  updateCardScale();

  window.addEventListener("orientationchange", updateCardScale);

  return () => window.removeEventListener("orientationchange", updateCardScale);
}, []);

  return (
    <div
      className="mx-auto overflow-visible"
      style={{
        width: `${CARD_WIDTH * cardScale}px`,
      }}
    >
      <section
        ref={ref}
        style={{
          width: `${CARD_WIDTH}px`,
          transform: `scale(${cardScale})`,
          transformOrigin: "top left",
        }}
        className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F] shadow-2xl"
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
                NBI Hockey Goalie Card
              </p>

              <h1 className="max-w-[520px] text-5xl font-black uppercase leading-none md:text-6xl">
                {goalieName}
              </h1>

              <p className="mt-4 text-lg font-semibold text-gray-200">
                {teamDisplayName} • G{ageText} • {season}
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
              label="GSAx / 60"
              value={formatValue(gsaxPer60, 3)}
            />

            <StatPill
              label="Goalie Percentile"
              value={ordinal(gsaxPercentile)}
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
    </div>
  );
});

function CareerImpactPanel({
  careerImpact,
  currentSeason,
  playerId,
  isLoading,
}: {
  careerImpact: CareerImpactSeason[];
  currentSeason: string;
  playerId: string;
  isLoading: boolean;
}) {
  const chartHeight = 180;
  const chartPaddingX = 28;
  const chartPaddingY = 22;
  const chartWidth = 720;

  const validPoints = careerImpact.filter(
    (item) => item.percentile !== null && Number.isFinite(item.percentile)
  );

  const points = validPoints.map((item, index) => {
    const x =
      validPoints.length <= 1
        ? chartWidth / 2
        : chartPaddingX +
          (index * (chartWidth - chartPaddingX * 2)) /
            (validPoints.length - 1);

    const y =
      chartPaddingY +
      ((100 - Number(item.percentile)) * (chartHeight - chartPaddingY * 2)) /
        100;

    return {
      ...item,
      x,
      y,
    };
  });

  const linePath =
    points.length === 0
      ? ""
      : points
          .map((point, index) =>
            index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
          )
          .join(" ");

  return (
    <section className="mx-auto mt-8 max-w-[760px] rounded-2xl border border-white/10 bg-[#0D1B2A]/95 p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#FFD54A]">
            Career Trend
          </p>

          <h2 className="text-2xl font-black text-white">
            Goalie Impact by Season
          </h2>
        </div>

        <p className="text-sm text-gray-400">
          Based on GSAx / 60 percentile
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm text-gray-400">
          Loading career seasons...
        </div>
      ) : careerImpact.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm text-gray-400">
          No other uploaded goalie seasons found for this player.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-3">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-[180px] min-w-[520px] w-full"
              role="img"
              aria-label="Goalie impact percentile by season"
            >
              {[0, 25, 50, 75, 100].map((tick) => {
                const y =
                  chartPaddingY +
                  ((100 - tick) * (chartHeight - chartPaddingY * 2)) / 100;

                return (
                  <g key={tick}>
                    <line
                      x1={chartPaddingX}
                      x2={chartWidth - chartPaddingX}
                      y1={y}
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <text
                      x={4}
                      y={y + 4}
                      fill="rgba(255,255,255,0.45)"
                      fontSize="10"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#4DB5FF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {points.map((point) => (
                <g key={point.season}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={point.season === currentSeason ? 7 : 5}
                    fill={point.season === currentSeason ? "#FFD54A" : "#4DB5FF"}
                    stroke="#07111F"
                    strokeWidth="2"
                  />
                  <text
                    x={point.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.55)"
                    fontSize="10"
                  >
                    {point.season.slice(2)}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#FFD54A]">
              Other Seasons
            </h3>

            <div className="flex flex-wrap gap-2">
              {careerImpact.map((item) => (
                <Link
                  key={item.season}
                  href={`/cards/goalies/${playerId}?season=${encodeURIComponent(
                    item.season
                  )}`}
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                    item.season === currentSeason
                      ? "border-[#FFD54A] bg-[#FFD54A] text-[#07111F]"
                      : "border-white/10 bg-black/20 text-gray-300 hover:border-[#4DB5FF] hover:text-[#4DB5FF]"
                  }`}
                >
                  {item.season}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

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

function CardSection({ section }: { section: GoalieCardSection }) {
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

function MetricBar({ metric }: { metric: GoalieCardMetric }) {
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
        Value: {formatMetricValue(metric)}
      </div>
    </div>
  );
}
