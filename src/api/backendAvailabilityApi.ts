const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

// Backend'in gönderdiği bir uygun saat aralığı
export interface AvailableSlot {
  startTime: string;
  endTime: string;
  startUtc: string;
  endUtc: string;
}

// Tek kaynak müsaitlik sonucu
export interface ResourceAvailabilityResponse {
  resourceId: number;
  serviceId: number;
  date: string;
  durationMinutes: number;
  availableSlots: AvailableSlot[];
}

// Çoklu kaynak müsaitlik sonucu
export interface MultiResourceAvailabilityResponse {
  serviceId: number;
  date: string;
  durationMinutes: number;
  resourceIds: number[];
  availableSlots: AvailableSlot[];
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${details || "Müsaitlik alınamadı."}`
    );
  }

  return (await response.json()) as T;
}

// Tek personel, araç veya ekipman için uygun saatler
export function getResourceAvailability(
  resourceId: number,
  serviceId: number,
  date: string
): Promise<ResourceAvailabilityResponse> {
  const params = new URLSearchParams({
    date,
    serviceId: String(serviceId),
  });

  return getJson<ResourceAvailabilityResponse>(
    `/api/Availability/resource/${resourceId}?${params.toString()}`
  );
}

// Birden fazla kaynağın aynı anda uygun olduğu saatler
export function getMultiResourceAvailability(
  resourceIds: number[],
  serviceId: number,
  date: string
): Promise<MultiResourceAvailabilityResponse> {
  if (resourceIds.length === 0) {
    return Promise.reject(
      new Error("En az bir kaynak seçilmelidir.")
    );
  }

  const params = new URLSearchParams({
    serviceId: String(serviceId),
    date,
  });

  resourceIds.forEach((id) => {
    params.append("resourceIds", String(id));
  });

  return getJson<MultiResourceAvailabilityResponse>(
    `/api/MultiResourceAvailability?${params.toString()}`
  );
}