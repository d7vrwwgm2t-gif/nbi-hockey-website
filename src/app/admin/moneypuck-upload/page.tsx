"use client";

import { FormEvent, useEffect, useState } from "react";

type DatasetType = "skaters" | "goalies" | "teams";

type MoneyPuckSeasonMetadata = {
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

type UploadResult = {
  success: boolean;
  error?: string;
  season?: string;
  displayLabel?: string;
  datasetType?: DatasetType;
  rawRowCount?: number;
  savedRowCount?: number;
};

const DATASET_LABELS: Record<DatasetType, string> = {
  skaters: "Skaters",
  goalies: "Goalies",
  teams: "Teams",
};

export default function MoneyPuckUploadPage() {
  const [season, setSeason] = useState("2008-09");
  const [displayLabel, setDisplayLabel] = useState("2008-09");
  const [files, setFiles] = useState<Record<DatasetType, File | null>>({
    skaters: null,
    goalies: null,
    teams: null,
  });
  const [isUploading, setIsUploading] = useState<DatasetType | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [seasons, setSeasons] = useState<MoneyPuckSeasonMetadata[]>([]);
  const [deletingSeason, setDeletingSeason] = useState<string | null>(null);

  async function loadSeasons() {
    const response = await fetch("/api/admin/moneypuck-seasons");
    const data = await response.json();

    if (data.success) {
      setSeasons(data.seasons);
    }
  }

  useEffect(() => {
    loadSeasons();
  }, []);

  async function uploadDataset(datasetType: DatasetType) {
    const file = files[datasetType];

    if (!file) {
      setResult({
        success: false,
        error: `Please choose a ${DATASET_LABELS[datasetType]} CSV first.`,
      });
      return;
    }

    const formData = new FormData();

    formData.append("season", season);
    formData.append("displayLabel", displayLabel);
    formData.append("datasetType", datasetType);
    formData.append("file", file);

    setIsUploading(datasetType);
    setResult(null);

    try {
      const response = await fetch("/api/admin/moneypuck-upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResult;

      setResult(data);

      if (data.success) {
        await loadSeasons();
      }
    } catch (error) {
      setResult({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown upload error.",
      });
    } finally {
      setIsUploading(null);
    }
  }

  async function deleteSeason(targetSeason: string) {
    const confirmed = window.confirm(
      `Delete MoneyPuck data for ${targetSeason}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingSeason(targetSeason);

    try {
      const response = await fetch("/api/admin/moneypuck-season", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ season: targetSeason }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Could not delete season.");
        return;
      }

      await loadSeasons();
    } finally {
      setDeletingSeason(null);
    }
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <section className="mb-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Admin
          </p>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            MoneyPuck Upload
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Upload season-level MoneyPuck CSV files for skaters, goalies, and
            teams. Skater and goalie files are filtered to all situations only
            and players under 10 games are excluded.
          </p>
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Season
              </span>
              <input
                value={season}
                onChange={(event) => {
                  setSeason(event.target.value);
                  setDisplayLabel(event.target.value);
                }}
                placeholder="2008-09"
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-gray-300">
                Display Label
              </span>
              <input
                value={displayLabel}
                onChange={(event) => setDisplayLabel(event.target.value)}
                placeholder="2008-09"
                className="rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
              />
            </label>
          </div>
        </section>

        <section className="mb-8 grid gap-6 md:grid-cols-3">
          {(["skaters", "goalies", "teams"] as DatasetType[]).map(
            (datasetType) => (
              <form
                key={datasetType}
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  uploadDataset(datasetType);
                }}
                className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-6"
              >
                <h2 className="mb-3 text-2xl font-bold">
                  {DATASET_LABELS[datasetType]}
                </h2>

                <p className="mb-5 text-sm text-gray-400">
                  Upload the MoneyPuck {DATASET_LABELS[datasetType].toLowerCase()} CSV.
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={(event) =>
                    setFiles((current) => ({
                      ...current,
                      [datasetType]: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="mb-5 block w-full text-sm text-gray-300"
                />

                <button
                  type="submit"
                  disabled={isUploading === datasetType}
                  className="w-full rounded-lg bg-[#4DB5FF] px-4 py-3 font-semibold text-[#07111F] transition hover:bg-[#FFD54A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading === datasetType
                    ? "Uploading..."
                    : `Upload ${DATASET_LABELS[datasetType]}`}
                </button>
              </form>
            )
          )}
        </section>

        {result && (
          <section
            className={`mb-8 rounded-xl border p-6 ${
              result.success
                ? "border-green-400/30 bg-green-500/10 text-green-100"
                : "border-red-400/30 bg-red-500/10 text-red-100"
            }`}
          >
            {result.success ? (
              <p>
                Uploaded {result.datasetType} for {result.season}. Saved{" "}
                {result.savedRowCount} rows from {result.rawRowCount} raw rows.
              </p>
            ) : (
              <p>{result.error}</p>
            )}
          </section>
        )}

        <section className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Uploaded Seasons</h2>
            <button
              type="button"
              onClick={loadSeasons}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:border-[#FFD54A] hover:text-[#FFD54A]"
            >
              Refresh
            </button>
          </div>

          {seasons.length === 0 ? (
            <p className="text-gray-400">No MoneyPuck seasons uploaded yet.</p>
          ) : (
            <div className="grid gap-4">
              {seasons.map((seasonItem) => (
                <div
                  key={seasonItem.season}
                  className="flex flex-col gap-4 rounded-lg border border-white/10 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold">
                      {seasonItem.displayLabel}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Skaters: {seasonItem.counts.skaters} • Goalies:{" "}
                      {seasonItem.counts.goalies} • Teams:{" "}
                      {seasonItem.counts.teams}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["skaters", "goalies", "teams"] as DatasetType[]).map(
                      (datasetType) => (
                        <span
                          key={datasetType}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            seasonItem.datasets[datasetType]
                              ? "bg-green-500/15 text-green-300"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {DATASET_LABELS[datasetType]}
                        </span>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => deleteSeason(seasonItem.season)}
                      disabled={deletingSeason === seasonItem.season}
                      className="rounded-full border border-red-400/40 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {deletingSeason === seasonItem.season
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
