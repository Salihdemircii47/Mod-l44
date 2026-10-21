
import type { SectorId } from "../../data/sectors";
import type {
  ResourceCatalog,
  ResourceSetting,
} from "../../types/resource";

export const RESOURCE_STORAGE_KEY =
  "mod44-resource-settings-v1";

export const resourceDefaults: ResourceCatalog = {
  beauty: [
    {
      name: "Elif Demir",
      role: "Saç Uzmanı",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
    {
      name: "Burak Yıldız",
      role: "Erkek Kuaförü",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 2,
      active: true,
    },
    {
      name: "Zeynep Arslan",
      role: "Güzellik Uzmanı",
      startTime: "10:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
  ],

  fleet: [
    {
      name: "34 VDJ 101",
      role: "Vidanjör Aracı",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
    {
      name: "34 KMB 202",
      role: "Kombine Aracı",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
    {
      name: "34 KKA 303",
      role: "Kuka Aracı",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
  ],

  construction: [
    {
      name: "Keşif Ekibi A",
      role: "Saha Keşif Ekibi",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
    {
      name: "Ekskavatör 01",
      role: "İş Makinesi",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
    {
      name: "Saha Ekibi B",
      role: "Altyapı Ekibi",
      startTime: "09:00",
      endTime: "18:00",
      dayOff: 0,
      active: true,
    },
  ],
};

function mergeResources(
  defaults: ResourceSetting[],
  stored: unknown
): ResourceSetting[] {
  if (!Array.isArray(stored)) {
    return structuredClone(defaults);
  }

  return defaults.map((item) => {
    const saved = stored.find(
      (entry: unknown) =>
        typeof entry === "object" &&
        entry !== null &&
        "name" in entry &&
        entry.name === item.name
    ) as Partial<ResourceSetting> | undefined;

    if (!saved) return { ...item };

    return {
      ...item,
      role:
        typeof saved.role === "string"
          ? saved.role
          : item.role,
      startTime:
        typeof saved.startTime === "string"
          ? saved.startTime
          : item.startTime,
      endTime:
        typeof saved.endTime === "string"
          ? saved.endTime
          : item.endTime,
      dayOff:
        typeof saved.dayOff === "number" &&
        Number.isInteger(saved.dayOff) &&
        saved.dayOff >= 0 &&
        saved.dayOff <= 7
          ? saved.dayOff
          : item.dayOff,
      active:
        typeof saved.active === "boolean"
          ? saved.active
          : item.active,
    };
  });
}

export function loadResourceSettings(): ResourceCatalog {
  try {
    const raw = localStorage.getItem(
      RESOURCE_STORAGE_KEY
    );

    if (!raw) {
      return structuredClone(resourceDefaults);
    }

    const data: unknown = JSON.parse(raw);

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return structuredClone(resourceDefaults);
    }

    const stored = data as Partial<
      Record<SectorId, unknown>
    >;

    return {
      beauty: mergeResources(
        resourceDefaults.beauty,
        stored.beauty
      ),
      fleet: mergeResources(
        resourceDefaults.fleet,
        stored.fleet
      ),
      construction: mergeResources(
        resourceDefaults.construction,
        stored.construction
      ),
    };
  } catch {
    return structuredClone(resourceDefaults);
  }
}

export function saveResourceSettings(
  settings: ResourceCatalog
): boolean {
  try {
    localStorage.setItem(
      RESOURCE_STORAGE_KEY,
      JSON.stringify(settings)
    );
    return true;
  } catch {
    return false;
  }
}
