export type MutationType = "fast" | "immortal" | "double_life" | null;

export interface CellData {
  hasBacteria: boolean;
  mutationType: MutationType;
  birthTime: number;
  lifespan: number;
}

export interface CellProps {
  hasBacteria: boolean;
  mutationType: MutationType;
  onClick?: () => void;
}
