import type { DepthChartTeam, PlayerSlot } from "@/lib/dailyFaceoff";

function formatDate(value?: string) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function PlayerCard({ player }: { player?: PlayerSlot | null }) {
  return (
    <div className="min-w-[140px] rounded-lg border border-sky-300/20 bg-slate-950/80 px-3 py-2 text-center shadow">
      <div className="text-sm font-semibold leading-tight text-white">
        {player?.name ?? "—"}
      </div>
    </div>
  );
}

function LineupSection({
  title,
  logoPath,
  children,
}: {
  title: string;
  logoPath: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-sky-300/20 bg-slate-950/60 p-4">
      <img
        src={logoPath}
        alt=""
        className="pointer-events-none absolute inset-0 m-auto h-[85%] max-h-72 opacity-10"
      />

      <div className="relative z-10">
        <h3 className="mb-3 text-lg font-bold text-sky-300">{title}</h3>
        {children}
      </div>
    </section>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

function SwipeHint() {
  return (
    <p className="mb-2 text-xs font-semibold text-slate-400 sm:hidden">
      Swipe left/right to view full lineup →
    </p>
  );
}

export default function LineupCard({ team }: { team: DepthChartTeam }) {
  const updated = formatDate(team.updatedAt);

  return (
    <section className="rounded-3xl border border-sky-300/20 bg-slate-900 p-5 shadow-2xl">
      <div className="mb-6 flex items-center gap-4">
        <img src={team.logoPath} alt="" className="h-14 w-14 object-contain" />

        <div>
          <h2 className="text-3xl font-bold">{team.teamName}</h2>
          <p className="text-sm text-slate-400">
            {team.source ? `${team.source} lineup` : "Projected lineup"}
            {updated ? ` • Updated ${updated}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <LineupSection title="Forwards" logoPath={team.logoPath}>
          <SwipeHint />

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[720px]">
              <div className="mb-2 grid grid-cols-[42px_1fr_1fr_1fr] gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                <div />
                <div className="text-center">LW</div>
                <div className="text-center">C</div>
                <div className="text-center">RW</div>
              </div>

              <div className="space-y-2">
                {team.forwards.length > 0 ? (
                  team.forwards.map((line) => (
                    <div
                      key={line.line}
                      className="grid grid-cols-[42px_1fr_1fr_1fr] items-center gap-2"
                    >
                      <div className="text-sm font-bold text-yellow-300">
                        L{line.line}
                      </div>
                      <PlayerCard player={line.lw} />
                      <PlayerCard player={line.c} />
                      <PlayerCard player={line.rw} />
                    </div>
                  ))
                ) : (
                  <EmptyText>No forward lines available.</EmptyText>
                )}
              </div>
            </div>
          </div>
        </LineupSection>

        <LineupSection title="Defense" logoPath={team.logoPath}>
          <SwipeHint />

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[560px]">
              <div className="mb-2 grid grid-cols-[42px_1fr_1fr] gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                <div />
                <div className="text-center">LD</div>
                <div className="text-center">RD</div>
              </div>

              <div className="space-y-2">
                {team.defense.length > 0 ? (
                  team.defense.map((pair) => (
                    <div
                      key={pair.pair}
                      className="grid grid-cols-[42px_1fr_1fr] items-center gap-2"
                    >
                      <div className="text-sm font-bold text-yellow-300">
                        P{pair.pair}
                      </div>
                      <PlayerCard player={pair.ld} />
                      <PlayerCard player={pair.rd} />
                    </div>
                  ))
                ) : (
                  <EmptyText>No defense pairs available.</EmptyText>
                )}
              </div>
            </div>
          </div>
        </LineupSection>

        <LineupSection title="Goalies" logoPath={team.logoPath}>
          <div className="grid gap-2 sm:grid-cols-2">
            <PlayerCard player={team.goalies?.starter} />
            <PlayerCard player={team.goalies?.backup} />
          </div>
        </LineupSection>

        <div className="grid gap-5 lg:grid-cols-2">
          <LineupSection title="Power Play" logoPath={team.logoPath}>
            <div className="space-y-4">
              {team.powerPlay && team.powerPlay.length > 0 ? (
                team.powerPlay.map((unit) => (
                  <div key={unit.unit}>
                    <div className="mb-2 text-sm font-bold text-yellow-300">
                      PP{unit.unit}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {unit.players.map((player) => (
                        <PlayerCard key={player.name} player={player} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyText>No power play units available.</EmptyText>
              )}
            </div>
          </LineupSection>

          <LineupSection title="Penalty Kill" logoPath={team.logoPath}>
            <div className="space-y-4">
              {team.penaltyKill && team.penaltyKill.length > 0 ? (
                team.penaltyKill.map((unit) => (
                  <div key={unit.unit}>
                    <div className="mb-2 text-sm font-bold text-yellow-300">
                      PK{unit.unit}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {unit.players.map((player) => (
                        <PlayerCard key={player.name} player={player} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyText>No penalty kill units available.</EmptyText>
              )}
            </div>
          </LineupSection>
        </div>

        <LineupSection title="Injuries and Scratches" logoPath={team.logoPath}>
          {team.scratches && team.scratches.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {team.scratches.map((player) => (
                <PlayerCard key={player.name} player={player} />
              ))}
            </div>
          ) : (
            <EmptyText>No extra active-roster players found.</EmptyText>
          )}
        </LineupSection>
      </div>
    </section>
  );
}