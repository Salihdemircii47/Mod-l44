import type { SectorId } from "../data/sectors";

export function normalizeSector(
  value: string
): SectorId | null {
  const sector = value
    .trim()
    .toLocaleLowerCase("tr-TR");

  if (
    sector === "beauty" ||
    sector === "güzellik" ||
    sector === "kuaför" ||
    sector === "unisex kuaför & güzellik"
  ) {
    return "beauty";
  }

  if (
    sector === "fleet" ||
    sector === "vidanjör" ||
    sector === "kombine" ||
    sector === "kuka" ||
    sector === "vidanjör / kombine / kuka"
  ) {
    return "fleet";
  }

  if (
    sector === "construction" ||
    sector === "altyapı" ||
    sector === "inşaat" ||
    sector === "altyapı inşaat"
  ) {
    return "construction";
  }

  return null;
}

export function toBackendSector(
  sectorId: SectorId
): string {
  return sectorId;
}