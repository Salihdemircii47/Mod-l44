
import type { SectorId } from "../data/sectors";

import type {
  ResourceCatalog,
  ResourceSetting,
} from "../types/resource";

import {
  loadResourceSettings,
  saveResourceSettings,
} from "../features/resources/resourceStorage";

import {
  loadExtraResources,
  saveExtraResources,
  type ExtraResource,
} from "../data/extraResources";

import {
  API_MODE,
  apiRequest,
  ApiError,
} from "./client";

// Tüm personel / araç / ekip ayarlarını getir
export async function getResourceCatalog(): Promise<
  ResourceCatalog
> {
  if (API_MODE === "mock") {
    return loadResourceSettings();
  }

  return apiRequest<ResourceCatalog>("/resources");
}

// Belirli sektörün kaynaklarını getir
export async function getResources(
  sectorId: SectorId
): Promise<ResourceSetting[]> {
  if (API_MODE === "mock") {
    return loadResourceSettings()[sectorId];
  }

  return apiRequest<ResourceSetting[]>(
    `/resources?sectorId=${encodeURIComponent(sectorId)}`
  );
}

// Kaynak çalışma saatleri / izin günü / durumunu güncelle
export async function updateResource(
  sectorId: SectorId,
  resourceName: string,
  changes: Partial<ResourceSetting>
): Promise<ResourceSetting> {
  if (API_MODE === "http") {
    return apiRequest<ResourceSetting>(
      `/resources/${encodeURIComponent(resourceName)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          sectorId,
          ...changes,
        }),
      }
    );
  }

  const catalog = loadResourceSettings();
  const old = catalog[sectorId].find(
    (item) => item.name === resourceName
  );

  if (!old) {
    throw new ApiError(404, "Kaynak bulunamadı.");
  }

  const updated = { ...old, ...changes };

  if (
    !updated.startTime ||
    !updated.endTime ||
    updated.startTime >= updated.endTime
  ) {
    throw new ApiError(
      400,
      "Bitiş saati başlangıçtan sonra olmalıdır."
    );
  }

  const next: ResourceCatalog = {
    ...catalog,
    [sectorId]: catalog[sectorId].map((item) =>
      item.name === resourceName ? updated : item
    ),
  };

  if (!saveResourceSettings(next)) {
    throw new ApiError(
      500,
      "Kaynak ayarları kaydedilemedi."
    );
  }

  return updated;
}

// Tüm vardiya / kaynak ayarlarını kaydet
export async function updateResourceCatalog(
  catalog: ResourceCatalog
): Promise<void> {
  if (API_MODE === "http") {
    return apiRequest<void>("/resources/settings", {
      method: "PUT",
      body: JSON.stringify(catalog),
    });
  }

  if (!saveResourceSettings(catalog)) {
    throw new ApiError(
      500,
      "Kaynak ayarları kaydedilemedi."
    );
  }
}

// Oda, ekipman, operatör gibi ek kaynakları getir
export async function getExtraResources(
  sectorId: SectorId
): Promise<ExtraResource[]> {
  if (API_MODE === "mock") {
    return loadExtraResources().filter(
      (item) => item.sectorId === sectorId
    );
  }

  return apiRequest<ExtraResource[]>(
    `/extra-resources?sectorId=${encodeURIComponent(sectorId)}`
  );
}

// Yeni ek kaynak oluştur
export async function createExtraResource(
  input: Omit<ExtraResource, "id">
): Promise<ExtraResource> {
  if (API_MODE === "http") {
    return apiRequest<ExtraResource>(
      "/extra-resources",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
  }

  const resources = loadExtraResources();

  const created: ExtraResource = {
    ...input,
    id: crypto.randomUUID(),
  };

  if (!saveExtraResources([...resources, created])) {
    throw new ApiError(
      500,
      "Ek kaynak kaydedilemedi."
    );
  }

  return created;
}

// Ek kaynağı aktif / pasif yap veya düzenle
export async function updateExtraResource(
  id: string,
  changes: Partial<Omit<ExtraResource, "id">>
): Promise<ExtraResource> {
  if (API_MODE === "http") {
    return apiRequest<ExtraResource>(
      `/extra-resources/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(changes),
      }
    );
  }

  const resources = loadExtraResources();
  const existing = resources.find(
    (item) => item.id === id
  );

  if (!existing) {
    throw new ApiError(
      404,
      "Ek kaynak bulunamadı."
    );
  }

  const updated: ExtraResource = {
    ...existing,
    ...changes,
  };

  const next = resources.map((item) =>
    item.id === id ? updated : item
  );

  if (!saveExtraResources(next)) {
    throw new ApiError(
      500,
      "Ek kaynak güncellenemedi."
    );
  }

  return updated;
}

// Ek kaynak sil
export async function deleteExtraResource(
  id: string
): Promise<void> {
  if (API_MODE === "http") {
    return apiRequest<void>(
      `/extra-resources/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  }

  const resources = loadExtraResources();

  const next = resources.filter(
    (item) => item.id !== id
  );

  if (next.length === resources.length) {
    throw new ApiError(
      404,
      "Silinecek ek kaynak bulunamadı."
    );
  }

  if (!saveExtraResources(next)) {
    throw new ApiError(
      500,
      "Ek kaynak silinemedi."
    );
  }
}
