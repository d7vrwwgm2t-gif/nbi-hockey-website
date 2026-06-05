export const REQUIRED_ID_COLUMNS = {
  player: ["Player", "Name", "Player Name"],
  dateOfBirth: ["Date of birth", "DOB", "Date of Birth"],
  team: ["Team"],
  position: ["Position", "Pos"],
  gamesPlayed: ["Games played", "GP", "Games"],
};

export const STAT_COLUMN_ALIASES: Record<string, string[]> = {
  goals: ["Goals", "G"],
  xg: ["xG","Expected goals","xG (Expected goals)",],
  scoringChances: ["Scoring chances", "Scoring Chances"],
  shotsOnGoal: ["Shots on goal", "Shots On Goal", "SOG"],
  innerSlotShots: ["Inner slot shots", "Inner Slot Shots", "Inner slot shots - total"],
  outerSlotShots: ["Outer slot shots", "Outer Slot Shots", "Outer slot shots - total"],
  missedShots: ["Missed shots", "Missed Shots"],
  blockedShots: ["Blocked shots", "Blocked Shots"],

  firstAssists: ["First assists","First Assists","First assist","A1",],
 secondAssists: ["Second assists","Second Assists","Second assist","A2",],
  passesToSlot: ["Passes to the slot", "Passes To The Slot"],
  preShotPasses: ["Pre-shots passes", "Pre-shot passes", "Pre Shot Passes"],
  passReceptions: ["Pass receptions", "Pass Receptions"],

  entries: ["Entries"],
  entriesViaPass: ["Entries via pass", "Entries Via Pass"],
  entriesViaDumpIn: ["Entries via dump in", "Entries Via Dump In"],
  entriesViaStickhandling: ["Entries via stickhandling", "Entries Via Stickhandling"],

  breakouts: ["Breakouts"],
  breakoutsViaPass: ["Breakouts via pass", "Breakouts Via Pass"],
  breakoutsViaDumpOut: ["Breakouts via dump out", "Breakouts Via Dump Out"],
  breakoutsViaStickhandling: ["Breakouts via stickhandling", "Breakouts Via Stickhandling"],

  passes: ["Passes"],
  accuratePasses: ["Accurate passes", "Accurate Passes"],
  passAccuracy: ["Pass accuracy, %",  "Pass accuracy %",  "Pass Accuracy %",  "Accurate passes, %",],

  puckLosses: ["Puck losses", "Puck Losses"],
  puckLossesDZ: ["Puck losses in DZ", "Puck Losses in DZ"],
  puckLossesNZ: ["Puck losses in NZ", "Puck Losses in NZ"],
  puckLossesOZ: ["Puck losses in OZ", "Puck Losses in OZ"],

  teamXgOnIce: ["Team xG when on ice", "Team xG When On Ice"],
  opponentXgOnIce: [  "Opponent xG when on ice",  "Opponent xG When On Ice",  "Opponent's xG when on ice",],
  corsiFor: ["CORSI", "Corsi For", "CORSI For"],
  corsiAgainst: ["CORSI-", "Corsi Against", "CORSI Against"],
  fenwickFor: ["Fenwick for", "Fenwick For"],
  fenwickAgainst: ["Fenwick against", "Fenwick Against"],

  errorLeadingToGoal: ["Error leading to goal", "Error Leading to Goal"],
  defensivePlay: ["Defensive play", "Defensive Play"],
  takeaways: ["Takeaways"],
  takeawaysDZ: ["Takeaways in DZ", "Takeaways In DZ"],
  takeawaysNZ: ["Takeaways in NZ", "Takeaways In NZ"],
  takeawaysOZ: ["Takeaways in OZ", "Takeaways In OZ"],
  shotsBlocking: ["Shots blocking", "Shots Blocking"],

  puckBattles: ["Puck battles", "Puck Battles"],
  puckBattlesWon: ["Puck battles won", "Puck Battles Won"],
  puckBattlesWonPct: ["Puck battles won, %", "Puck Battles Won %"],
  puckBattlesOZ: ["Puck battles in OZ", "Puck Battles in OZ"],
  puckRetrievalsAfterShots: ["Puck retrievals after shots", "Puck Retrievals After Shots"],
  loosePuckRecoveries: [  "Loose puck recoveries",  "Loose Puck Recoveries",  "Loose puck recovery",],
  hits: ["Hits"],

  powerPlayTime: ["Power play time", "Power Play Time"],
  shortHandedTime: ["Short-handed time", "Short Handed Time", "Penalty killing time"],
};
