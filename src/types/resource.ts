
import type { SectorId } from "../data/sectors";

export type ResourceSetting = {
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  dayOff: number;
  active: boolean;
};

export type ResourceCatalog = Record<
  SectorId,
  ResourceSetting[]
>;

export type DayOff =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
