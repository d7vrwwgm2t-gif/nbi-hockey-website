import fs from "fs/promises";
import path from "path";
import type { PublicPlayerGrade } from "@/model/types";

export type SeasonBannerSlot =
  | "current"
  | "lastYear"
  | "twoYearsAgo"
  | "archive";

export type ModelSeasonMetadata = {
  league: string;
  season: string;
  displayLabel: string;
  bannerSlot: SeasonBannerSlot;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoredModelSeason = {
  league: string;
  season: string;
  generatedAt: string;
  playerCount: number;
  metadata: ModelSeasonMetadata;
  grades: PublicPlayerGrade[];
};

export type StoredModelSeasonSummary = {
  league: string;
  season: string;
  generatedAt: string;
  playerCount: number;
  metadata: ModelSeasonMetadata;
};

const MODEL_OUTPUT_ROOT = path.join(process.cwd(), "model-outputs");

function getSeasonFolder({ league, season }: { league: string; season: string }) {
  return path.join(MODEL_OUTPUT_ROOT, league.toLowerCase(), season);
}

function getGradesPath({ league, season }: { league: string; season: string }) {
  return path.join(getSeasonFolder({ league, season }), "public-grades.json");
}

function getMetadataPath({ league, season }: { league: string; season: string }) {
  return path.join(getSeasonFolder({ league, season }), "metadata.json");
}

function getDefaultMetadata({
  league,
  season,
}: {
  league: string;
  season: string;
}): ModelSeasonMetadata {
  const now = new Date().toISOString();

  return {
    league,
    season,
    displayLabel: season,
    bannerSlot: "archive",
    sortOrder: 999,
    isVisible: true,
    createdAt: now,
    updatedAt: now,
  };
}

export async function saveModelSeason({
  league,
  season,
  grades,
  metadata,
}: {
  league: string;
  season: string;
  grades: PublicPlayerGrade[];
  metadata?: Partial<ModelSeasonMetadata>;
}) {
  const folder = getSeasonFolder({ league, season });

  await fs.mkdir(folder, { recursive: true });

  const existingMetadata = await loadSeasonMetadata({ league, season }).catch(
    () => getDefaultMetadata({ league, season })
  );

  const mergedMetadata: ModelSeasonMetadata = {
    ...existingMetadata,
    ...metadata,
    league,
    season,
    updatedAt: new Date().toISOString(),
  };

  const payload: StoredModelSeason = {
    league,
    season,
    generatedAt: new Date().toISOString(),
    playerCount: grades.length,
    metadata: mergedMetadata,
    grades,
  };

  await fs.writeFile(
    getGradesPath({ league, season }),
    JSON.stringify(payload, null, 2),
    "utf-8"
  );

  await fs.writeFile(
    getMetadataPath({ league, season }),
    JSON.stringify(mergedMetadata, null, 2),
    "utf-8"
  );

  return payload;
}

export async function deleteModelSeason({
  league,
  season,
}: {
  league: string;
  season: string;
}) {
  const folder = getSeasonFolder({ league, season });

  await fs.rm(folder, {
    recursive: true,
    force: true,
  });

  return {
    league,
    season,
    deleted: true,
  };
}

export async function loadSeasonMetadata({
  league,
  season,
}: {
  league: string;
  season: string;
}) {
  const raw = await fs.readFile(getMetadataPath({ league, season }), "utf-8");

  return JSON.parse(raw) as ModelSeasonMetadata;
}

export async function updateSeasonMetadata({
  league,
  season,
  metadata,
}: {
  league: string;
  season: string;
  metadata: Partial<ModelSeasonMetadata>;
}) {
  const current = await loadSeasonMetadata({ league, season }).catch(() =>
    getDefaultMetadata({ league, season })
  );

  const updated: ModelSeasonMetadata = {
    ...current,
    ...metadata,
    league,
    season,
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(getSeasonFolder({ league, season }), { recursive: true });

  await fs.writeFile(
    getMetadataPath({ league, season }),
    JSON.stringify(updated, null, 2),
    "utf-8"
  );

  try {
    const existingSeason = await loadModelSeason({ league, season });
    const updatedSeason: StoredModelSeason = {
      ...existingSeason,
      metadata: updated,
    };

    await fs.writeFile(
      getGradesPath({ league, season }),
      JSON.stringify(updatedSeason, null, 2),
      "utf-8"
    );
  } catch {
    // Metadata can exist before grades are uploaded.
  }

  return updated;
}

export async function loadModelSeason({
  league,
  season,
}: {
  league: string;
  season: string;
}) {
  const raw = await fs.readFile(getGradesPath({ league, season }), "utf-8");
  const parsed = JSON.parse(raw) as StoredModelSeason;

  if (!parsed.metadata) {
    parsed.metadata = await loadSeasonMetadata({ league, season }).catch(() =>
      getDefaultMetadata({ league, season })
    );
  }

  return parsed;
}

export async function listModelSeasons(): Promise<StoredModelSeasonSummary[]> {
  try {
    const leagues = await fs.readdir(MODEL_OUTPUT_ROOT);
    const summaries: StoredModelSeasonSummary[] = [];

    for (const leagueFolderName of leagues) {
      const leagueFolder = path.join(MODEL_OUTPUT_ROOT, leagueFolderName);
      const leagueStat = await fs.stat(leagueFolder);

      if (!leagueStat.isDirectory()) continue;

      const seasons = await fs.readdir(leagueFolder);

      for (const season of seasons) {
        const folder = path.join(leagueFolder, season);
        const folderStat = await fs.stat(folder);

        if (!folderStat.isDirectory()) continue;

        try {
          const raw = await fs.readFile(
            path.join(folder, "public-grades.json"),
            "utf-8"
          );

          const parsed = JSON.parse(raw) as StoredModelSeason;
          const metadata =
            parsed.metadata ??
            (await loadSeasonMetadata({
              league: parsed.league,
              season: parsed.season,
            }).catch(() =>
              getDefaultMetadata({
                league: parsed.league,
                season: parsed.season,
              })
            ));

          summaries.push({
            league: parsed.league,
            season: parsed.season,
            generatedAt: parsed.generatedAt,
            playerCount: parsed.playerCount,
            metadata,
          });
        } catch {
          try {
            const metadataRaw = await fs.readFile(
              path.join(folder, "metadata.json"),
              "utf-8"
            );

            const metadata = JSON.parse(metadataRaw) as ModelSeasonMetadata;

            summaries.push({
              league: metadata.league,
              season: metadata.season,
              generatedAt: metadata.updatedAt,
              playerCount: 0,
              metadata,
            });
          } catch {
            continue;
          }
        }
      }
    }

    return summaries.sort((a, b) => {
      if (a.league !== b.league) return a.league.localeCompare(b.league);

      if (a.metadata.sortOrder !== b.metadata.sortOrder) {
        return a.metadata.sortOrder - b.metadata.sortOrder;
      }

      return b.season.localeCompare(a.season);
    });
  } catch {
    return [];
  }
}

export async function shiftSeasonBannerSlots({ league }: { league: string }) {
  const seasons = await listModelSeasons();
  const leagueSeasons = seasons.filter(
    (season) => season.league.toLowerCase() === league.toLowerCase()
  );

  const current = leagueSeasons.find(
    (season) => season.metadata.bannerSlot === "current"
  );
  const lastYear = leagueSeasons.find(
    (season) => season.metadata.bannerSlot === "lastYear"
  );
  const twoYearsAgo = leagueSeasons.find(
    (season) => season.metadata.bannerSlot === "twoYearsAgo"
  );

  const updated: ModelSeasonMetadata[] = [];

  if (twoYearsAgo) {
    updated.push(
      await updateSeasonMetadata({
        league: twoYearsAgo.league,
        season: twoYearsAgo.season,
        metadata: {
          displayLabel: "Archived",
          bannerSlot: "archive",
          sortOrder: 999,
          isVisible: false,
        },
      })
    );
  }

  if (lastYear) {
    updated.push(
      await updateSeasonMetadata({
        league: lastYear.league,
        season: lastYear.season,
        metadata: {
          displayLabel: "Two Years Ago",
          bannerSlot: "twoYearsAgo",
          sortOrder: 3,
          isVisible: true,
        },
      })
    );
  }

  if (current) {
    updated.push(
      await updateSeasonMetadata({
        league: current.league,
        season: current.season,
        metadata: {
          displayLabel: "Last Season",
          bannerSlot: "lastYear",
          sortOrder: 2,
          isVisible: true,
        },
      })
    );
  }

  return updated;
}