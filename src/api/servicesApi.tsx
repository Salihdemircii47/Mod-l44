
import type { SectorId } from "../data/sectors";

import type {
  ServiceCatalog,
  ServiceItem,
} from "../types/service";

import {
  loadServices,
  saveServices,
  loadBranches,
  saveBranches,
} from "../features/services/serviceStorage";

import {
  API_MODE,
  apiRequest,
  ApiError,
} from "./client";

export type ServiceCreateInput = Omit<
  ServiceItem,
  "id"
>;

// Tüm hizmetleri getir
export async function getServiceCatalog(): Promise<
  ServiceCatalog
> {
  if (API_MODE === "mock") {
    return loadServices();
  }

  return apiRequest<ServiceCatalog>("/services");
}

// Bir sektöre ait hizmetleri getir
export async function getServices(
  sectorId: SectorId
): Promise<ServiceItem[]> {
  if (API_MODE === "mock") {
    return loadServices()[sectorId];
  }

  return apiRequest<ServiceItem[]>(
    `/services?sectorId=${encodeURIComponent(sectorId)}`
  );
}

// Yeni hizmet ekle
export async function createService(
  sectorId: SectorId,
  input: ServiceCreateInput
): Promise<ServiceItem> {
  if (API_MODE === "http") {
    return apiRequest<ServiceItem>("/services", {
      method: "POST",
      body: JSON.stringify({
        sectorId,
        ...input,
      }),
    });
  }

  if (!input.name.trim()) {
    throw new ApiError(400, "Hizmet adı gerekli.");
  }

  if (
    !Number.isInteger(input.duration) ||
    input.duration < 15 ||
    input.duration > 1440
  ) {
    throw new ApiError(
      400,
      "Hizmet süresi 15–1440 dakika olmalıdır."
    );
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new ApiError(400, "Hizmet fiyatı geçersiz.");
  }

  const catalog = loadServices();

  if (
    catalog[sectorId].some(
      (item) =>
        item.name.toLocaleLowerCase("tr-TR") ===
        input.name.trim().toLocaleLowerCase("tr-TR")
    )
  ) {
    throw new ApiError(
      409,
      "Bu isimde bir hizmet zaten mevcut."
    );
  }

  const service: ServiceItem = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    duration: input.duration,
    price: input.price,
    active: input.active,
  };

  const next: ServiceCatalog = {
    ...catalog,
    [sectorId]: [...catalog[sectorId], service],
  };

  if (!saveServices(next)) {
    throw new ApiError(500, "Hizmet kaydedilemedi.");
  }

  return service;
}

// Hizmet güncelle
export async function updateService(
  sectorId: SectorId,
  id: string,
  changes: Partial<ServiceCreateInput>
): Promise<ServiceItem> {
  if (API_MODE === "http") {
    return apiRequest<ServiceItem>(
      `/services/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(changes),
      }
    );
  }

  const catalog = loadServices();

  const oldService = catalog[sectorId].find(
    (item) => item.id === id
  );

  if (!oldService) {
    throw new ApiError(404, "Hizmet bulunamadı.");
  }

  const updated: ServiceItem = {
    ...oldService,
    ...changes,
  };

  if (!updated.name.trim()) {
    throw new ApiError(400, "Hizmet adı boş olamaz.");
  }

  updated.name = updated.name.trim();

  if (
    !Number.isInteger(updated.duration) ||
    updated.duration < 15 ||
    updated.duration > 1440
  ) {
    throw new ApiError(400, "Geçersiz hizmet süresi.");
  }

  if (
    !Number.isFinite(updated.price) ||
    updated.price < 0
  ) {
    throw new ApiError(400, "Geçersiz hizmet fiyatı.");
  }

  if (
    catalog[sectorId].some(
      (item) =>
        item.id !== id &&
        item.name.toLocaleLowerCase("tr-TR") ===
          updated.name.toLocaleLowerCase("tr-TR")
    )
  ) {
    throw new ApiError(
      409,
      "Bu isimde başka bir hizmet var."
    );
  }

  const next: ServiceCatalog = {
    ...catalog,
    [sectorId]: catalog[sectorId].map((item) =>
      item.id === id ? updated : item
    ),
  };

  if (!saveServices(next)) {
    throw new ApiError(500, "Hizmet güncellenemedi.");
  }

  return updated;
}

// Hizmet sil
export async function deleteService(
  sectorId: SectorId,
  id: string
): Promise<void> {
  if (API_MODE === "http") {
    return apiRequest<void>(
      `/services/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  }

  const catalog = loadServices();

  if (!catalog[sectorId].some((item) => item.id === id)) {
    throw new ApiError(404, "Hizmet bulunamadı.");
  }

  const next: ServiceCatalog = {
    ...catalog,
    [sectorId]: catalog[sectorId].filter(
      (item) => item.id !== id
    ),
  };

  if (!saveServices(next)) {
    throw new ApiError(500, "Hizmet silinemedi.");
  }
}

// Şube adlarını oku
export async function getBranches(): Promise<
  Record<SectorId, string>
> {
  if (API_MODE === "mock") {
    return loadBranches();
  }

  return apiRequest<Record<SectorId, string>>(
    "/branches"
  );
}

// Şube adlarını kaydet
export async function updateBranches(
  branches: Record<SectorId, string>
): Promise<void> {
  if (API_MODE === "http") {
    return apiRequest<void>("/branches", {
      method: "PUT",
      body: JSON.stringify(branches),
    });
  }

  if (!saveBranches(branches)) {
    throw new ApiError(
      500,
      "Şube bilgileri kaydedilemedi."
    );
  }
}
