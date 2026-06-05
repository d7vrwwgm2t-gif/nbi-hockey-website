import Link from "next/link";

const cardOptions = [
  {
    title: "Player Cards",
    description: "View skater percentile cards using MoneyPuck data.",
    href: "/cards/players",
  },
  {
    title: "Goalie Cards",
    description: "View goalie performance cards using MoneyPuck data.",
    href: "/cards/goalies",
  },
  {
    title: "Team Cards",
    description: "View team profile cards using MoneyPuck data.",
    href: "/cards/teams",
  },
];

export default function CardsPage() {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <section className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            NBI Hockey
          </p>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            Cards
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Explore player, goalie, and team cards built from MoneyPuck data.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          {cardOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8 transition hover:-translate-y-1 hover:border-[#FFD54A]/60"
            >
              <h2 className="mb-4 text-3xl font-bold">
                {option.title}
              </h2>

              <p className="text-gray-300">
                {option.description}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}