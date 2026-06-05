import type { ParsedDataset, RawPlayerRow } from "./types";
import { makePlayerKey } from "./utils";

const NON_COUNTING_STAT_KEYS = new Set([
  "passAccuracy",
  "puckBattlesWonPct",
]);

function subtractNumbers(
  allValue: number | null | undefined,
  ppValue: number | null | undefined,
  pkValue: number | null | undefined
) {
  const all = allValue ?? 0;
  const pp = ppValue ?? 0;
  const pk = pkValue ?? 0;

  const result = all - pp - pk;

  return result < 0 ? 0 : result;
}

function indexByPlayerKey(players: RawPlayerRow[]) {
  return new Map(
    players.map((player) => [
      makePlayerKey(player.player, player.dateOfBirth),
      player,
    ])
  );
}

export function createBaseGameDataset({
  allSituations,
  powerPlay,
  penaltyKill,
}: {
  allSituations: ParsedDataset;
  powerPlay: ParsedDataset;
  penaltyKill: ParsedDataset;
}): ParsedDataset {
  const ppByPlayer = indexByPlayerKey(powerPlay.players);
  const pkByPlayer = indexByPlayerKey(penaltyKill.players);

  const basePlayers: RawPlayerRow[] = allSituations.players.map((allPlayer) => {
    const playerKey = makePlayerKey(allPlayer.player, allPlayer.dateOfBirth);
    const ppPlayer = ppByPlayer.get(playerKey);
    const pkPlayer = pkByPlayer.get(playerKey);

    const baseStats = Object.fromEntries(
      Object.entries(allPlayer.stats).map(([statKey, allValue]) => {
        if (NON_COUNTING_STAT_KEYS.has(statKey)) {
          return [statKey, null];
        }

        return [
          statKey,
          subtractNumbers(
            allValue,
            ppPlayer?.stats[statKey],
            pkPlayer?.stats[statKey]
          ),
        ];
      })
    );

    return {
      ...allPlayer,
      stats: baseStats,
    };
  });

  return {
    league: allSituations.league,
    season: allSituations.season,
    situation: "base",
    players: basePlayers,
    columnsFound: allSituations.columnsFound,
    missingAliases: [
      ...allSituations.missingAliases,
      ...powerPlay.missingAliases,
      ...penaltyKill.missingAliases,
    ],
  };
}
