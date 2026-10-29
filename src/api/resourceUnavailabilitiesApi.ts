export interface ResourceUnavailability {
  id: number;
  resourceId: number;
  reason: string;
  startTime: string;
  endTime: string;
  description: string | null;
}

export type CreateUnavailability = Omit<
  ResourceUnavailability,
  "id"
>;

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

export async function getUnavailabilities(
  resourceId: number
): Promise<ResourceUnavailability[]> {
  const response = await fetch(
    `${BASE_URL}/api/ResourceUnavailabilities/resource/${resourceId}`
  );

  if (!response.ok) {
    throw new Error(`İzinler okunamadı: ${response.status}`);
  }

  return response.json() as Promise<ResourceUnavailability[]>;
}

export async function createUnavailability(
  data: CreateUnavailability
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/api/ResourceUnavailabilities`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `İzin kaydedilemedi: ${response.status} - ` +
      await response.text()
    );
  }
}

export async function deleteUnavailability(
  id: number
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/api/ResourceUnavailabilities/${id}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(`İzin silinemedi: ${response.status}`);
  }
}