"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type TeamRow = {
  team: string;
  name: string;
  season: number | string;
  games_played: number;
};

type SeasonsResponse = {
  success: boolean;
  seasons: MoneyPuckSeason[];
};

type TeamsResponse = {
  success: boolean;
  rows: TeamRow[];
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

function getTeamDisplayName(teamCode: string) {
  return TEAM_NAMES[teamCode] ?? teamCode;
}

function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function teamMatchesSearch(team: TeamRow, search: string) {
  const normalizedSearch = normalizeSearch(search);

  if (!normalizedSearch) return true;

  const teamCode = normalizeSearch(team.team);
  const teamName = normalizeSearch(getTeamDisplayName(team.team));

  return teamCode.includes(normalizedSearch) || teamName.includes(normalizedSearch);
}

export default function TeamsPage() {
  const [seasons, setSeasons] = useState<MoneyPuckSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const response = await fetch("/api/admin/moneypuck-seasons");
        const data = (await response.json()) as SeasonsResponse;

        if (!data.success) {
          setError("Could not load uploaded seasons.");
          return;
        }

        const seasonsWithTeams = data.seasons.filter(
          (season) => season.datasets.teams
        );

        setSeasons(seasonsWithTeams);

        if (seasonsWithTeams.length > 0) {
          setSelectedSeason(seasonsWithTeams[0].season);
        }
      } catch {
        setError("Could not load uploaded seasons.");
      } finally {
        setIsLoadingSeasons(false);
      }
    }

    loadSeasons();
  }, []);

  useEffect(() => {
    async function loadTeams() {
      if (!selectedSeason) return;

      setIsLoadingTeams(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/moneypuck-data?season=${encodeURIComponent(
            selectedSeason
          )}&datasetType=teams`
        );

        const data = (await response.json()) as TeamsResponse;

        if (!data.success) {
          setError("Could not load team data for this season.");
          setTeams([]);
          return;
        }

        setTeams(data.rows);
      } catch {
        setError("Could not load team data for this season.");
        setTeams([]);
      } finally {
        setIsLoadingTeams(false);
      }
    }

    loadTeams();
  }, [selectedSeason]);

  const filteredTeams = useMemo(() => {
    return teams
      .filter((team) => teamMatchesSearch(team, search))
      .sort((a, b) =>
        getTeamDisplayName(a.team).localeCompare(getTeamDisplayName(b.team))
      );
  }, [search, teams]);

  const selectedSeasonLabel =
    seasons.find((season) => season.season === selectedSeason)?.displayLabel ??
    selectedSeason;

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
          <Link
            href="/cards"
            className="mb-8 inline-flex text-sm font-semibold text-[#4DB5FF] transition hover:text-[#FFD54A]"
          >
            ← Back to Cards
          </Link>
        <section className="mb-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            NBI Hockey Cards
          </p>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            Team Cards
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Select a season and team to open a MoneyPuck-based team percentile card.
          </p>
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-6">
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Season
              </span>

              <select
                value={selectedSeason}
                onChange={(event) => {
                  setSelectedSeason(event.target.value);
                  setSearch("");
                }}
                disabled={isLoadingSeasons}
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              >
                {seasons.map((season) => (
                  <option key={season.season} value={season.season}>
                    {season.displayLabel}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Search Team
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Type a team name or abbreviation..."
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              />
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!error && seasons.length === 0 && !isLoadingSeasons && (
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
              No team seasons have been uploaded yet.
            </div>
          )}

          {!error && seasons.length > 0 && (
            <div className="mt-5 text-sm text-gray-400">
              Showing teams from {selectedSeasonLabel}.
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingTeams ? (
            <p className="text-gray-400">Loading teams...</p>
          ) : (
            filteredTeams.map((team) => (
              <Link
                key={`${selectedSeason}-${team.team}`}
                href={`/cards/teams/${team.team}?season=${encodeURIComponent(
                  selectedSeason
                )}`}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-5 transition hover:-translate-y-1 hover:border-[#FFD54A]/60"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 p-2">
                  <img
                    src={`/team-logos/${team.team}.png`}
                    alt={getTeamDisplayName(team.team)}
                    className="max-h-[94%] max-w-[94%] object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {getTeamDisplayName(team.team)}
                  </h2>

                  <p className="text-sm text-gray-400">
                    {team.team} • {selectedSeasonLabel}
                  </p>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
