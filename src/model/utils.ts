export function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .replace(/[%]/g, "percent")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizePlayerName(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function makePlayerKey(player: string, dateOfBirth: string) {
  return `${normalizePlayerName(player)}|${String(dateOfBirth).trim()}`;
}

function parseTimeStringToMinutes(value: string) {
  const parts = value
    .split(":")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes + seconds / 60;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 60 + minutes + seconds / 60;
  }

  return null;
}

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return 0;
  if (value === "-") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value).trim();

  if (raw === "") return 0;

  if (raw.includes(":")) {
    return parseTimeStringToMinutes(raw);
  }

  const cleaned = raw
    .replace("%", "")
    .replace(",", "")
    .trim();

  if (cleaned === "-" || cleaned === "") return 0;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clamp(value: number, min = 1, max = 99) {
  return Math.min(max, Math.max(min, value));
}

export function roundToNearestHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function safeDivide(numerator: number | null | undefined, denominator: number | null | undefined) {
  if (numerator === null || numerator === undefined) return null;
  if (!denominator) return null;
  return numerator / denominator;
}
