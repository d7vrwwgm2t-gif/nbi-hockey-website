"use client";

import Link from "next/link";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

type TeamRow = Record<string, string | number | null>;

type TeamCardMetric = {
  label: string;
  value: number | null;
  rank: number | null;
  rankPercent: number | null;
  totalTeams: number;
};

type TeamCardSection = {
  title: string;
  metrics: TeamCardMetric[];
};

type Props = {
  params: Promise<{
    teamCode: string;
  }>;
  searchParams: Promise<{
    season?: string;
  }>;
};

const SEASON_FALLBACK = "2008-09";
const CARD_WIDTH = 760;

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
  teamImpact: [
    { label: "xGoals %", key: "xGoalsPercentage", type: "percentage" },
    { label: "Corsi %", key: "corsiPercentage", type: "percentage" },
    { label: "Fenwick %", key: "fenwickPercentage", type: "percentage" },
    { label: "Goal Differential / 60", key: "goalDifferential", type: "per60" },
  ],
  offense: [
    { label: "xGoals For / 60", key: "xGoalsFor", type: "per60" },
    { label: "Goals For / 60", key: "goalsFor", type: "per60" },
    { label: "High Danger Shots / 60", key: "highDangerShotsFor", type: "per60" },
    { label: "Shot Attempts / 60", key: "shotAttemptsFor", type: "per60" },
  ],
  defense: [
    { label: "xGoals Against / 60", key: "xGoalsAgainst", type: "inversePer60" },
    { label: "Goals Against / 60", key: "goalsAgainst", type: "inversePer60" },
    {
      label: "High Danger Against / 60",
      key: "highDangerShotsAgainst",
      type: "inversePer60",
    },
    { label: "Shot Attempts Against / 60", key: "shotAttemptsAgainst", type: "inversePer60" },
  ],
  puckManagement: [
    { label: "Takeaways / 60", key: "takeawaysFor", type: "per60" },
    { label: "Giveaways / 60", key: "giveawaysFor", type: "inversePer60" },
    { label: "DZ Giveaways / 60", key: "dZoneGiveawaysFor", type: "inversePer60" },
    { label: "Penalties / 60", key: "penaltiesFor", type: "inversePer60" },
  ],
} as const;

function getNumber(row: TeamRow | null | undefined, key: string) {
  if (!row) return null;

  const value = row[key];

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function getString(row: TeamRow | null | undefined, key: string) {
  if (!row) return "";

  const value = row[key];

  if (value === null || value === undefined) return "";

  return String(value);
}

function getTeamDisplayName(teamCode: string) {
  return TEAM_NAMES[teamCode] ?? teamCode;
}

function getTeamLogoSrc(teamCode: string) {
  return `/team-logos/${teamCode}.png`;
}

function getMetricRawValue(row: TeamRow, key: string) {
  if (key === "goalDifferential") {
    const goalsFor = getNumber(row, "goalsFor");
    const goalsAgainst = getNumber(row, "goalsAgainst");

    if (goalsFor === null || goalsAgainst === null) return null;

    return goalsFor - goalsAgainst;
  }

  return getNumber(row, key);
}

function getPer60(row: TeamRow, key: string) {
  const value = getMetricRawValue(row, key);
  const iceTime = getNumber(row, "iceTime");

  if (value === null || !iceTime || iceTime <= 0) return null;

  return (value / iceTime) * 3600;
}

function getMetricValue(row: TeamRow, metric: { key: string; type: string }) {
  if (metric.type === "per60" || metric.type === "inversePer60") {
    return getPer60(row, metric.key);
  }

  return getMetricRawValue(row, metric.key);
}

function teamRank({
  value,
  comparisonValues,
  inverse = false,
}: {
  value: number | null;
  comparisonValues: number[];
  inverse?: boolean;
}) {
  if (value === null || comparisonValues.length === 0) {
    return {
      rank: null,
      rankPercent: null,
      totalTeams: comparisonValues.length,
    };
  }

  const validValues = comparisonValues.filter((item) => Number.isFinite(item));

  if (validValues.length === 0) {
    return {
      rank: null,
      rankPercent: null,
      totalTeams: 0,
    };
  }

  const sortedValues = [...validValues].sort((a, b) =>
    inverse ? a - b : b - a
  );

  const rank = sortedValues.findIndex((item) => item === value) + 1;
  const totalTeams = validValues.length;
  const rankPercent =
    totalTeams <= 1 ? 100 : ((totalTeams - rank) / (totalTeams - 1)) * 100;

  return {
    rank,
    rankPercent: Math.round(rankPercent),
    totalTeams,
  };
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


function formatRank(rank: number | null, totalTeams: number) {
  if (rank === null || totalTeams === 0) return "—";

  return `${ordinal(rank)} / ${totalTeams}`;
}

function formatValue(value: number | null, decimals = 2) {
  if (value === null || !Number.isFinite(value)) return "—";

  return value.toFixed(decimals);
}

function formatMetricValue(metric: TeamCardMetric) {
  if (metric.value === null || !Number.isFinite(metric.value)) return "—";

  if (metric.label.includes("%")) {
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

function normalizeTeamCode(value: string) {
  return value.trim().toUpperCase();
}

function buildMetricSection({
  title,
  metrics,
  team,
  comparisonRows,
}: {
  title: string;
  metrics: readonly {
    label: string;
    key: string;
    type: string;
  }[];
  team: TeamRow;
  comparisonRows: TeamRow[];
}): TeamCardSection {
  return {
    title,
    metrics: metrics.map((metric) => {
      const value = getMetricValue(team, metric);
      const comparisonValues = comparisonRows
        .map((row) => getMetricValue(row, metric))
        .filter((item): item is number => item !== null && Number.isFinite(item));

      const rankResult = teamRank({
        value,
        comparisonValues,
        inverse: metric.type === "inversePer60",
      });

      return {
        label: metric.label,
        value,
        rank: rankResult.rank,
        rankPercent: rankResult.rankPercent,
        totalTeams: rankResult.totalTeams,
      };
    }),
  };
}

export default function TeamCardPageWrapper({ params, searchParams }: Props) {
  const [resolvedParams, setResolvedParams] = useState<{
    teamCode: string;
    season: string;
  } | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const awaitedParams = await params;
      const awaitedSearchParams = await searchParams;

      setResolvedParams({
        teamCode: normalizeTeamCode(awaitedParams.teamCode),
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
    <TeamCardPage
      teamCode={resolvedParams.teamCode}
      season={resolvedParams.season}
    />
  );
}

function TeamCardPage({
  teamCode,
  season,
}: {
  teamCode: string;
  season: string;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [rows, setRows] = useState<TeamRow[]>([]);
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
          )}&datasetType=teams`
        );

        const data = await response.json();

        if (!data.success) {
          setError("Could not load team card data.");
          setRows([]);
          return;
        }

        setRows(data.rows);
      } catch {
        setError("Could not load team card data.");
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRows();
  }, [season]);

  const team = useMemo(() => {
    return rows.find((row) => normalizeTeamCode(getString(row, "team")) === teamCode);
  }, [rows, teamCode]);

  const comparisonRows = rows;

  const xGoalsPercentage = team ? getMetricRawValue(team, "xGoalsPercentage") : null;

  const teamRankResult = useMemo(() => {
    if (!team) {
      return {
        rank: null,
        rankPercent: null,
        totalTeams: comparisonRows.length,
      };
    }

    const comparisonValues = comparisonRows
      .map((row) => getMetricRawValue(row, "xGoalsPercentage"))
      .filter((item): item is number => item !== null && Number.isFinite(item));

    return teamRank({
      value: xGoalsPercentage,
      comparisonValues,
    });
  }, [comparisonRows, team, xGoalsPercentage]);

  const sections = useMemo(() => {
    if (!team) return [];

    return [
      buildMetricSection({
        title: "Team Impact",
        metrics: METRIC_GROUPS.teamImpact,
        team,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Offense",
        metrics: METRIC_GROUPS.offense,
        team,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Defense",
        metrics: METRIC_GROUPS.defense,
        team,
        comparisonRows,
      }),
      buildMetricSection({
        title: "Puck Management",
        metrics: METRIC_GROUPS.puckManagement,
        team,
        comparisonRows,
      }),
    ];
  }, [comparisonRows, team]);

  if (isLoading) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-24">Loading team card...</div>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-24">
          <Link
            href="/cards/teams"
            className="mb-6 inline-flex text-sm font-semibold text-[#4DB5FF] hover:text-[#FFD54A]"
          >
            ← Back to Team Search
          </Link>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
            {error || "Team not found for this season."}
          </div>
        </div>
      </main>
    );
  }

  const gamesPlayed = getNumber(team, "games_played");
  const teamDisplayName = getTeamDisplayName(teamCode);
  const teamLogoSrc = getTeamLogoSrc(teamCode);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/cards/teams"
            className="inline-flex text-sm font-semibold text-[#4DB5FF] hover:text-[#FFD54A]"
          >
            ← Back to Team Search
          </Link>

          <p className="text-sm text-gray-400">
            Screenshot the card to share for now.
          </p>
        </div>

        <TeamCard
          ref={cardRef}
          teamDisplayName={teamDisplayName}
          teamCode={teamCode}
          season={season}
          gamesPlayed={gamesPlayed}
          teamLogoSrc={teamLogoSrc}
          xGoalsPercentage={xGoalsPercentage}
          teamRankResult={teamRankResult}
          sections={sections}
        />
      </div>
    </main>
  );
}

const TeamCard = forwardRef<
  HTMLElement,
  {
    teamDisplayName: string;
    teamCode: string;
    season: string;
    gamesPlayed: number | null;
    teamLogoSrc: string;
    xGoalsPercentage: number | null;
    teamRankResult: {
      rank: number | null;
      rankPercent: number | null;
      totalTeams: number;
    };
    sections: TeamCardSection[];
  }
>(function TeamCard(
  {
    teamDisplayName,
    teamCode,
    season,
    gamesPlayed,
    teamLogoSrc,
    xGoalsPercentage,
    teamRankResult,
    sections,
  },
  ref
) {
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
        width: `${CARD_WIDTH}px`,
        zoom: cardScale,
      }}
    >
      <section
        ref={ref}
        style={{
          width: `${CARD_WIDTH}px`,
        }}
        className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07111F] shadow-2xl"
      >
      <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#132B45] to-[#07111F] p-8">
        <img
          src={teamLogoSrc}
          alt=""
          className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-25"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-[#07111F]" />

        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#4DB5FF]/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#FFD54A]/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-[260px] flex-col justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-[#FFD54A]">
              NBI Hockey Team Card
            </p>

            <h1 className="max-w-[650px] text-5xl font-black uppercase leading-none md:text-6xl">
              {teamDisplayName}
            </h1>

            <p className="mt-4 text-lg font-semibold text-gray-200">
              {teamCode} • Team Level • {season}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <StatPill
              label="xGoals %"
              value={
                xGoalsPercentage === null
                  ? "—"
                  : `${(xGoalsPercentage * 100).toFixed(1)}%`
              }
            />

            <StatPill
              label="Team Rank"
              value={formatRank(teamRankResult.rank, teamRankResult.totalTeams)}
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

function CardSection({ section }: { section: TeamCardSection }) {
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

function MetricBar({ metric }: { metric: TeamCardMetric }) {
  const width = metric.rankPercent === null ? 0 : metric.rankPercent;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-300">
          {metric.label}
        </span>

        <span className="text-xs font-bold text-white">
          {formatRank(metric.rank, metric.totalTeams)}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-black/35">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: getPercentileColor(metric.rankPercent),
          }}
        />
      </div>

      <div className="mt-1 text-[10px] text-gray-500">
        Value: {formatMetricValue(metric)}
      </div>
    </div>
  );
}
