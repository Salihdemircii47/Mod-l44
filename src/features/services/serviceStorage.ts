
import type { SectorId } from "../../data/sectors";
import type { ServiceCatalog } from "../../types/service";

// Önceki kayıtları korumak için anahtarlar değişmiyor.
const STORAGE_KEY = "mod44-services-v1";
const BRANCH_KEY = "mod44-branches-v1";

// Varsayılan demo hizmetleri
const defaultServices: ServiceCatalog = {
  beauty: [
    {
      id: "beauty-1",
      name: "Saç Kesimi",
      duration: 30,
      price: 500,
      active: true,
    },
    {
      id: "beauty-2",
      name: "Saç Boyama",
      duration: 120,
      price: 1800,
      active: true,
    },
    {
      id: "beauty-3",
      name: "Fön",
      duration: 45,
      price: 350,
      active: true,
    },
    {
      id: "beauty-4",
      name: "Manikür",
      duration: 60,
      price: 600,
      active: true,
    },
  ],

  fleet: [
    {
      id: "fleet-1",
      name: "Vidanjör Hizmeti",
      duration: 120,
      price: 3500,
      active: true,
    },
    {
      id: "fleet-2",
      name: "Kombine Kanal Açma",
      duration: 180,
      price: 5500,
      active: true,
    },
    {
      id: "fleet-3",
      name: "Kuka Hizmeti",
      duration: 90,
      price: 2800,
      active: true,
    },
  ],

  construction: [
    {
      id: "construction-1",
      name: "Saha Keşfi",
      duration: 60,
      price: 1500,
      active: true,
    },
    {
      id: "construction-2",
      name: "Kazı Planlaması",
      duration: 120,
      price: 4500,
      active: true,
    },
    {
      id: "construction-3",
      name: "Boru Hattı Kontrolü",
      duration: 90,
      price: 3000,
      active: true,
    },
  ],
};

// Demo şubelerimiz
const defaultBranches: Record<SectorId, string> = {
  beauty: "Merkez Güzellik Şubesi",
  fleet: "Merkez Operasyon Sahası",
  construction: "Ana Şantiye Ofisi",
};

// Hizmet kataloğunu oku
export function loadServices(): ServiceCatalog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return structuredClone(defaultServices);
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return structuredClone(defaultServices);
    }

    const data = parsed as Partial<ServiceCatalog>;

    return {
      beauty: Array.isArray(data.beauty)
        ? data.beauty
        : structuredClone(defaultServices.beauty),

      fleet: Array.isArray(data.fleet)
        ? data.fleet
        : structuredClone(defaultServices.fleet),

      construction: Array.isArray(data.construction)
        ? data.construction
        : structuredClone(defaultServices.construction),
    };
  } catch {
    return structuredClone(defaultServices);
  }
}

// Hizmet kataloğunu kaydet
export function saveServices(
  catalog: ServiceCatalog
): boolean {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(catalog)
    );

    return true;
  } catch {
    return false;
  }
}

// Şube bilgilerini oku
export function loadBranches(): Record<SectorId, string> {
  try {
    const raw = localStorage.getItem(BRANCH_KEY);

    if (!raw) {
      return { ...defaultBranches };
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return { ...defaultBranches };
    }

    const data = parsed as Partial<
      Record<SectorId, string>
    >;

    return {
      beauty:
        typeof data.beauty === "string"
          ? data.beauty
          : defaultBranches.beauty,

      fleet:
        typeof data.fleet === "string"
          ? data.fleet
          : defaultBranches.fleet,

      construction:
        typeof data.construction === "string"
          ? data.construction
          : defaultBranches.construction,
    };
  } catch {
    return { ...defaultBranches };
  }
}

// Şube bilgilerini kaydet
export function saveBranches(
  branches: Record<SectorId, string>
): boolean {
  try {
    localStorage.setItem(
      BRANCH_KEY,
      JSON.stringify(branches)
    );

    return true;
  } catch {
    return false;
  }
}
