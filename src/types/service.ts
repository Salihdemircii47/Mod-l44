
import type { SectorId } from "../data/sectors";

export type ServiceItem = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

export type ServiceCatalog = Record<
  SectorId,
  ServiceItem[]
>;
