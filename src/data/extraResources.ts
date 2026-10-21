
import type { SectorId } from "./sectors";

export type ExtraResourceType =
  | "room"
  | "equipment"
  | "operator"
  | "vehicle"
  | "area";

export type ExtraResource = {
  id: string;
  sectorId: SectorId;
  name: string;
  type: ExtraResourceType;
  active: boolean;
};

export const EXTRA_RESOURCE_STORAGE_KEY =
  "mod44-extra-resources-v1";

const defaults: ExtraResource[] = [
  {
    id: "beauty-room-1",
    sectorId: "beauty",
    name: "Boyama Odası 1",
    type: "room",
    active: true,
  },
  {
    id: "beauty-chair-1",
    sectorId: "beauty",
    name: "Kuaför Koltuğu 1",
    type: "equipment",
    active: true,
  },
  {
    id: "beauty-station-1",
    sectorId: "beauty",
    name: "Boya İstasyonu 1",
    type: "equipment",
    active: true,
  },
  {
    id: "fleet-operator-1",
    sectorId: "fleet",
    name: "Operatör Ahmet",
    type: "operator",
    active: true,
  },
  {
    id: "fleet-operator-2",
    sectorId: "fleet",
    name: "Operatör Mehmet",
    type: "operator",
    active: true,
  },
  {
    id: "fleet-hose-1",
    sectorId: "fleet",
    name: "Yüksek Basınç Hortumu",
    type: "equipment",
    active: true,
  },
  {
    id: "construction-excavator-1",
    sectorId: "construction",
    name: "Ekskavatör 02",
    type: "vehicle",
    active: true,
  },
  {
    id: "construction-area-1",
    sectorId: "construction",
    name: "Çalışma Alanı A",
    type: "area",
    active: true,
  },
];

export function loadExtraResources(): ExtraResource[] {
  try {
    const raw = localStorage.getItem(
      EXTRA_RESOURCE_STORAGE_KEY
    );

    if (!raw) return structuredClone(defaults);

    const data: unknown = JSON.parse(raw);

    if (!Array.isArray(data)) {
      return structuredClone(defaults);
    }

    return data.filter(
      (item): item is ExtraResource =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        ["beauty", "fleet", "construction"].includes(
          item.sectorId
        ) &&
        [
          "room",
          "equipment",
          "operator",
          "vehicle",
          "area",
        ].includes(item.type) &&
        typeof item.active === "boolean"
    );
  } catch {
    return structuredClone(defaults);
  }
}

export function saveExtraResources(
  resources: ExtraResource[]
): boolean {
  try {
    localStorage.setItem(
      EXTRA_RESOURCE_STORAGE_KEY,
      JSON.stringify(resources)
    );
    return true;
  } catch {
    return false;
  }
}

export function getExtraResourcesBySector(
  sectorId: SectorId
): ExtraResource[] {
  return loadExtraResources().filter(
    (item) => item.sectorId === sectorId
  );
}
