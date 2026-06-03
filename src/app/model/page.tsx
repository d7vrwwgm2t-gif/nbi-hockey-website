export default function ModelPage() {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <section className="mb-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Coming Soon
          </p>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            NBI Hockey Model
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            A custom hockey analytics platform built to evaluate players,
            teams, roles, and performance through a blend of statistical
            research, data visualization, and contextual analysis.
          </p>
        </section>

        <section className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4DB5FF]">
              Player Ratings
            </p>

            <h2 className="mb-4 text-3xl font-bold">
              Custom Player Evaluation
            </h2>

            <p className="text-gray-300">
              Future player cards will include overall ratings, offensive
              grades, defensive grades, power play impact, penalty kill impact,
              role adjustments, and model-driven player comparisons.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4DB5FF]">
              Team Ratings
            </p>

            <h2 className="mb-4 text-3xl font-bold">
              Roster-Level Analysis
            </h2>

            <p className="text-gray-300">
              The team model will evaluate roster strength by forward depth,
              defensive structure, goaltending, special teams, and overall team
              profile.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4DB5FF]">
              Research
            </p>

            <h2 className="mb-4 text-3xl font-bold">
              Data-Driven Methodology
            </h2>

            <p className="text-gray-300">
              The model will be built from original research, historical trends,
              repeatability studies, role context, and multi-season performance
              analysis.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#4DB5FF]">
              Dashboards
            </p>

            <h2 className="mb-4 text-3xl font-bold">
              Interactive Tools
            </h2>

            <p className="text-gray-300">
              Future dashboards will allow users to explore rankings, filter by
              team or position, compare players, and view model outputs in a
              clean visual format.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Development Roadmap
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            Planned Model Sections
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 p-5">
              <h3 className="mb-2 font-semibold text-[#4DB5FF]">
                Players
              </h3>
              <p className="text-sm text-gray-400">
                Ratings, roles, profiles, and rankings.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 p-5">
              <h3 className="mb-2 font-semibold text-[#4DB5FF]">
                Teams
              </h3>
              <p className="text-sm text-gray-400">
                Lineup strength, team profiles, and depth charts.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 p-5">
              <h3 className="mb-2 font-semibold text-[#4DB5FF]">
                Methodology
              </h3>
              <p className="text-sm text-gray-400">
                Transparent explanations of model logic.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 p-5">
              <h3 className="mb-2 font-semibold text-[#4DB5FF]">
                Leaderboards
              </h3>
              <p className="text-sm text-gray-400">
                Top players, teams, and category leaders.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}