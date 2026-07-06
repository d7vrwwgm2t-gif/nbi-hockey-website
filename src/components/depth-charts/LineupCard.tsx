import type { DepthChartTeam, PlayerSlot } from "@/lib/dailyFaceoff";

function PlayerCard({ player }: { player?: PlayerSlot }) {
  return (
    <div className="rounded-lg border border-sky-300/20 bg-slate-950/80 px-3 py-2 text-center shadow">
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

export default function LineupCard({ team }: { team: DepthChartTeam }) {
  return (
    <section className="rounded-3xl border border-sky-300/20 bg-slate-900 p-5 shadow-2xl">
      <div className="mb-6 flex items-center gap-4">
        <img
          src={team.logoPath}
          alt=""
          className="h-14 w-14 object-contain"
        />
        <div>
          <h2 className="text-3xl font-bold">{team.teamName}</h2>
          <p className="text-sm text-slate-400">
            {team.source ? `${team.source} lineup` : "Projected lineup"}
            {team.updatedAt
              ? ` • Updated ${new Date(team.updatedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <LineupSection title="Forwards" logoPath={team.logoPath}>
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
              <p className="text-sm text-slate-400">No forward lines available.</p>
            )}
          </div>
        </LineupSection>

        <LineupSection title="Defense" logoPath={team.logoPath}>
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
              <p className="text-sm text-slate-400">No defense pairs available.</p>
            )}
          </div>
        </LineupSection>

        <LineupSection title="Goalies" logoPath={team.logoPath}>
          <div className="grid gap-2 sm:grid-cols-2">
            <PlayerCard player={team.goalies.starter} />
            <PlayerCard player={team.goalies.backup} />
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
                <p className="text-sm text-slate-400">No power play units available.</p>
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
                <p className="text-sm text-slate-400">No penalty kill units available.</p>
              )}
            </div>
          </LineupSection>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <LineupSection title="Healthy Scratches" logoPath={team.logoPath}>
            {team.scratches && team.scratches.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {team.scratches.map((player) => (
                  <PlayerCard key={player.name} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No healthy scratches found.</p>
            )}
          </LineupSection>

          <LineupSection title="Injuries" logoPath={team.logoPath}>
            {team.injuries && team.injuries.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {team.injuries.map((player) => (
                  <PlayerCard key={player.name} player={player} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No injuries listed.</p>
            )}
          </LineupSection>
        </div>
      </div>
    </section>
  );
}