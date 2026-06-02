export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <section className="mb-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">
            NBI Hockey
          </p>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            Hockey Analysis Built Around Data.
          </h1>

          <p className="max-w-3xl text-xl text-gray-400">
            Research, player evaluation, team analysis, and custom hockey
            analytics designed to bring context to the game.
          </p>
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Featured Analysis</h2>

          <div className="rounded-xl border border-white/10 bg-zinc-900 p-8">
            <h3 className="mb-3 text-2xl font-semibold">
              Secondary Assist Repeatability Study
            </h3>

            <p className="text-gray-400">
              An examination of whether NHL forwards consistently generate
              offense through similar distributions of goals, primary assists,
              and secondary assists over multiple seasons.
            </p>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-3xl font-bold">Latest Articles</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
              <h3 className="mb-2 font-semibold">
                Canadiens Offseason Outlook
              </h3>
              <p className="text-sm text-gray-400">
                Breaking down Montreal's needs heading into the summer.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
              <h3 className="mb-2 font-semibold">
                The Value of Secondary Assists
              </h3>
              <p className="text-sm text-gray-400">
                How repeatable are secondary assists from season to season?
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
              <h3 className="mb-2 font-semibold">
                NHL Playoff Probability Research
              </h3>
              <p className="text-sm text-gray-400">
                What happens when teams fall five points out of a playoff spot?
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-8">
          <h2 className="mb-4 text-3xl font-bold">
            Coming Soon: NBI Hockey Model
          </h2>

          <p className="max-w-3xl text-gray-300">
            Custom player ratings, team projections, analytics dashboards, and
            model-driven insights built from original research and statistical
            analysis.
          </p>
        </section>
      </div>
    </main>
  );
}