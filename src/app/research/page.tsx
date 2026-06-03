const nbiResearch = [
  {
    title: "The Cost of Falling Behind",
    description:
      "A look at how difficult it is for NHL teams to climb back into playoff position after falling five or more points behind.",
    type: "NBI Hockey Research",
    link: "https://nbihockey.substack.com",
  },
  {
    title: "Secondary Assist Repeatability Study",
    description:
      "An analysis of whether secondary assists are repeatable indicators of offensive contribution for NHL forwards.",
    type: "NBI Hockey Research",
    link: "https://nbihockey.substack.com",
  },
];

const researchLibrary = [
  {
    title: "Hockey Analytics Research Library",
    description:
      "A curated space for public hockey analytics papers, PDFs, methodology articles, and research resources.",
    type: "Coming Soon",
    link: "#",
  },
];

export default function ResearchPage() {
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
            A central hub for NBI Hockey research projects and a curated
            library of hockey analytics papers, PDFs, and articles from around
            the sport.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">NBI Hockey Research</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {nbiResearch.map((item) => (
              <a
                key={item.title}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8 transition hover:border-[#4DB5FF]/50 hover:bg-[#10243A]"
              >
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
                  {item.type}
                </p>

                <h3 className="mb-4 text-3xl font-bold">{item.title}</h3>

                <p className="mb-6 text-gray-300">{item.description}</p>

                <p className="text-sm font-semibold text-[#4DB5FF]">
                  Read Research →
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Research Library
          </p>

          <h2 className="mb-6 text-3xl font-bold">
            Favourite hockey analytics resources
          </h2>

          <p className="mb-8 max-w-3xl text-gray-300">
            This section will eventually collect useful public research,
            academic papers, PDFs, methodology posts, and hockey analytics
            resources from other writers, analysts, and researchers.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {researchLibrary.map((item) => (
              <a
                key={item.title}
                href={item.link}
                className="rounded-xl border border-white/10 p-6 transition hover:border-[#4DB5FF]/50 hover:bg-[#10243A]"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#4DB5FF]">
                  {item.type}
                </p>

                <h3 className="mb-3 text-xl font-bold">{item.title}</h3>

                <p className="text-sm text-gray-400">{item.description}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}