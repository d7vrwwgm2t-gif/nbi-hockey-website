"use client";

import { useState } from "react";
import type { DepthChartTeam } from "@/lib/dailyFaceoff";
import LineupCard from "./LineupCard";

export default function DepthChartClient({ teams }: { teams: DepthChartTeam[] }) {
  const [selected, setSelected] = useState(teams[0]?.abbreviation ?? "");

  const team = teams.find((t) => t.abbreviation === selected);

  if (!team) {
    return <p className="text-slate-300">No lineup data available.</p>;
  }

  return (
    <div>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="mb-6 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white"
      >
        {teams.map((team) => (
          <option key={team.abbreviation} value={team.abbreviation}>
            {team.teamName}
          </option>
        ))}
      </select>

      <LineupCard team={team} />
    </div>
  );
}