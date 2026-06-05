import fs from "fs";
import path from "path";
import { parseInStatWorkbook } from "../src/model/parser";
import { runModelForSeason } from "../src/model/modelRunner";

type CategoryResult = {
  score: number | null;
  letterGrade: string | null;
};

type CategoryKey =
  | "finishing"
  | "playmaking"
  | "transition"
  | "puckManagement"
  | "suppression"
  | "forechecking"
  | "powerPlay"
  | "penaltyKill";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  finishing: "Finishing",
  playmaking: "Playmaking",
  transition: "Transition",
  puckManagement: "Puck Management",
  suppression: "Suppression",
  forechecking: "Forechecking",
  powerPlay: "Power Play",
  penaltyKill: "Penalty Kill",
};

async function loadWorkbook(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  const file = fs.readFileSync(filePath);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
}

function formatCategory(category: CategoryResult) {
  if (category.score === null || category.letterGrade === null) {
    return "N/A";
  }

  return `${category.score} ${category.letterGrade}`;
}

function printMissingAliases(label: string, aliases: string[]) {
  console.log(`\n${label} missing aliases (${aliases.length})`);

  if (aliases.length === 0) {
    console.log("None");
    return;
  }

  aliases.forEach((alias) => console.log(`- ${alias}`));
}

function getCategory(player: ReturnType<typeof runModelForSeason>[number], category: CategoryKey) {
  return player[category] as CategoryResult;
}

function getScores(results: ReturnType<typeof runModelForSeason>, category: CategoryKey) {
  return results
    .map((player) => getCategory(player, category).score)
    .filter((score): score is number => score !== null);
}

function getPercentile(scores: number[], percentile: number) {
  if (scores.length === 0) return null;

  const sortedScores = [...scores].sort((a, b) => a - b);
  const index = Math.floor((percentile / 100) * (sortedScores.length - 1));

  return sortedScores[index];
}

function printCategorySummary(results: ReturnType<typeof runModelForSeason>, category: CategoryKey) {
  const scores = getScores(results, category);
  const label = CATEGORY_LABELS[category];

  if (scores.length === 0) {
    console.log(`${label}: No scores`);
    return;
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const sortedScores = [...scores].sort((a, b) => a - b);

  console.log(
    `${label} | Count: ${scores.length} | Avg: ${average.toFixed(1)} | P10: ${getPercentile(
      scores,
      10
    )} | P50: ${getPercentile(scores, 50)} | P90: ${getPercentile(
      scores,
      90
    )} | P95: ${getPercentile(scores, 95)} | Max: ${
      sortedScores[sortedScores.length - 1]
    }`
  );
}

function printTopCategoryTable(results: ReturnType<typeof runModelForSeason>, category: CategoryKey) {
  const label = CATEGORY_LABELS[category];

  const sortedResults = [...results].sort((a, b) => {
    const aScore = getCategory(a, category).score ?? 0;
    const bScore = getCategory(b, category).score ?? 0;

    return bScore - aScore;
  });

  console.log(`\nTop 25 by ${label}`);
  console.log("-".repeat(`Top 25 by ${label}`.length));

  console.table(
    sortedResults.slice(0, 25).map((player) => ({
      Player: player.player,
      Team: player.team,
      Pos: player.position,
      [label]: formatCategory(getCategory(player, category)),
      Finishing: formatCategory(player.finishing),
      Playmaking: formatCategory(player.playmaking),
      Transition: formatCategory(player.transition),
      PuckMgmt: formatCategory(player.puckManagement),
      Suppression: formatCategory(player.suppression),
      Forechecking: formatCategory(player.forechecking),
      PP: formatCategory(player.powerPlay),
      PK: formatCategory(player.penaltyKill),
      Confidence: player.confidenceLabel,
    }))
  );
}

async function main() {
  const dataFolder = path.join(process.cwd(), "model-data", "nhl", "2025-26");

  const allSituationsPath = path.join(dataFolder, "all-situations.xlsx");
  const powerPlayPath = path.join(dataFolder, "power-play.xlsx");
  const penaltyKillPath = path.join(dataFolder, "penalty-kill.xlsx");

  const allSituationsFile = await loadWorkbook(allSituationsPath);
  const powerPlayFile = await loadWorkbook(powerPlayPath);
  const penaltyKillFile = await loadWorkbook(penaltyKillPath);

  const allSituations = await parseInStatWorkbook({
    file: allSituationsFile,
    league: "NHL",
    season: "2025-26",
    situation: "all",
  });

  const powerPlay = await parseInStatWorkbook({
    file: powerPlayFile,
    league: "NHL",
    season: "2025-26",
    situation: "pp",
  });

  const penaltyKill = await parseInStatWorkbook({
    file: penaltyKillFile,
    league: "NHL",
    season: "2025-26",
    situation: "pk",
  });

  console.log("\nColumn / alias audit");
  console.log("--------------------");
  printMissingAliases("All Situations", allSituations.missingAliases);
  printMissingAliases("Power Play", powerPlay.missingAliases);
  printMissingAliases("Penalty Kill", penaltyKill.missingAliases);

  const results = runModelForSeason({
    allSituations,
    powerPlay,
    penaltyKill,
  });

  const categories: CategoryKey[] = [
    "finishing",
    "playmaking",
    "transition",
    "puckManagement",
    "suppression",
    "forechecking",
    "powerPlay",
    "penaltyKill",
  ];

  console.log("\nCategory Distribution Summary");
  console.log("-----------------------------");

  categories.forEach((category) => {
    printCategorySummary(results, category);
  });

  categories.forEach((category) => {
    printTopCategoryTable(results, category);
  });

  console.log("\nTotal players graded:", results.length);
}

main().catch((error) => {
  console.error("\nModel test failed:");
  console.error(error);
  process.exit(1);
});
