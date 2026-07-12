import type { Metadata } from "next";
import Image from "next/image";

import {
  getPowerRankings,
  type PowerRankingTier,
} from "@/lib/powerRankings";

export const metadata: Metadata = {
  title: "Power Rankings | NBI Hockey",
  description:
    "The latest NBI Hockey NHL power rankings, organized into tiers.",
};

export const revalidate = 60;

const TIER_STYLES = [
  {
    header:
      "border-sky-400/25 bg-sky-400/10",
    title: "text-sky-200",
  },
  {
    header:
      "border-yellow-300/25 bg-yellow-300/10",
    title: "text-yellow-200",
  },
];

function PowerRankingTierRow({
  tier,
  tierIndex,
}: {
  tier: PowerRankingTier;
  tierIndex: number;
}) {
  const style =
    TIER_STYLES[tierIndex % TIER_STYLES.length];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20">
      <div className="grid md:grid-cols-[210px_1fr]">
        <div
          className={`flex min-h-24 items-center justify-center border-b px-5 py-4 text-center md:border-b-0 md:border-r ${style.header}`}
        >
          <h2
            className={`text-lg font-bold leading-tight sm:text-xl ${style.title}`}
          >
            {tier.name}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 p-3 sm:gap-3 sm:p-4 md:justify-start">
          {tier.teams.map((team) => (
            <article
              key={team.abbreviation}
              title={`${team.order}. ${team.name}`}
              className="group relative flex h-24 w-24 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-950/70 p-2 transition duration-200 hover:-translate-y-1 hover:border-sky-400/60 hover:bg-slate-900 sm:h-28 sm:w-28"
            >
              <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                <Image
                  src={team.logoPath}
                  alt={`${team.name} logo`}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.65)] transition duration-200 group-hover:scale-105"
                />
              </div>

              <span className="absolute bottom-1.5 left-1.5 flex h-6 min-w-6 items-center justify-center rounded-md border border-slate-600 bg-slate-950/90 px-1.5 text-xs font-extrabold text-white shadow-md">
                {team.order}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function PowerRankingsPage() {
  try {
    const { settings, tiers } =
      await getPowerRankings();

    if (tiers.length === 0) {
      return (
        <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold tracking-tight">
              NBI Hockey Power Rankings
            </h1>

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 px-6 py-12 text-center">
              <p className="text-slate-300">
                No power rankings are currently available.
              </p>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <header>
            <h1 className="text-4xl font-bold tracking-tight">
              {settings.title}
            </h1>

            {settings.subtitle ? (
              <p className="mt-2 text-xl font-semibold text-sky-300">
                {settings.subtitle}
              </p>
            ) : null}

            {settings.description ? (
              <p className="mt-2 max-w-2xl text-slate-300">
                {settings.description}
              </p>
            ) : null}

            {settings.updatedDate ? (
              <p className="mt-3 text-sm font-medium text-slate-400">
                Last updated:{" "}
                <span className="text-slate-300">
                  {settings.updatedDate}
                </span>
              </p>
            ) : null}
          </header>

          <div className="mt-8 space-y-3">
            {tiers.map((tier, tierIndex) => (
              <PowerRankingTierRow
                key={tier.name}
                tier={tier}
                tierIndex={tierIndex}
              />
            ))}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error(
      "Could not display power rankings:",
      error,
    );

    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold tracking-tight">
            NBI Hockey Power Rankings
          </h1>

          <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/5 px-6 py-12 text-center">
            <p className="text-slate-300">
              The power rankings could not be loaded. Check the
              Google Sheet sharing settings and try again.
            </p>
          </div>
        </div>
      </main>
    );
  }
}