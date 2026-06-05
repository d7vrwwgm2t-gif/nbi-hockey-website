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

type Player = {
  playerId: number | string;
  season: number | string;
  name: string;
  team: string;
  position: string;
  games_played: number;
};

type SeasonsResponse = {
  success: boolean;
  seasons: MoneyPuckSeason[];
};

type PlayersResponse = {
  success: boolean;
  rows: Player[];
};

function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function playerMatchesSearch(player: Player, search: string) {
  const normalizedSearch = normalizeSearch(search);

  if (!normalizedSearch) return false;

  const fullName = normalizeSearch(player.name);
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

        return a.name.localeCompare(b.name);
      })
      .slice(0, 12);
  }, [players, search]);

  const selectedSeasonLabel =
    seasons.find((season) => season.season === selectedSeason)?.displayLabel ??
    selectedSeason;

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <section className="mb-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            NBI Hockey Cards
          </p>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            Player Cards
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Search for a skater and open their MoneyPuck-based percentile card.
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-6">
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

            <label className="relative grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Search Player
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Type a first or last name..."
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              />

              {search.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-[76px] z-20 overflow-hidden rounded-xl border border-white/10 bg-[#07111F] shadow-2xl">
                  {isLoadingPlayers ? (
                    <div className="px-4 py-4 text-sm text-gray-400">
                      Loading players...
                    </div>
                  ) : matchingPlayers.length > 0 ? (
                    <div className="max-h-[420px] overflow-y-auto">
                      {matchingPlayers.map((player) => (
                        <Link
                          key={`${selectedSeason}-${player.playerId}-${player.team}-${player.position}`}
                          href={`/cards/players/${player.playerId}?season=${encodeURIComponent(
                            selectedSeason
                          )}`}
                          className="flex items-center justify-between border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-white/5"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {player.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {player.team} • {player.position} •{" "}
                              {selectedSeasonLabel}
                            </div>
                          </div>

                          <div className="text-sm text-gray-500">
                            {player.games_played} GP
                          </div>
                        </Link>
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
              Showing search options from {selectedSeasonLabel}. Start typing at
              least two letters to find a player.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
