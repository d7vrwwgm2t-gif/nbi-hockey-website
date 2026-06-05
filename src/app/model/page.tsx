"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PublicCategoryResult = {
  score: number | null;
  letterGrade: string | null;
};

type PublicPlayerGrade = {
  player: string;
  team: string;
  position: string;
  confidenceLabel: "High Confidence" | "Moderate Confidence" | "Small Sample";
  finishing: PublicCategoryResult;
  playmaking: PublicCategoryResult;
  transition: PublicCategoryResult;
  puckManagement: PublicCategoryResult;
  suppression: PublicCategoryResult;
  forechecking: PublicCategoryResult;
  powerPlay: PublicCategoryResult;
  penaltyKill: PublicCategoryResult;
};

type ModelSeasonSummary = {
  league: string;
  season: string;
  generatedAt: string;
  playerCount: number;
  metadata: {
    displayLabel: string;
    bannerSlot: "current" | "lastYear" | "twoYearsAgo" | "archive";
    sortOrder: number;
    isVisible: boolean;
  };
};

type ModelGradesResponse = {
  success: boolean;
  league: string;
  season: string;
  generatedAt: string;
  playerCount: number;
  grades: PublicPlayerGrade[];
};

type SortKey =
  | "player"
  | "team"
  | "position"
  | "finishing"
  | "playmaking"
  | "transition"
  | "puckManagement"
  | "suppression"
  | "forechecking"
  | "powerPlay"
  | "penaltyKill";

type SortDirection = "asc" | "desc";

const CATEGORY_COLUMNS: {
  key: SortKey;
  label: string;
  shortLabel: string;
}[] = [
  { key: "finishing", label: "Finishing", shortLabel: "FIN" },
  { key: "playmaking", label: "Playmaking", shortLabel: "PLY" },
  { key: "transition", label: "Transition", shortLabel: "TRN" },
  { key: "puckManagement", label: "Puck Management", shortLabel: "PM" },
  { key: "suppression", label: "Suppression", shortLabel: "SUP" },
  { key: "forechecking", label: "Forechecking", shortLabel: "FCHK" },
  { key: "powerPlay", label: "Power Play", shortLabel: "PP" },
  { key: "penaltyKill", label: "Penalty Kill", shortLabel: "PK" },
];

const TEAM_ABBREVIATIONS: Record<string, string> = {
  Anaheim: "ANA",
  Arizona: "ARI",
  Boston: "BOS",
  Buffalo: "BUF",
  Calgary: "CGY",
  Carolina: "CAR",
  Chicago: "CHI",
  Colorado: "COL",
  Columbus: "CBJ",
  Dallas: "DAL",
  Detroit: "DET",
  Edmonton: "EDM",
  Florida: "FLA",
  "Los Angeles": "LAK",
  Minnesota: "MIN",
  Montreal: "MTL",
  Nashville: "NSH",
  "New Jersey": "NJD",
  "New York": "NY",
  "New York Islanders": "NYI",
  "New York Rangers": "NYR",
  Ottawa: "OTT",
  Philadelphia: "PHI",
  Pittsburgh: "PIT",
  "San Jose": "SJS",
  Seattle: "SEA",
  "St. Louis": "STL",
  "Tampa Bay": "TBL",
  Toronto: "TOR",
  Utah: "UTA",
  Vancouver: "VAN",
  Vegas: "VGK",
  Washington: "WSH",
  Winnipeg: "WPG",
};

function getCategoryScore(player: PublicPlayerGrade, key: SortKey) {
  if (
    key === "finishing" ||
    key === "playmaking" ||
    key === "transition" ||
    key === "puckManagement" ||
    key === "suppression" ||
    key === "forechecking" ||
    key === "powerPlay" ||
    key === "penaltyKill"
  ) {
    return player[key].score;
  }

  return null;
}

function formatScore(category: PublicCategoryResult) {
  if (category.score === null) return "—";

  return category.score.toString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getTeamAbbreviation(team: string) {
  return TEAM_ABBREVIATIONS[team] ?? team.slice(0, 3).toUpperCase();
}

function getTeamLogoSrc(team: string) {
  const abbreviation = getTeamAbbreviation(team);

  // Temporary public logo location. Later we can swap this to NHL.com/official logo URLs
  // or local files in /public/team-logos.
  return `/team-logos/${abbreviation}.svg`;
}

function getTeamDisplayName(team: string) {
  const abbreviation = getTeamAbbreviation(team);

  return abbreviation;
}

function getPlayerUrl(player: PublicPlayerGrade) {
  return `/model/players/${slugify(player.player)}`;
}

function getTeamUrl(team: string) {
  return `/model/teams/${slugify(team)}`;
}

export default function ModelPage() {
  const [seasons, setSeasons] = useState<ModelSeasonSummary[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [players, setPlayers] = useState<PublicPlayerGrade[]>([]);
  const [teamFilter, setTeamFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("finishing");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const response = await fetch("/api/admin/model-seasons");
        const data = await response.json();

        if (!data.success) {
          setError("Could not load model seasons.");
          return;
        }

        const visibleSeasons = (data.seasons as ModelSeasonSummary[]).filter(
          (season) => season.metadata.isVisible
        );

        setSeasons(visibleSeasons);

        if (visibleSeasons.length > 0) {
          setSelectedSeason(visibleSeasons[0].season);
        }
      } catch {
        setError("Could not load model seasons.");
      } finally {
        setIsLoadingSeasons(false);
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    async function loadPlayers() {
      if (!selectedSeason) return;

      setIsLoadingPlayers(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/model-grades?league=NHL&season=${encodeURIComponent(
            selectedSeason
          )}`
        );

        const data = (await response.json()) as ModelGradesResponse;

        if (!data.success) {
          setError("Could not load player grades for this season.");
          setPlayers([]);
          return;
        }

        setPlayers(data.grades);
        setTeamFilter("all");
        setPositionFilter("all");
      } catch {
        setError("Could not load player grades for this season.");
        setPlayers([]);
      } finally {
        setIsLoadingPlayers(false);
      }
    }

    loadPlayers();
  }, [selectedSeason]);

  const teams = useMemo(() => {
    return Array.from(new Set(players.map((player) => player.team))).sort();
  }, [players]);

  const positions = useMemo(() => {
    return Array.from(new Set(players.map((player) => player.position))).sort();
  }, [players]);

  const filteredAndSortedPlayers = useMemo(() => {
    const filtered = players.filter((player) => {
      const teamMatch = teamFilter === "all" || player.team === teamFilter;
      const positionMatch =
        positionFilter === "all" || player.position === positionFilter;

      return teamMatch && positionMatch;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortKey === "player") {
        comparison = a.player.localeCompare(b.player);
      } else if (sortKey === "team") {
        comparison = a.team.localeCompare(b.team);
      } else if (sortKey === "position") {
        comparison = a.position.localeCompare(b.position);
      } else {
        const aScore = getCategoryScore(a, sortKey);
        const bScore = getCategoryScore(b, sortKey);

        comparison = (aScore ?? -1) - (bScore ?? -1);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [players, positionFilter, sortDirection, sortKey, teamFilter]);

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);

    if (
      nextSortKey === "player" ||
      nextSortKey === "team" ||
      nextSortKey === "position"
    ) {
      setSortDirection("asc");
    } else {
      setSortDirection("desc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";

    return sortDirection === "asc" ? " ↑" : " ↓";
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <section className="mb-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            NBI Hockey Model
          </p>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            Player Tables
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Sort and filter calculated player category scores by season, team,
            and position. Raw spreadsheet values are hidden from public view.
          </p>
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Season
              </span>
              <select
                value={selectedSeason}
                onChange={(event) => setSelectedSeason(event.target.value)}
                disabled={isLoadingSeasons}
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              >
                {seasons.map((season) => (
                  <option key={season.season} value={season.season}>
                    {season.metadata.displayLabel} ({season.season})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">Team</span>
              <select
                value={teamFilter}
                onChange={(event) => setTeamFilter(event.target.value)}
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              >
                <option value="all">All Teams</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Position
              </span>
              <select
                value={positionFilter}
                onChange={(event) => setPositionFilter(event.target.value)}
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              >
                <option value="all">All Positions</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0D1B2A]/95">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="text-2xl font-bold">Players</h2>

            <p className="text-sm text-gray-400">
              {isLoadingPlayers
                ? "Loading..."
                : `${filteredAndSortedPlayers.length} players`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-[#07111F] text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <SortableHeader
                    label="Player"
                    sortKey="player"
                    currentSortKey={sortKey}
                    sortIndicator={sortIndicator}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Team"
                    sortKey="team"
                    currentSortKey={sortKey}
                    sortIndicator={sortIndicator}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Pos"
                    sortKey="position"
                    currentSortKey={sortKey}
                    sortIndicator={sortIndicator}
                    onSort={handleSort}
                  />

                  {CATEGORY_COLUMNS.map((category) => (
                    <SortableHeader
                      key={category.key}
                      label={category.shortLabel}
                      sortKey={category.key}
                      currentSortKey={sortKey}
                      sortIndicator={sortIndicator}
                      onSort={handleSort}
                    />
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredAndSortedPlayers.map((player) => (
                  <tr
                    key={`${selectedSeason}-${player.player}-${player.team}`}
                    className="border-t border-white/10 transition hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-semibold">
                      <Link
                        href={getPlayerUrl(player)}
                        className="text-white transition hover:text-[#FFD54A]"
                      >
                        {player.player}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={getTeamUrl(player.team)}
                        className="inline-flex items-center gap-2 transition hover:text-[#FFD54A]"
                        title={player.team}
                      >
                        <img
                          src={getTeamLogoSrc(player.team)}
                          alt={getTeamDisplayName(player.team)}
                          className="h-7 w-7 rounded-full object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="text-xs text-gray-400">
                          {getTeamDisplayName(player.team)}
                        </span>
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-gray-300">
                      {player.position}
                    </td>

                    {CATEGORY_COLUMNS.map((category) => (
                      <td
                        key={category.key}
                        className="px-4 py-3 font-semibold text-gray-100"
                        title={category.label}
                      >
                        {formatScore(
                          player[category.key as keyof PublicPlayerGrade] as PublicCategoryResult
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  sortIndicator,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortIndicator: (key: SortKey) => string;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSortKey === sortKey;

  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`font-semibold transition hover:text-[#FFD54A] ${
          isActive ? "text-[#FFD54A]" : "text-gray-400"
        }`}
      >
        {label}
        {sortIndicator(sortKey)}
      </button>
    </th>
  );
}
