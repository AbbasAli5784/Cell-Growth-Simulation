/**
 * Defines the core data types and interfaces used across the simulation.
 *
 * - MutationType: Enumerates possible mutation types for a bacteria cell.
 * - CellData: Represents the state and properties of a single grid cell.
 * - CellProps: Describes the props expected by the Cell component.
 */

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
