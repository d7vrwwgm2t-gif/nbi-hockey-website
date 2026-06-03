export default function ModelPage() {
  const seasons = [
    "Current Season",
    "Last Season",
    "Two Years Ago",
  ];

  const datasets = [
    "Even Strength / Primary Dataset",
    "Power Play Dataset",
    "Penalty Kill Dataset",
  ];

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <section className="mb-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            NBI Model
          </p>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            Model Administration
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Future home of the NBI Hockey player and team rating model.
            Dataset management, uploads, calculations, and league administration
            will be handled here.
          </p>
        </section>

        <div className="space-y-10">
          {seasons.map((season) => (
            <section
              key={season}
              className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8"
            >
              <h2 className="mb-6 text-3xl font-bold">{season}</h2>

              <div className="grid gap-4">
                {datasets.map((dataset) => (
                  <div
                    key={dataset}
                    className="flex flex-col gap-4 rounded-lg border border-white/10 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{dataset}</h3>

                      <p className="text-sm text-gray-400">
                        Upload functionality coming soon.
                      </p>
                    </div>

                    <button
                      disabled
                      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-500"
                    >
                      Upload
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-xl border border-[#FFD54A]/20 bg-[#0D1B2A]/95 p-8">
          <h2 className="mb-4 text-2xl font-bold">
            Planned Features
          </h2>

          <ul className="space-y-2 text-gray-300">
            <li>• NHL three-year rolling database</li>
            <li>• Automatic season rollover tool</li>
            <li>• Player ratings engine</li>
            <li>• Team ratings engine</li>
            <li>• AHL expansion support</li>
            <li>• Junior league support</li>
            <li>• Model administration dashboard</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
