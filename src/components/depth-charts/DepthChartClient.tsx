"use client";

import { useMemo, useState } from "react";
import type { DepthChartTeam } from "@/lib/dailyFaceoff";
import LineupCard from "./LineupCard";

export default function DepthChartClient({ teams }: { teams: DepthChartTeam[] }) {
  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.teamName.localeCompare(b.teamName)),
    [teams]
  );

  const [selectedTeam, setSelectedTeam] = useState(
    sortedTeams[0]?.abbreviation ?? ""
  );

  const team = sortedTeams.find((item) => item.abbreviation === selectedTeam);

  if (!sortedTeams.length) {
    return (
      <div className="rounded-2xl border border-sky-300/20 bg-slate-900 p-6 text-slate-300">
        No depth chart data is available yet. Run the depth chart update script to generate{" "}
        <code className="rounded bg-slate-950 px-1 py-0.5">public/data/depth-charts.json</code>.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-semibold text-slate-300">
          Select team
          <select
            value={selectedTeam}
            onChange={(event) => setSelectedTeam(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white shadow sm:min-w-72"
          >
            {sortedTeams.map((team) => (
              <option key={team.abbreviation} value={team.abbreviation}>
                {team.teamName}
              </option>
            ))}
          </select>
        </label>

        <p className="text-sm text-slate-400">
          Data generated from Daily Faceoff and NHL roster data.
        </p>
      </div>

      {team ? (
        <LineupCard team={team} />
      ) : (
        <p className="text-slate-300">No lineup data found for this team.</p>
      )}
    </div>
  );
}
