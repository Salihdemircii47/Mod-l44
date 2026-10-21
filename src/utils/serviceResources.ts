
import type { SectorId } from "../data/sectors";

const STORAGE_KEY = "mod44-service-resources-v1";

type Mapping = Record<string, string[]>;

function loadMapping(): Mapping {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    const result: Mapping = {};

    for (const [key, resources] of Object.entries(value)) {
      if (Array.isArray(resources)) {
        result[key] = resources.filter(
          (name): name is string => typeof name === "string"
        );
      }
    }

    return result;
  } catch {
    return {};
  }
}

// Hizmet henüz yapılandırılmadıysa başlangıçta
// tüm kaynaklara izin veriyoruz.
export function getAllowedResources(
  sectorId: SectorId,
  serviceId: string,
  allResources: string[]
): string[] {
  const mapping = loadMapping();
  const key = `${sectorId}:${serviceId}`;

  if (!Object.prototype.hasOwnProperty.call(mapping, key)) {
    return allResources;
  }

  return allResources.filter((name) =>
    mapping[key].includes(name)
  );
}

export function saveAllowedResources(
  sectorId: SectorId,
  serviceId: string,
  resources: string[]
): boolean {
  try {
    const mapping = loadMapping();
    mapping[`${sectorId}:${serviceId}`] = [...new Set(resources)];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
    return true;
  } catch {
    return false;
  }
}

export function isResourceAllowed(
  sectorId: SectorId,
  serviceId: string,
  resource: string,
  allResources: string[]
): boolean {
  return getAllowedResources(
    sectorId,
    serviceId,
    allResources
  ).includes(resource);
}
