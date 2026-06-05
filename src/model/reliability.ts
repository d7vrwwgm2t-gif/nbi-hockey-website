const GP_RELIABILITY_POINTS = [
  { gp: 1, reliability: 0.4 },
  { gp: 5, reliability: 0.55 },
  { gp: 10, reliability: 0.7 },
  { gp: 20, reliability: 0.8 },
  { gp: 40, reliability: 0.9 },
  { gp: 60, reliability: 0.95 },
  { gp: 82, reliability: 1.0 },
];

const SPECIAL_TEAMS_MINUTE_RELIABILITY_POINTS = [
  { minutes: 0, reliability: 0.0 },
  { minutes: 5, reliability: 0.35 },
  { minutes: 10, reliability: 0.5 },
  { minutes: 25, reliability: 0.7 },
  { minutes: 50, reliability: 0.85 },
  { minutes: 100, reliability: 0.95 },
  { minutes: 150, reliability: 1.0 },
];

function interpolateReliability({
  value,
  points,
  valueKey,
}: {
  value: number;
  points: Record<string, number>[];
  valueKey: string;
}) {
  const first = points[0];
  const last = points[points.length - 1];

  if (value <= first[valueKey]) return first.reliability;
  if (value >= last[valueKey]) return last.reliability;

  for (let i = 0; i < points.length - 1; i++) {
    const lower = points[i];
    const upper = points[i + 1];

    if (value >= lower[valueKey] && value <= upper[valueKey]) {
      const progress =
        (value - lower[valueKey]) / (upper[valueKey] - lower[valueKey]);

      return lower.reliability + progress * (upper.reliability - lower.reliability);
    }
  }

  return last.reliability;
}

export function getGpReliability(gamesPlayed: number) {
  return interpolateReliability({
    value: gamesPlayed,
    points: GP_RELIABILITY_POINTS,
    valueKey: "gp",
  });
}

export function getSpecialTeamsMinuteReliability(minutesPlayed: number) {
  return interpolateReliability({
    value: minutesPlayed,
    points: SPECIAL_TEAMS_MINUTE_RELIABILITY_POINTS,
    valueKey: "minutes",
  });
}

export function getConfidenceLabel(reliability: number) {
  if (reliability >= 0.9) return "High Confidence";
  if (reliability >= 0.75) return "Moderate Confidence";
  return "Small Sample";
}

export function applyReliability(score: number, reliabilityOrGamesPlayed: number) {
  const reliability =
    reliabilityOrGamesPlayed <= 1
      ? reliabilityOrGamesPlayed
      : getGpReliability(reliabilityOrGamesPlayed);

  return 50 + ((score - 50) * reliability);
}
