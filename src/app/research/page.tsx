import { getResearchItemsFromSheet } from "@/lib/googleSheets";

function isNbiResearch(author: string) {
  const normalizedAuthor = author.toLowerCase().trim();

  return (
    normalizedAuthor.includes("george lafleche") ||
    normalizedAuthor.includes("george la flèche") ||
    normalizedAuthor.includes("nbi hockey")
  );
}

export default async function ResearchPage() {
  const researchItems = await getResearchItemsFromSheet();

  const nbiResearch = researchItems.filter((item) =>
    isNbiResearch(item.author)
  );

  const externalResearch = researchItems.filter(
    (item) => !isNbiResearch(item.author)
  );

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <section className="mb-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Research
          </p>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            Hockey research, studies, and analytics resources.
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            A central hub for NBI Hockey research projects and a curated library
            of hockey analytics papers, PDFs, articles, and methodology
            resources from around the sport.
          </p>
        </section>

        {nbiResearch.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-3xl font-bold">NBI Hockey Research</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {nbiResearch.map((item) => (
                <a
                  key={`${item.title}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8 transition hover:border-[#4DB5FF]/50 hover:bg-[#10243A]"
                >
                  <div className="mb-4 flex flex-wrap gap-3">
                    <span className="rounded-full border border-[#FFD54A]/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FFD54A]">
                      {item.type}
                    </span>

                    <span className="rounded-full border border-[#4DB5FF]/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#4DB5FF]">
                      {item.category}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {item.year}
                    </span>
                  </div>

                  <h3 className="mb-3 text-3xl font-bold">{item.title}</h3>

                  <p className="mb-2 text-sm text-[#4DB5FF]">{item.author}</p>

                  <p className="mb-6 text-gray-300">{item.description}</p>

                  <p className="text-sm font-semibold text-[#4DB5FF]">
                    Open Research →
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Research Library
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            Favourite hockey analytics resources
          </h2>

          <p className="mb-8 max-w-3xl text-gray-300">
            A curated collection of public hockey analytics research, PDFs,
            articles, methodology posts, and useful resources from other
            analysts, writers, and researchers.
          </p>

          {externalResearch.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {externalResearch.map((item) => (
                <a
                  key={`${item.title}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 p-6 transition hover:border-[#4DB5FF]/50 hover:bg-[#10243A]"
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#4DB5FF]/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#4DB5FF]">
                      {item.type}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {item.year}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>

                  <p className="mb-2 text-sm text-[#4DB5FF]">{item.author}</p>

                  <p className="mb-5 text-sm text-gray-400">
                    {item.description}
                  </p>

                  <p className="text-sm font-semibold text-[#4DB5FF]">
                    Open Resource →
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              External research links will appear here once added.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
