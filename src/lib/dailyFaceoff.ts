import depthChartData from "../../public/data/depth-charts.json";

export type PlayerSlot = {
  name: string;
  position?: string;
};

export type SpecialTeamUnit = {
  unit: number;
  players: PlayerSlot[];
};

export type DepthChartTeam = {
  teamName: string;
  abbreviation: string;
  dailyFaceoffSlug: string;
  logoPath: string;
  updatedAt?: string;
  source?: string;
  sourceUrl?: string;
  forwards: {
    line: number;
    lw?: PlayerSlot | null;
    c?: PlayerSlot | null;
    rw?: PlayerSlot | null;
  }[];
  defense: {
    pair: number;
    ld?: PlayerSlot | null;
    rd?: PlayerSlot | null;
  }[];
  goalies: {
    starter?: PlayerSlot | null;
    backup?: PlayerSlot | null;
    extra?: PlayerSlot[];
  };
  powerPlay?: SpecialTeamUnit[];
  penaltyKill?: SpecialTeamUnit[];
  scratches?: PlayerSlot[];
  injuries?: PlayerSlot[];
};

type DepthChartPayload = {
  generatedAt: string | null;
  teams: DepthChartTeam[];
  errors?: { team: string; error: string }[];
};

export async function getDepthCharts(): Promise<DepthChartTeam[]> {
  const payload = depthChartData as DepthChartPayload;
  return payload.teams ?? [];
}

export function getDepthChartGeneratedAt(): string | null {
  const payload = depthChartData as DepthChartPayload;
  return payload.generatedAt ?? null;
}
