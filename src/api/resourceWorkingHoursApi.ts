export interface ResourceWorkingHour {
  id: number;
  resourceId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export type CreateWorkingHour = Omit<
  ResourceWorkingHour,
  "id"
>;

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

export async function getWorkingHours(
  resourceId: number
): Promise<ResourceWorkingHour[]> {
  const response = await fetch(
    `${BASE_URL}/api/ResourceWorkingHours/resource/${resourceId}`
  );

  if (!response.ok) {
    throw new Error(`Çalışma saatleri okunamadı: ${response.status}`);
  }

  return response.json() as Promise<ResourceWorkingHour[]>;
}

export async function createWorkingHour(
  data: CreateWorkingHour
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/api/ResourceWorkingHours`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Çalışma saati kaydedilemedi: ${response.status} - ` +
      await response.text()
    );
  }
}

export async function deleteWorkingHour(
  id: number
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}/api/ResourceWorkingHours/${id}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(
      `Çalışma saati silinemedi: ${response.status}`
    );
  }
}