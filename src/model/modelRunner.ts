import type { ParsedDataset, PublicPlayerGrade } from "./types";
import { createBaseGameDataset } from "./baseGame";
import { deriveDatasetMetrics } from "./derivedMetrics";
import {
  calculateBaseGameCategories,
  calculateSituationCategory,
} from "./categoryCalculator";
import { getConfidenceLabel, getGpReliability } from "./reliability";
import { makePlayerKey } from "./utils";

function emptyCategoryResult() {
  return {
    score: null,
    letterGrade: null,
  };
}

function toPublicCategory(result: {
  adjustedScore: number | null;
  letterGrade: string | null;
} | null | undefined) {
  if (!result) return emptyCategoryResult();

  return {
    score: result.adjustedScore,
    letterGrade: result.letterGrade,
  };
}

export function runModelForSeason({
  allSituations,
  powerPlay,
  penaltyKill,
}: {
  allSituations: ParsedDataset;
  powerPlay: ParsedDataset;
  penaltyKill: ParsedDataset;
}): PublicPlayerGrade[] {
  const baseGameDataset = createBaseGameDataset({
    allSituations,
    powerPlay,
    penaltyKill,
  });

  const baseGamePlayers = deriveDatasetMetrics(baseGameDataset.players);
  const powerPlayPlayers = deriveDatasetMetrics(powerPlay.players);
  const penaltyKillPlayers = deriveDatasetMetrics(penaltyKill.players);

  const baseResults = calculateBaseGameCategories(baseGamePlayers);

  const powerPlayResults = calculateSituationCategory({
    players: powerPlayPlayers,
    category: "powerPlay",
  });

  const penaltyKillResults = calculateSituationCategory({
    players: penaltyKillPlayers,
    category: "penaltyKill",
  });

  const powerPlayByPlayer = new Map(
    powerPlayResults.map((item) => [
      makePlayerKey(item.player.player, item.player.dateOfBirth),
      item.result,
    ])
  );

  const penaltyKillByPlayer = new Map(
    penaltyKillResults.map((item) => [
      makePlayerKey(item.player.player, item.player.dateOfBirth),
      item.result,
    ])
  );

  return baseResults.map((item) => {
    const player = item.player;
    const playerKey = makePlayerKey(player.player, player.dateOfBirth);

    const reliability = getGpReliability(player.gamesPlayed);
    const confidenceLabel = getConfidenceLabel(reliability);

    return {
      player: player.player,
      team: player.team,
      position: player.position,
      confidenceLabel,
      finishing: toPublicCategory(item.categories.finishing),
      playmaking: toPublicCategory(item.categories.playmaking),
      transition: toPublicCategory(item.categories.transition),
      puckManagement: toPublicCategory(item.categories.puckManagement),
      suppression: toPublicCategory(item.categories.suppression),
      forechecking: toPublicCategory(item.categories.forechecking),
      powerPlay: toPublicCategory(powerPlayByPlayer.get(playerKey)),
      penaltyKill: toPublicCategory(penaltyKillByPlayer.get(playerKey)),
    };
  });
}
