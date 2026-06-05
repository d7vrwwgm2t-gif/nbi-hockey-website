export type GameSituation = "all" | "pp" | "pk" | "base";

export type PlayerIdentifier = {
  player: string;
  dateOfBirth: string;
  team: string;
  position: string;
};

export type RawPlayerRow = PlayerIdentifier & {
  gamesPlayed: number;
  stats: Record<string, number | null>;
};

export type ParsedDataset = {
  league: string;
  season: string;
  situation: GameSituation;
  players: RawPlayerRow[];
  columnsFound: string[];
  missingAliases: string[];
};

export type PublicCategoryResult = {
  score: number | null;
  letterGrade: string | null;
};

export type PublicPlayerGrade = {
  player: string;
  team: string;
  position: string;
  confidenceLabel: "High Confidence" | "Moderate Confidence" | "Small Sample";
  finishing: PublicCategoryResult;
  playmaking: PublicCategoryResult;
  transition: PublicCategoryResult;
  puckManagement: PublicCategoryResult;
  suppression: PublicCategoryResult;
  forechecking: PublicCategoryResult;
  powerPlay: PublicCategoryResult;
  penaltyKill: PublicCategoryResult;
};

export type MetricDirection = "positive" | "negative";

export type MetricDefinition = {
  key: string;
  label: string;
  weight: number;
  direction: MetricDirection;
  isPercentage?: boolean;
};
