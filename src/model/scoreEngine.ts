import type { MetricDefinition } from "./types";
import type { DerivedPlayerMetrics } from "./derivedMetrics";
import { getConfidenceLabel, getGpReliability } from "./reliability";
import { clamp, roundToNearestHalf } from "./utils";
import { getLetterGrade } from "./grades";

export type MetricScore = {
  metricKey: string;
  value: number | null;
  leagueAverage: number | null;
  referenceValue: number | null;
  stepSize: number | null;
  statScore: number | null;
};

export type CategoryScoreResult = {
  rawScore: number | null;
  normalizedScore: number | null;
  adjustedScore: number | null;
  letterGrade: string | null;
  confidenceLabel: "High Confidence" | "Moderate Confidence" | "Small Sample";
  metricScores: MetricScore[];
};

type GpCapPoint = {
  gp: number;
  capPercentile: number;
  multiplier: number;
};

const GP_CAP_POINTS: GpCapPoint[] = [
  { gp: 1, capPercentile: 10, multiplier: 0.5 },
  { gp: 5, capPercentile: 25, multiplier: 0.6 },
  { gp: 10, capPercentile: 40, multiplier: 0.75 },
  { gp: 20, capPercentile: 50, multiplier: 0.85 },
  { gp: 30, capPercentile: 70, multiplier: 0.9 },
  { gp: 40, capPercentile: 85, multiplier: 0.95 },
  { gp: 60, capPercentile: 99, multiplier: 0.97 },
  { gp: 82, capPercentile: 99, multiplier: 1.0 },
];

function mean(values: number[]) {
  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) return null;

  const sortedValues = [...values].sort((a, b) => a - b);
  const index = (percentileValue / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sortedValues[lower];

  const weight = index - lower;

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

function interpolateGpCap(gamesPlayed: number) {
  if (gamesPlayed >= 82) {
    return {
      capPercentile: 99,
      multiplier: 1.0,
    };
  }

  if (gamesPlayed <= 1) {
    return {
      capPercentile: 10,
      multiplier: 0.5,
    };
  }

  for (let i = 0; i < GP_CAP_POINTS.length - 1; i++) {
    const lower = GP_CAP_POINTS[i];
    const upper = GP_CAP_POINTS[i + 1];

    if (gamesPlayed >= lower.gp && gamesPlayed <= upper.gp) {
      const progress = (gamesPlayed - lower.gp) / (upper.gp - lower.gp);

      return {
        capPercentile:
          lower.capPercentile +
          progress * (upper.capPercentile - lower.capPercentile),
        multiplier:
          lower.multiplier + progress * (upper.multiplier - lower.multiplier),
      };
    }
  }

  return {
    capPercentile: 99,
    multiplier: 1.0,
  };
}

function getPositionGroup(position: string) {
  const normalized = position.toUpperCase().trim();

  if (normalized === "D") return "D";

  return "F";
}

function getMetricDistribution({
  players,
  metricKey,
  position,
}: {
  players: DerivedPlayerMetrics[];
  metricKey: string;
  position: string;
}) {
  const positionGroup = getPositionGroup(position);

  return players
    .filter((player) => getPositionGroup(player.position) === positionGroup)
    .map((player) => player.derived[metricKey])
    .filter((value): value is number => value !== null && value !== undefined);
}

function calculateStepSize({
  average,
  referenceValue,
  stepCount,
}: {
  average: number;
  referenceValue: number;
  stepCount: number;
}) {
  const difference = Math.abs(referenceValue - average);

  if (difference === 0) return null;

  return difference / stepCount;
}

function calculateMetricScore({
  playerValue,
  average,
  stepSize,
  weight,
  direction,
}: {
  playerValue: number;
  average: number;
  stepSize: number;
  weight: number;
  direction: MetricDefinition["direction"];
}) {
  const distanceFromAverage = (playerValue - average) / stepSize;

  const score =
    direction === "positive"
      ? 50 + distanceFromAverage * weight
      : 50 - distanceFromAverage * weight;

  return clamp(score);
}

function weightedAverage(
  values: {
    value: number;
    weight: number;
  }[]
) {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);

  if (!totalWeight) return null;

  const weightedSum = values.reduce(
    (sum, item) => sum + item.value * item.weight,
    0
  );

  return weightedSum / totalWeight;
}

export function calculateRawCategoryScores({
  players,
  metrics,
  stepCount,
}: {
  players: DerivedPlayerMetrics[];
  metrics: MetricDefinition[];
  stepCount: number;
}) {
  return players.map((player) => {
    const metricScores: MetricScore[] = metrics.map((metric) => {
      const distribution = getMetricDistribution({
        players,
        metricKey: metric.key,
        position: player.position,
      });

      const average = mean(distribution);
      const referenceValue =
        metric.direction === "positive"
          ? percentile(distribution, 95)
          : percentile(distribution, 5);

      const playerValue = player.derived[metric.key];

      if (
        playerValue === null ||
        playerValue === undefined ||
        average === null ||
        referenceValue === null
      ) {
        return {
          metricKey: metric.key,
          value: playerValue ?? null,
          leagueAverage: average,
          referenceValue,
          stepSize: null,
          statScore: null,
        };
      }

      const stepSize = calculateStepSize({
        average,
        referenceValue,
        stepCount,
      });

      if (stepSize === null || stepSize === 0) {
        return {
          metricKey: metric.key,
          value: playerValue,
          leagueAverage: average,
          referenceValue,
          stepSize,
          statScore: null,
        };
      }

      return {
        metricKey: metric.key,
        value: playerValue,
        leagueAverage: average,
        referenceValue,
        stepSize,
        statScore: calculateMetricScore({
          playerValue,
          average,
          stepSize,
          weight: metric.weight,
          direction: metric.direction,
        }),
      };
    });

    const usableMetricScores = metricScores
      .map((metricScore) => {
        const metric = metrics.find((item) => item.key === metricScore.metricKey);

        if (!metric || metricScore.statScore === null) return null;

        return {
          value: metricScore.statScore,
          weight: metric.weight,
        };
      })
      .filter((item): item is { value: number; weight: number } => item !== null);

    return {
      player,
      rawScore: weightedAverage(usableMetricScores),
      metricScores,
    };
  });
}

export function applyCategoryGpCaps(
  rawScores: {
    player: DerivedPlayerMetrics;
    rawScore: number | null;
    metricScores: MetricScore[];
  }[]
): {
  player: DerivedPlayerMetrics;
  result: CategoryScoreResult;
}[] {
  const validRawScores = rawScores
    .map((item) => item.rawScore)
    .filter((score): score is number => score !== null);

  return rawScores.map((item) => {
    const gpReliability = getGpReliability(item.player.gamesPlayed);
    const confidenceLabel = getConfidenceLabel(gpReliability);

    if (item.rawScore === null) {
      return {
        player: item.player,
        result: {
          rawScore: item.rawScore,
          normalizedScore: null,
          adjustedScore: null,
          letterGrade: null,
          confidenceLabel,
          metricScores: item.metricScores,
        },
      };
    }

    const { capPercentile, multiplier } = interpolateGpCap(
      item.player.gamesPlayed
    );

    const percentileCap = percentile(validRawScores, capPercentile);

    const multipliedScore = 50 + (item.rawScore - 50) * multiplier;

    const cappedScore =
      percentileCap === null
        ? multipliedScore
        : Math.min(multipliedScore, percentileCap);

    const adjustedScore = roundToNearestHalf(clamp(cappedScore));

    return {
      player: item.player,
      result: {
        rawScore: item.rawScore,
        normalizedScore: null,
        adjustedScore,
        letterGrade: getLetterGrade(adjustedScore),
        confidenceLabel,
        metricScores: item.metricScores,
      },
    };
  });
}

export function calculateCategoryScore({
  players,
  metrics,
  stepCount = 15,
}: {
  players: DerivedPlayerMetrics[];
  metrics: MetricDefinition[];
  stepCount?: number;
}) {
  const rawScores = calculateRawCategoryScores({
    players,
    metrics,
    stepCount,
  });

  return applyCategoryGpCaps(rawScores);
}
