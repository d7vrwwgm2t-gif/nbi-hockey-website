import type { RawPlayerRow } from "./types";
import { safeDivide } from "./utils";

export type DerivedPlayerMetrics = RawPlayerRow & {
  derived: Record<string, number | null>;
};

function perGame(value: number | null | undefined, gamesPlayed: number) {
  if (value === null || value === undefined) return null;
  if (!gamesPlayed) return null;

  return value / gamesPlayed;
}

function getStat(player: RawPlayerRow, key: string) {
  return player.stats[key] ?? null;
}

export function derivePlayerMetrics(player: RawPlayerRow): DerivedPlayerMetrics {
  const gp = player.gamesPlayed;

  const entries = getStat(player, "entries");
  const entriesViaPass = getStat(player, "entriesViaPass");
  const entriesViaStickhandling = getStat(player, "entriesViaStickhandling");
  const entriesViaDumpIn = getStat(player, "entriesViaDumpIn");

  const breakouts = getStat(player, "breakouts");
  const breakoutsViaPass = getStat(player, "breakoutsViaPass");
  const breakoutsViaStickhandling = getStat(player, "breakoutsViaStickhandling");
  const breakoutsViaDumpOut = getStat(player, "breakoutsViaDumpOut");

  const passes = getStat(player, "passes");
  const accuratePasses = getStat(player, "accuratePasses");

  const puckBattles = getStat(player, "puckBattles");
  const puckBattlesWon = getStat(player, "puckBattlesWon");

  const teamXgOnIce = getStat(player, "teamXgOnIce");
  const opponentXgOnIce = getStat(player, "opponentXgOnIce");

  const corsiFor = getStat(player, "corsiFor");
  const corsiAgainst = getStat(player, "corsiAgainst");

  const fenwickFor = getStat(player, "fenwickFor");
  const fenwickAgainst = getStat(player, "fenwickAgainst");

  const derived: Record<string, number | null> = {
    // Finishing
    goalsPerGame: perGame(getStat(player, "goals"), gp),
    xgPerGame: perGame(getStat(player, "xg"), gp),
    scoringChancesPerGame: perGame(getStat(player, "scoringChances"), gp),
    shotsOnGoalPerGame: perGame(getStat(player, "shotsOnGoal"), gp),
    innerSlotShotsPerGame: perGame(getStat(player, "innerSlotShots"), gp),
    outerSlotShotsPerGame: perGame(getStat(player, "outerSlotShots"), gp),
    missedShotsPerGame: perGame(getStat(player, "missedShots"), gp),
    blockedShotsPerGame: perGame(getStat(player, "blockedShots"), gp),

    // Playmaking
    firstAssistsPerGame: perGame(getStat(player, "firstAssists"), gp),
    secondAssistsPerGame: perGame(getStat(player, "secondAssists"), gp),
    passesToSlotPerGame: perGame(getStat(player, "passesToSlot"), gp),
    preShotPassesPerGame: perGame(getStat(player, "preShotPasses"), gp),
    passReceptionsPerGame: perGame(getStat(player, "passReceptions"), gp),

    // Transition
    entriesPerGame: perGame(entries, gp),
    controlledEntryPct: safeDivide(
      (entriesViaPass ?? 0) + (entriesViaStickhandling ?? 0),
      entries
    ),
    dumpInPct: safeDivide(entriesViaDumpIn, entries),

    breakoutsPerGame: perGame(breakouts, gp),
    controlledBreakoutPct: safeDivide(
      (breakoutsViaPass ?? 0) + (breakoutsViaStickhandling ?? 0),
      breakouts
    ),
    dumpOutPct: safeDivide(breakoutsViaDumpOut, breakouts),

    // Puck Management
    passesPerGame: perGame(passes, gp),
    accuratePassesPerGame: perGame(accuratePasses, gp),
    passAccuracyPct: safeDivide(accuratePasses, passes),
    puckLossesPerGame: perGame(getStat(player, "puckLosses"), gp),
    puckLossesDZPerGame: perGame(getStat(player, "puckLossesDZ"), gp),
    puckLossesNZPerGame: perGame(getStat(player, "puckLossesNZ"), gp),
    puckLossesOZPerGame: perGame(getStat(player, "puckLossesOZ"), gp),

    // Defense
    xgaPct: safeDivide(
      opponentXgOnIce,
      (teamXgOnIce ?? 0) + (opponentXgOnIce ?? 0)
    ),
    corsiAgainstPct: safeDivide(
      corsiAgainst,
      (corsiFor ?? 0) + (corsiAgainst ?? 0)
    ),
    fenwickAgainstPct: safeDivide(
      fenwickAgainst,
      (fenwickFor ?? 0) + (fenwickAgainst ?? 0)
    ),
    errorLeadingToGoalPerGame: perGame(getStat(player, "errorLeadingToGoal"), gp),
    defensivePlayPerGame: perGame(getStat(player, "defensivePlay"), gp),
    takeawaysPerGame: perGame(getStat(player, "takeaways"), gp),
    takeawaysDZPerGame: perGame(getStat(player, "takeawaysDZ"), gp),
    takeawaysNZPerGame: perGame(getStat(player, "takeawaysNZ"), gp),
    takeawaysOZPerGame: perGame(getStat(player, "takeawaysOZ"), gp),
    shotsBlockingPerGame: perGame(getStat(player, "shotsBlocking"), gp),

    // Forechecking
    puckBattlesWonPct: safeDivide(puckBattlesWon, puckBattles),
    puckBattlesPerGame: perGame(puckBattles, gp),
    puckBattlesWonPerGame: perGame(puckBattlesWon, gp),
    puckBattlesOZPerGame: perGame(getStat(player, "puckBattlesOZ"), gp),
    puckRetrievalsAfterShotsPerGame: perGame(
      getStat(player, "puckRetrievalsAfterShots"),
      gp
    ),
    loosePuckRecoveriesPerGame: perGame(getStat(player, "loosePuckRecoveries"), gp),
    hitsPerGame: perGame(getStat(player, "hits"), gp),

    // Power Play
    ppGoalsPerGame: perGame(getStat(player, "goals"), gp),
    ppXgPerGame: perGame(getStat(player, "xg"), gp),
    ppFirstAssistsPerGame: perGame(getStat(player, "firstAssists"), gp),
    ppSecondAssistsPerGame: perGame(getStat(player, "secondAssists"), gp),
    ppShotsOnGoalPerGame: perGame(getStat(player, "shotsOnGoal"), gp),
    ppScoringChancesPerGame: perGame(getStat(player, "scoringChances"), gp),
    ppPassesToSlotPerGame: perGame(getStat(player, "passesToSlot"), gp),
    ppPreShotPassesPerGame: perGame(getStat(player, "preShotPasses"), gp),
    ppEntriesPerGame: perGame(entries, gp),

    // Penalty Kill
    pkTakeawaysPerGame: perGame(getStat(player, "takeaways"), gp),
    pkTakeawaysDZPerGame: perGame(getStat(player, "takeawaysDZ"), gp),
    pkShotsBlockingPerGame: perGame(getStat(player, "shotsBlocking"), gp),
    pkPuckBattlesWonPct: safeDivide(puckBattlesWon, puckBattles),
    pkPuckBattlesWonPerGame: perGame(puckBattlesWon, gp),
    pkBreakoutsPerGame: perGame(breakouts, gp),
    pkDumpOutsPerGame: perGame(breakoutsViaDumpOut, gp),
    pkLoosePuckRecoveriesPerGame: perGame(getStat(player, "loosePuckRecoveries"), gp),
    pkXgaPct: safeDivide(
      opponentXgOnIce,
      (teamXgOnIce ?? 0) + (opponentXgOnIce ?? 0)
    ),
    pkCorsiAgainstPct: safeDivide(
      corsiAgainst,
      (corsiFor ?? 0) + (corsiAgainst ?? 0)
    ),
    pkFenwickAgainstPct: safeDivide(
      fenwickAgainst,
      (fenwickFor ?? 0) + (fenwickAgainst ?? 0)
    ),
    pkPuckLossesDZPerGame: perGame(getStat(player, "puckLossesDZ"), gp),
    pkErrorLeadingToGoalPerGame: perGame(getStat(player, "errorLeadingToGoal"), gp),
  };

  return {
    ...player,
    derived,
  };
}

export function deriveDatasetMetrics(players: RawPlayerRow[]) {
  return players.map(derivePlayerMetrics);
}
