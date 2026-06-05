"use client";

import { FormEvent, useEffect, useState } from "react";

type BannerSlot = "current" | "lastYear" | "twoYearsAgo" | "archive";

type SeasonSummary = {
  league: string;
  season: string;
  generatedAt: string;
  playerCount: number;
  metadata: {
    displayLabel: string;
    bannerSlot: BannerSlot;
    sortOrder: number;
    isVisible: boolean;
  };
};

type UploadResponse = {
  success: boolean;
  league?: string;
  season?: string;
  playerCount?: number;
  generatedAt?: string;
  error?: string;
  metadata?: SeasonSummary["metadata"];
  aliasAudit?: {
    allSituations: string[];
    powerPlay: string[];
    penaltyKill: string[];
  };
};

const slotLabels: Record<BannerSlot, string> = {
  current: "Current Season",
  lastYear: "Last Season",
  twoYearsAgo: "Two Years Ago",
  archive: "Archive",
};

export default function ModelUploadPage() {
  const [league, setLeague] = useState("NHL");
  const [season, setSeason] = useState("2025-26");
  const [displayLabel, setDisplayLabel] = useState("Current Season");
  const [bannerSlot, setBannerSlot] = useState<BannerSlot>("current");
  const [allSituationsFile, setAllSituationsFile] = useState<File | null>(null);
  const [powerPlayFile, setPowerPlayFile] = useState<File | null>(null);
  const [penaltyKillFile, setPenaltyKillFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [seasons, setSeasons] = useState<SeasonSummary[]>([]);
  const [isShifting, setIsShifting] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  async function loadSeasons() {
    const response = await fetch("/api/admin/model-seasons");
    const data = await response.json();

    if (data.success) {
      setSeasons(data.seasons);
    }
  }

  useEffect(() => {
    loadSeasons();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!allSituationsFile || !powerPlayFile || !penaltyKillFile) {
      setResult({
        success: false,
        error: "Please select all three files before uploading.",
      });
      return;
    }

    const formData = new FormData();

    formData.append("league", league);
    formData.append("season", season);
    formData.append("displayLabel", displayLabel);
    formData.append("bannerSlot", bannerSlot);
    formData.append("allSituations", allSituationsFile);
    formData.append("powerPlay", powerPlayFile);
    formData.append("penaltyKill", penaltyKillFile);

    setIsUploading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/model-upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

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
      setIsUploading(false);
    }
  }

  async function handleMetadataSave(seasonSummary: SeasonSummary) {
    const response = await fetch("/api/admin/model-season-metadata", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        league: seasonSummary.league,
        season: seasonSummary.season,
        displayLabel: seasonSummary.metadata.displayLabel,
        bannerSlot: seasonSummary.metadata.bannerSlot,
        sortOrder: seasonSummary.metadata.sortOrder,
        isVisible: seasonSummary.metadata.isVisible,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.error || "Could not save metadata.");
      return;
    }

    await loadSeasons();
  }

  async function handleDeleteSeason(seasonSummary: SeasonSummary) {
    const confirmed = window.confirm(
      `Delete ${seasonSummary.league} ${seasonSummary.season}? This will permanently remove the saved model output and metadata for this season.`
    );

    if (!confirmed) return;

    const deleteKey = `${seasonSummary.league}-${seasonSummary.season}`;
    setDeletingKey(deleteKey);

    try {
      const response = await fetch("/api/admin/model-season", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          league: seasonSummary.league,
          season: seasonSummary.season,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Could not delete season.");
        return;
      }

      await loadSeasons();
    } finally {
      setDeletingKey(null);
    }
  }

  async function handleShiftSeasons() {
    const confirmed = window.confirm(
      "Shift season labels down for this league? Current becomes Last Season, Last Season becomes Two Years Ago, and Two Years Ago is archived. This does not recalculate any data."
    );

    if (!confirmed) return;

    setIsShifting(true);

    try {
      const response = await fetch("/api/admin/model-shift-seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ league }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Could not shift seasons.");
      }

      await loadSeasons();
    } finally {
      setIsShifting(false);
    }
  }

  const hasAliasIssues =
    result?.aliasAudit &&
    (result.aliasAudit.allSituations.length > 0 ||
      result.aliasAudit.powerPlay.length > 0 ||
      result.aliasAudit.penaltyKill.length > 0);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Model Upload</h1>

      <p style={{ marginBottom: 28, color: "#666", lineHeight: 1.6 }}>
        Upload one league and season at a time. Each season is calculated
        independently, so league averages, percentile caps, and category
        distributions only apply to that specific season.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: 20,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 16,
          marginBottom: 32,
        }}
      >
        <label style={{ display: "grid", gap: 8 }}>
          League
          <select
            value={league}
            onChange={(event) => setLeague(event.target.value)}
            style={{ padding: 12, borderRadius: 8 }}
          >
            <option value="NHL">NHL</option>
            <option value="AHL">AHL</option>
            <option value="WHL">WHL</option>
            <option value="OHL">OHL</option>
            <option value="QMJHL">QMJHL</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Season
          <input
            value={season}
            onChange={(event) => setSeason(event.target.value)}
            placeholder="2025-26"
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Display Label
          <input
            value={displayLabel}
            onChange={(event) => setDisplayLabel(event.target.value)}
            placeholder="Current Season"
            style={{ padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Banner Slot
          <select
            value={bannerSlot}
            onChange={(event) => setBannerSlot(event.target.value as BannerSlot)}
            style={{ padding: 12, borderRadius: 8 }}
          >
            {Object.entries(slotLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          All Situations Spreadsheet
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) =>
              setAllSituationsFile(event.target.files?.[0] ?? null)
            }
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Power Play Spreadsheet
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) =>
              setPowerPlayFile(event.target.files?.[0] ?? null)
            }
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          Penalty Kill Spreadsheet
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) =>
              setPenaltyKillFile(event.target.files?.[0] ?? null)
            }
          />
        </label>

        <button
          type="submit"
          disabled={isUploading}
          style={{
            padding: "14px 18px",
            borderRadius: 10,
            border: "none",
            cursor: isUploading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {isUploading ? "Processing..." : "Upload and Calculate Season"}
        </button>
      </form>

      {result && (
        <section
          style={{
            marginBottom: 32,
            padding: 24,
            borderRadius: 16,
            border: result.success ? "1px solid #9ad29a" : "1px solid #e5a1a1",
            background: result.success ? "#f2fbf2" : "#fff5f5",
          }}
        >
          {result.success ? (
            <>
              <h2 style={{ marginTop: 0 }}>Season processed successfully</h2>
              <p>
                <strong>{result.league}</strong> {result.season} saved with{" "}
                <strong>{result.playerCount}</strong> player grades.
              </p>
              <p style={{ color: "#666" }}>
                Generated at: {result.generatedAt}
              </p>

              {hasAliasIssues ? (
                <div>
                  <h3>Alias warnings</h3>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(result.aliasAudit, null, 2)}
                  </pre>
                </div>
              ) : (
                <p>No missing aliases found.</p>
              )}
            </>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>Upload failed</h2>
              <p>{result.error}</p>
            </>
          )}
        </section>
      )}

      <section
        style={{
          display: "grid",
          gap: 16,
          padding: 24,
          border: "1px solid #ddd",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Season Labels</h2>
            <p style={{ color: "#666", marginBottom: 0 }}>
              Edit how each uploaded season appears on the stat pages. This does
              not recalculate the model.
            </p>
          </div>

          <button
            type="button"
            onClick={handleShiftSeasons}
            disabled={isShifting}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: isShifting ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {isShifting ? "Shifting..." : "Shift Seasons Down"}
          </button>
        </div>

        {seasons.length === 0 ? (
          <p>No seasons uploaded yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {seasons.map((seasonSummary, index) => (
              <SeasonMetadataRow
                key={`${seasonSummary.league}-${seasonSummary.season}`}
                seasonSummary={seasonSummary}
                isDeleting={
                  deletingKey === `${seasonSummary.league}-${seasonSummary.season}`
                }
                onChange={(updated) => {
                  setSeasons((current) => {
                    const next = [...current];
                    next[index] = updated;
                    return next;
                  });
                }}
                onSave={handleMetadataSave}
                onDelete={handleDeleteSeason}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SeasonMetadataRow({
  seasonSummary,
  isDeleting,
  onChange,
  onSave,
  onDelete,
}: {
  seasonSummary: SeasonSummary;
  isDeleting: boolean;
  onChange: (seasonSummary: SeasonSummary) => void;
  onSave: (seasonSummary: SeasonSummary) => void;
  onDelete: (seasonSummary: SeasonSummary) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 100px 90px 90px",
        gap: 12,
        alignItems: "center",
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <div>
        <strong>
          {seasonSummary.league} {seasonSummary.season}
        </strong>
        <div style={{ color: "#666", fontSize: 13 }}>
          {seasonSummary.playerCount} players
        </div>
      </div>

      <input
        value={seasonSummary.metadata.displayLabel}
        onChange={(event) =>
          onChange({
            ...seasonSummary,
            metadata: {
              ...seasonSummary.metadata,
              displayLabel: event.target.value,
            },
          })
        }
        style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
      />

      <select
        value={seasonSummary.metadata.bannerSlot}
        onChange={(event) =>
          onChange({
            ...seasonSummary,
            metadata: {
              ...seasonSummary.metadata,
              bannerSlot: event.target.value as BannerSlot,
            },
          })
        }
        style={{ padding: 10, borderRadius: 8 }}
      >
        {Object.entries(slotLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={seasonSummary.metadata.isVisible}
          onChange={(event) =>
            onChange({
              ...seasonSummary,
              metadata: {
                ...seasonSummary.metadata,
                isVisible: event.target.checked,
              },
            })
          }
        />
        Visible
      </label>

      <button
        type="button"
        onClick={() => onSave(seasonSummary)}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Save
      </button>

      <button
        type="button"
        onClick={() => onDelete(seasonSummary)}
        disabled={isDeleting}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #d66",
          color: "#b00020",
          cursor: isDeleting ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
