import fs from "fs/promises";
import path from "path";

export type MoneyPuckDatasetType = "skaters" | "goalies" | "teams";

export type MoneyPuckSeasonMetadata = {
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

export type MoneyPuckRow = Record<string, string | number | null>;

const MONEYPUCK_ROOT = path.join(process.cwd(), "moneypuck-data");

function getSeasonFolder(season: string) {
  return path.join(MONEYPUCK_ROOT, season);
}

function getDatasetPath(season: string, datasetType: MoneyPuckDatasetType) {
  return path.join(getSeasonFolder(season), `${datasetType}.json`);
}

function getMetadataPath(season: string) {
  return path.join(getSeasonFolder(season), "metadata.json");
}

function getDefaultMetadata(season: string): MoneyPuckSeasonMetadata {
  return {
    season,
    displayLabel: season,
    generatedAt: new Date().toISOString(),
    datasets: {
      skaters: false,
      goalies: false,
      teams: false,
    },
    counts: {
      skaters: 0,
      goalies: 0,
      teams: 0,
    },
  };
}

export async function loadMoneyPuckSeasonMetadata(season: string) {
  const raw = await fs.readFile(getMetadataPath(season), "utf-8");

  return JSON.parse(raw) as MoneyPuckSeasonMetadata;
}

export async function saveMoneyPuckDataset({
  season,
  displayLabel,
  datasetType,
  rows,
}: {
  season: string;
  displayLabel: string;
  datasetType: MoneyPuckDatasetType;
  rows: MoneyPuckRow[];
}) {
  const folder = getSeasonFolder(season);

  await fs.mkdir(folder, { recursive: true });

  const existingMetadata = await loadMoneyPuckSeasonMetadata(season).catch(() =>
    getDefaultMetadata(season)
  );

  const metadata: MoneyPuckSeasonMetadata = {
    ...existingMetadata,
    season,
    displayLabel,
    generatedAt: new Date().toISOString(),
    datasets: {
      ...existingMetadata.datasets,
      [datasetType]: true,
    },
    counts: {
      ...existingMetadata.counts,
      [datasetType]: rows.length,
    },
  };

  await fs.writeFile(
    getDatasetPath(season, datasetType),
    JSON.stringify(rows, null, 2),
    "utf-8"
  );

  await fs.writeFile(
    getMetadataPath(season),
    JSON.stringify(metadata, null, 2),
    "utf-8"
  );

  return metadata;
}

export async function loadMoneyPuckDataset({
  season,
  datasetType,
}: {
  season: string;
  datasetType: MoneyPuckDatasetType;
}) {
  const raw = await fs.readFile(getDatasetPath(season, datasetType), "utf-8");

  return JSON.parse(raw) as MoneyPuckRow[];
}

export async function listMoneyPuckSeasons() {
  try {
    const seasons = await fs.readdir(MONEYPUCK_ROOT);
    const metadataList: MoneyPuckSeasonMetadata[] = [];

    for (const season of seasons) {
      try {
        const metadata = await loadMoneyPuckSeasonMetadata(season);
        metadataList.push(metadata);
      } catch {
        continue;
      }
    }

    return metadataList.sort((a, b) => b.season.localeCompare(a.season));
  } catch {
    return [];
  }
}

export async function deleteMoneyPuckSeason(season: string) {
  const folder = getSeasonFolder(season);

  await fs.rm(folder, {
    recursive: true,
    force: true,
  });

  return {
    season,
    deleted: true,
  };
}
