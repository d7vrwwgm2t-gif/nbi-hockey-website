import { CATEGORY_DEFINITIONS } from "./categories";
import type { DerivedPlayerMetrics } from "./derivedMetrics";
import type { CategoryScoreResult } from "./scoreEngine";
import { calculateCategoryScore } from "./scoreEngine";

export type CategoryKey =
  | "finishing"
  | "playmaking"
  | "transition"
  | "puckManagement"
  | "suppression"
  | "forechecking"
  | "powerPlay"
  | "penaltyKill";

export type PlayerCategoryResults = {
  player: DerivedPlayerMetrics;
  categories: Partial<Record<CategoryKey, CategoryScoreResult>>;
};

const CATEGORY_STEP_COUNTS: Partial<Record<CategoryKey, number>> = {
  transition: 17,
  puckManagement: 25,
  suppression: 25,
  forechecking: 22,
  penaltyKill: 25,
};

function getStepCountForCategory(category: CategoryKey) {
  return CATEGORY_STEP_COUNTS[category] ?? 15;
}

function hasAnyMetricActivity(
  player: DerivedPlayerMetrics,
  category: "powerPlay" | "penaltyKill"
) {
  const metrics = CATEGORY_DEFINITIONS[category];

  return metrics.some((metric) => {
    const value = player.derived[metric.key];

    return value !== null && value !== undefined && value > 0;
  });
}

export function calculateCategoryForDataset({
  players,
  category,
}: {
  players: DerivedPlayerMetrics[];
  category: CategoryKey;
}) {
  const metrics = CATEGORY_DEFINITIONS[category];

  if (!metrics) {
    return players.map((player) => ({
      player,
      result: null,
    }));
  }

  return calculateCategoryScore({
    players,
    metrics,
    stepCount: getStepCountForCategory(category),
  });
}

export function calculateBaseGameCategories(players: DerivedPlayerMetrics[]) {
  const categoryKeys: CategoryKey[] = [
    "finishing",
    "playmaking",
    "transition",
    "puckManagement",
    "suppression",
    "forechecking",
  ];

  const resultsByPlayer = new Map<string, PlayerCategoryResults>();

  for (const player of players) {
    const key = `${player.player}|${player.dateOfBirth}`;

    resultsByPlayer.set(key, {
      player,
      categories: {},
    });
  }

  for (const category of categoryKeys) {
    const categoryResults = calculateCategoryForDataset({
      players,
      category,
    });

    for (const item of categoryResults) {
      const key = `${item.player.player}|${item.player.dateOfBirth}`;
      const current = resultsByPlayer.get(key);

      if (!current) continue;

      current.categories[category] = item.result;
    }
  }

  return Array.from(resultsByPlayer.values());
}

export function calculateSituationCategory({
  players,
  category,
}: {
  players: DerivedPlayerMetrics[];
  category: "powerPlay" | "penaltyKill";
}) {
  const activePlayers = players.filter((player) =>
    hasAnyMetricActivity(player, category)
  );

  return calculateCategoryForDataset({
    players: activePlayers,
    category,
  });
}
