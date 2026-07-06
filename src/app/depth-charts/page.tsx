import DepthChartClient from "@/components/depth-charts/DepthChartClient";
import { getDepthCharts } from "@/lib/dailyFaceoff";

export const revalidate = 900;

export default async function DepthChartsPage() {
  const teams = await getDepthCharts();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold tracking-tight">NHL Depth Charts</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Projected lines, pairings, special teams, goalies, injuries, and roster-based healthy scratches.
        </p>

        <div className="mt-8">
          <DepthChartClient teams={teams} />
        </div>
      </div>
    </main>
  );
}