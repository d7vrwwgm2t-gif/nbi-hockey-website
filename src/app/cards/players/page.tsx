"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MoneyPuckSeason = {
  season: string;
  displayLabel: string;
  generatedAt: string;
  datasets: { skaters: boolean; goalies: boolean; teams: boolean };
  counts: { skaters: number; goalies: number; teams: number };
};

type Player = {
  playerId: number | string;
  season: number | string;
  name: string;
  displayName?: string;
  team: string;
  position: string;
  games_played: number;
};

type SeasonsResponse = { success: boolean; seasons: MoneyPuckSeason[] };
type PlayersResponse = { success: boolean; rows: Player[] };

const TEAM_ABBREVIATIONS: Record<string, string> = {
  ANA: "ANA", Anaheim: "ANA",
  ARI: "ARI", Arizona: "ARI",
  ATL: "ATL", Atlanta: "ATL",
  BOS: "BOS", Boston: "BOS",
  BUF: "BUF", Buffalo: "BUF",
  CGY: "CGY", Calgary: "CGY",
  CAR: "CAR", Carolina: "CAR",
  CHI: "CHI", Chicago: "CHI",
  COL: "COL", Colorado: "COL",
  CBJ: "CBJ", Columbus: "CBJ",
  DAL: "DAL", Dallas: "DAL",
  DET: "DET", Detroit: "DET",
  EDM: "EDM", Edmonton: "EDM",
  FLA: "FLA", Florida: "FLA",
  LAK: "LAK", "Los Angeles": "LAK", "L.A": "LAK", "L.A.": "LAK",
  MIN: "MIN", Minnesota: "MIN",
  MTL: "MTL", Montreal: "MTL",
  NSH: "NSH", Nashville: "NSH",
  NJD: "NJD", "New Jersey": "NJD", "N.J": "NJD", "N.J.": "NJD",
  NYI: "NYI", "New York Islanders": "NYI",
  NYR: "NYR", "New York Rangers": "NYR",
  NY: "NY", "New York": "NY",
  OTT: "OTT", Ottawa: "OTT",
  PHI: "PHI", Philadelphia: "PHI",
  PIT: "PIT", Pittsburgh: "PIT",
  SJS: "SJS", "San Jose": "SJS", "S.J": "SJS", "S.J.": "SJS",
  SEA: "SEA", Seattle: "SEA",
  STL: "STL", "St. Louis": "STL",
  TBL: "TBL", "Tampa Bay": "TBL", "T.B": "TBL", "T.B.": "TBL",
  TOR: "TOR", Toronto: "TOR",
  UTA: "UTA", Utah: "UTA",
  VAN: "VAN", Vancouver: "VAN",
  VGK: "VGK", Vegas: "VGK",
  WSH: "WSH", Washington: "WSH",
  WPG: "WPG", Winnipeg: "WPG",
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
};

const POSITION_LABELS: Record<string, string> = {
  L: "LW",
  R: "RW",
  C: "C",
  D: "D",
  F: "F",
};

function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function getTeamCode(team: string) {
  return TEAM_ABBREVIATIONS[team] ?? team.trim().toUpperCase();
}

function getTeamDisplayName(team: string) {
  const teamCode = getTeamCode(team);
  return TEAM_NAMES[teamCode] ?? team;
}

function getPositionLabel(position: string) {
  return POSITION_LABELS[position.toUpperCase()] ?? position;
}

function getTeamLogoSrc(team: string) {
  return `/team-logos/${getTeamCode(team)}.png`;
}

function getPlayerPhotoSrc(playerId: string | number) {
  return `/api/nhl-player-image?playerId=${playerId}`;
}

function getDisplayName<T extends { name: string; displayName?: string }>(
  item: T
) {
  return item.displayName || item.name;
}

async function getNhlDisplayName(playerId: string | number) {
  try {
    const response = await fetch(
      `/api/nhl-player-bio?playerId=${encodeURIComponent(String(playerId))}`
    );

    const data = await response.json();

    if (!data.success || !data.fullName) {
      return "";
    }

    return data.fullName;
  } catch {
    return "";
  }
}

function playerMatchesSearch(player: Player, search: string) {
  const normalizedSearch = normalizeSearch(search);
  if (!normalizedSearch) return false;

  const fullName = normalizeSearch(getDisplayName(player));
  const nameParts = fullName.split(" ");

  return (
    fullName.includes(normalizedSearch) ||
    nameParts.some((part) => part.includes(normalizedSearch))
  );
}

export default function PlayersPage() {
  const [seasons, setSeasons] = useState<MoneyPuckSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
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

        const seasonsWithSkaters = data.seasons.filter(
          (season) => season.datasets.skaters
        );

        setSeasons(seasonsWithSkaters);

        if (seasonsWithSkaters.length > 0) {
          setSelectedSeason(seasonsWithSkaters[0].season);
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
    async function loadPlayers() {
      if (!selectedSeason) return;

      setIsLoadingPlayers(true);
      setError("");
      setSearch("");
      setSelectedTeam("");

      try {
        const response = await fetch(
          `/api/admin/moneypuck-data?season=${encodeURIComponent(
            selectedSeason
          )}&datasetType=skaters`
        );

        const data = (await response.json()) as PlayersResponse;

        if (!data.success) {
          setError("Could not load skater data for this season.");
          setPlayers([]);
          return;
        }

        setPlayers(data.rows);

        const updatedRows = await Promise.all(
          data.rows.map(async (player) => {
            const displayName = await getNhlDisplayName(player.playerId);

            return {
              ...player,
              displayName: displayName || player.name,
            };
          })
        );

        setPlayers(updatedRows);
      } catch {
        setError("Could not load skater data for this season.");
        setPlayers([]);
      } finally {
        setIsLoadingPlayers(false);
      }
    }

    loadPlayers();
  }, [selectedSeason]);

  const matchingPlayers = useMemo(() => {
    if (search.trim().length < 2) return [];

    return players
      .filter((player) => playerMatchesSearch(player, search))
      .sort((a, b) => {
        const aName = normalizeSearch(a.name);
        const bName = normalizeSearch(b.name);
        const searchValue = normalizeSearch(search);

        const aStarts = aName.startsWith(searchValue);
        const bStarts = bName.startsWith(searchValue);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return getDisplayName(a).localeCompare(getDisplayName(b));
      })
      .slice(0, 12);
  }, [players, search]);

  const teams = useMemo(() => {
    const uniqueTeamCodes = Array.from(
      new Set(players.map((player) => getTeamCode(player.team)))
    );

    return uniqueTeamCodes.sort((a, b) =>
      getTeamDisplayName(a).localeCompare(getTeamDisplayName(b))
    );
  }, [players]);

  const selectedTeamPlayers = useMemo(() => {
    if (!selectedTeam) return [];

    return players
      .filter((player) => getTeamCode(player.team) === selectedTeam)
      .sort((a, b) => {
        const aGp = Number(a.games_played) || 0;
        const bGp = Number(b.games_played) || 0;

        if (bGp !== aGp) return bGp - aGp;

        return getDisplayName(a).localeCompare(getDisplayName(b));
      });
  }, [players, selectedTeam]);

  const selectedSeasonLabel =
    seasons.find((season) => season.season === selectedSeason)?.displayLabel ??
    selectedSeason;

  const selectedTeamName = selectedTeam ? getTeamDisplayName(selectedTeam) : "";

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
            Player Cards
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Search for a skater or select a team to open MoneyPuck-based
            percentile cards.
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-6">
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">Season</span>

              <select
                value={selectedSeason}
                onChange={(event) => setSelectedSeason(event.target.value)}
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

            <label className="relative grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Search Player
              </span>

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedTeam("");
                }}
                placeholder="Type a first or last name..."
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              />

              {search.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[76px] z-30 overflow-hidden rounded-xl border border-white/10 bg-[#07111F] shadow-2xl">
                  {isLoadingPlayers ? (
                    <div className="px-4 py-4 text-sm text-gray-400">
                      Loading players...
                    </div>
                  ) : matchingPlayers.length > 0 ? (
                    <div className="max-h-[420px] overflow-y-auto">
                      {matchingPlayers.map((player) => (
                        <SearchResultRow
                          key={`${selectedSeason}-${player.playerId}-${player.team}-${player.position}`}
                          player={player}
                          selectedSeason={selectedSeason}
                          selectedSeasonLabel={selectedSeasonLabel}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-sm text-gray-400">
                      No players found.
                    </div>
                  )}
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!error && seasons.length === 0 && !isLoadingSeasons && (
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
              No skater seasons have been uploaded yet.
            </div>
          )}

          {!error && seasons.length > 0 && (
            <div className="mt-5 text-sm text-gray-400">
              Showing options from {selectedSeasonLabel}. Search for a player or
              select a team below.
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Teams</h2>

            {selectedTeam && (
              <button
                type="button"
                onClick={() => setSelectedTeam("")}
                className="text-sm font-semibold text-[#4DB5FF] transition hover:text-[#FFD54A]"
              >
                Clear team filter
              </button>
            )}
          </div>

          {isLoadingPlayers ? (
            <div className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-5 text-gray-400">
              Loading teams...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => {
                    setSelectedTeam(team);
                    setSearch("");
                  }}
                  className={`flex items-center gap-4 rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:border-[#FFD54A]/60 ${
                    selectedTeam === team
                      ? "border-[#FFD54A]/70 bg-[#132B45]"
                      : "border-white/10 bg-[#0D1B2A]/95"
                  }`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 p-2">
                    <img
                      src={getTeamLogoSrc(team)}
                      alt={getTeamDisplayName(team)}
                      className="max-h-[94%] max-w-[94%] object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div>
                    <div className="font-bold text-white">
                      {getTeamDisplayName(team)}
                    </div>

                    <div className="text-sm text-gray-400">
                      {team} • {selectedSeasonLabel}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedTeam && (
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedTeamName} Players
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {selectedTeamPlayers.length} skaters from {selectedSeasonLabel}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {selectedTeamPlayers.map((player) => (
                <PlayerResultCard
                  key={`${selectedSeason}-${player.playerId}-${player.team}-${player.position}`}
                  player={player}
                  selectedSeason={selectedSeason}
                  selectedSeasonLabel={selectedSeasonLabel}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SearchResultRow({
  player,
  selectedSeason,
  selectedSeasonLabel,
}: {
  player: Player;
  selectedSeason: string;
  selectedSeasonLabel: string;
}) {
  const teamCode = getTeamCode(player.team);

  return (
    <Link
      href={`/cards/players/${player.playerId}?season=${encodeURIComponent(
        selectedSeason
      )}`}
      className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 p-1.5">
          <img
            src={getTeamLogoSrc(teamCode)}
            alt={getTeamDisplayName(teamCode)}
            className="max-h-[94%] max-w-[94%] object-contain"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div>
          <div className="font-semibold text-white">{getDisplayName(player)}</div>

          <div className="text-sm text-gray-400">
            {getTeamDisplayName(teamCode)} • {getPositionLabel(player.position)} •{" "}
            {selectedSeasonLabel}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500">{player.games_played} GP</div>
    </Link>
  );
}

function PlayerResultCard({
  player,
  selectedSeason,
  selectedSeasonLabel,
}: {
  player: Player;
  selectedSeason: string;
  selectedSeasonLabel: string;
}) {
  const teamCode = getTeamCode(player.team);

  return (
    <Link
      href={`/cards/players/${player.playerId}?season=${encodeURIComponent(
        selectedSeason
      )}`}
      className="group overflow-hidden rounded-xl border border-white/10 bg-[#0D1B2A]/95 transition hover:-translate-y-1 hover:border-[#FFD54A]/60"
    >
      <div className="relative min-h-[150px] overflow-hidden">
        <img
          src={getPlayerPhotoSrc(player.playerId)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition group-hover:opacity-55"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#07111F] via-[#07111F]/90 to-[#07111F]/20" />

        <div className="relative z-10 flex min-h-[150px] items-center gap-4 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 p-2">
            <img
              src={getTeamLogoSrc(teamCode)}
              alt={getTeamDisplayName(teamCode)}
              className="max-h-[94%] max-w-[94%] object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{getDisplayName(player)}</h3>

            <p className="mt-1 text-sm text-gray-300">
              {getTeamDisplayName(teamCode)} • {getPositionLabel(player.position)} •{" "}
              {player.games_played} GP
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#FFD54A]">
              {selectedSeasonLabel}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
