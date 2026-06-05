import type { MetricDefinition } from "./types";

export const CATEGORY_DEFINITIONS: Record<string, MetricDefinition[]> = {
  finishing: [
    { key: "goalsPerGame", label: "Goals/GP", weight: 3.0, direction: "positive" },
    { key: "xgPerGame", label: "xG/GP", weight: 3.0, direction: "positive" },
    { key: "scoringChancesPerGame", label: "Scoring Chances/GP", weight: 2.5, direction: "positive" },
    { key: "shotsOnGoalPerGame", label: "Shots on Goal/GP", weight: 2.0, direction: "positive" },
    { key: "innerSlotShotsPerGame", label: "Inner Slot Shots/GP", weight: 2.0, direction: "positive" },
    { key: "outerSlotShotsPerGame", label: "Outer Slot Shots/GP", weight: 1.0, direction: "positive" },
    { key: "missedShotsPerGame", label: "Missed Shots/GP", weight: 0.5, direction: "negative" },
    { key: "blockedShotsPerGame", label: "Blocked Shots/GP", weight: 0.5, direction: "negative" },
  ],

  playmaking: [
    { key: "firstAssistsPerGame", label: "First Assists/GP", weight: 3.0, direction: "positive" },
    { key: "passesToSlotPerGame", label: "Passes to the Slot/GP", weight: 3.0, direction: "positive" },
    { key: "preShotPassesPerGame", label: "Pre-shot Passes/GP", weight: 2.5, direction: "positive" },
    { key: "secondAssistsPerGame", label: "Second Assists/GP", weight: 1.5, direction: "positive" },
    { key: "passReceptionsPerGame", label: "Pass Receptions/GP", weight: 1.0, direction: "positive" },
  ],

  transition: [
    { key: "entriesPerGame", label: "Entries/GP", weight: 2.5, direction: "positive" },
    { key: "controlledEntryPct", label: "Controlled Entry %", weight: 3.0, direction: "positive", isPercentage: true },
    { key: "breakoutsPerGame", label: "Breakouts/GP", weight: 2.5, direction: "positive" },
    { key: "controlledBreakoutPct", label: "Controlled Breakout %", weight: 3.0, direction: "positive", isPercentage: true },
    { key: "dumpInPct", label: "Dump-In %", weight: 1.0, direction: "negative", isPercentage: true },
    { key: "dumpOutPct", label: "Dump-Out %", weight: 1.0, direction: "negative", isPercentage: true },
  ],

  puckManagement: [
    { key: "passesPerGame", label: "Passes/GP", weight: 1.5, direction: "positive" },
    { key: "accuratePassesPerGame", label: "Accurate Passes/GP", weight: 2.0, direction: "positive" },
    { key: "passAccuracyPct", label: "Pass Accuracy %", weight: 2.5, direction: "positive", isPercentage: true },
    { key: "puckLossesDZPerGame", label: "Puck Losses in DZ/GP", weight: 3.0, direction: "negative" },
    { key: "puckLossesNZPerGame", label: "Puck Losses in NZ/GP", weight: 2.0, direction: "negative" },
    { key: "puckLossesOZPerGame", label: "Puck Losses in OZ/GP", weight: 1.0, direction: "negative" },
  ],

  suppression: [
    { key: "xgaPct", label: "xGA%", weight: 3.0, direction: "negative", isPercentage: true },
    { key: "corsiAgainstPct", label: "Corsi Against %", weight: 2.5, direction: "negative", isPercentage: true },
    { key: "fenwickAgainstPct", label: "Fenwick Against %", weight: 2.0, direction: "negative", isPercentage: true },
    { key: "errorLeadingToGoalPerGame", label: "Error Leading to Goal/GP", weight: 3.0, direction: "negative" },
    { key: "defensivePlayPerGame", label: "Defensive Play/GP", weight: 2.0, direction: "positive" },
    { key: "takeawaysPerGame", label: "Takeaways/GP", weight: 2.0, direction: "positive" },
    { key: "takeawaysDZPerGame", label: "Takeaways in DZ/GP", weight: 2.5, direction: "positive" },
    { key: "takeawaysNZPerGame", label: "Takeaways in NZ/GP", weight: 1.5, direction: "positive" },
    { key: "takeawaysOZPerGame", label: "Takeaways in OZ/GP", weight: 1.0, direction: "positive" },
    { key: "shotsBlockingPerGame", label: "Shots Blocking/GP", weight: 1.5, direction: "positive" },
  ],

  forechecking: [
    { key: "puckBattlesWonPct", label: "Puck Battles Won %", weight: 3.0, direction: "positive", isPercentage: true },
    { key: "puckBattlesPerGame", label: "Puck Battles/GP", weight: 1.5, direction: "positive" },
    { key: "puckBattlesWonPerGame", label: "Puck Battles Won/GP", weight: 2.0, direction: "positive" },
    { key: "puckBattlesOZPerGame", label: "Puck Battles in OZ/GP", weight: 2.0, direction: "positive" },
    { key: "puckRetrievalsAfterShotsPerGame", label: "Puck Retrievals After Shots/GP", weight: 2.5, direction: "positive" },
    { key: "loosePuckRecoveriesPerGame", label: "Loose Puck Recoveries/GP", weight: 2.0, direction: "positive" },
    { key: "hitsPerGame", label: "Hits/GP", weight: 1.0, direction: "positive" },
  ],

  powerPlay: [
    { key: "ppGoalsPerGame", label: "PP Goals/GP", weight: 3.0, direction: "positive" },
    { key: "ppXgPerGame", label: "PP xG/GP", weight: 3.0, direction: "positive" },
    { key: "ppFirstAssistsPerGame", label: "PP First Assists/GP", weight: 2.5, direction: "positive" },
    { key: "ppSecondAssistsPerGame", label: "PP Second Assists/GP", weight: 1.5, direction: "positive" },
    { key: "ppShotsOnGoalPerGame", label: "PP Shots on Goal/GP", weight: 2.0, direction: "positive" },
    { key: "ppScoringChancesPerGame", label: "PP Scoring Chances/GP", weight: 2.5, direction: "positive" },
    { key: "ppPassesToSlotPerGame", label: "PP Passes to Slot/GP", weight: 3.0, direction: "positive" },
    { key: "ppPreShotPassesPerGame", label: "PP Pre-shot Passes/GP", weight: 2.5, direction: "positive" },
    { key: "ppEntriesPerGame", label: "PP Entries/GP", weight: 1.5, direction: "positive" },
  ],

  penaltyKill: [
    { key: "pkTakeawaysPerGame", label: "PK Takeaways/GP", weight: 2.5, direction: "positive" },
    { key: "pkTakeawaysDZPerGame", label: "PK Takeaways in DZ/GP", weight: 3.0, direction: "positive" },
    { key: "pkShotsBlockingPerGame", label: "PK Shots Blocking/GP", weight: 2.5, direction: "positive" },
    { key: "pkPuckBattlesWonPct", label: "PK Puck Battles Won %", weight: 2.5, direction: "positive", isPercentage: true },
    { key: "pkPuckBattlesWonPerGame", label: "PK Puck Battles Won/GP", weight: 2.0, direction: "positive" },
    { key: "pkBreakoutsPerGame", label: "PK Breakouts/GP", weight: 2.0, direction: "positive" },
    { key: "pkDumpOutsPerGame", label: "PK Dump Outs/GP", weight: 1.5, direction: "positive" },
    { key: "pkLoosePuckRecoveriesPerGame", label: "PK Loose Puck Recoveries/GP", weight: 2.0, direction: "positive" },
    { key: "pkXgaPct", label: "PK xGA%", weight: 3.0, direction: "negative", isPercentage: true },
    { key: "pkCorsiAgainstPct", label: "PK Corsi Against %", weight: 2.5, direction: "negative", isPercentage: true },
    { key: "pkFenwickAgainstPct", label: "PK Fenwick Against %", weight: 2.0, direction: "negative", isPercentage: true },
    { key: "pkPuckLossesDZPerGame", label: "PK Puck Losses in DZ/GP", weight: 2.5, direction: "negative" },
    { key: "pkErrorLeadingToGoalPerGame", label: "PK Error Leading to Goal/GP", weight: 3.0, direction: "negative" },
  ],
};
