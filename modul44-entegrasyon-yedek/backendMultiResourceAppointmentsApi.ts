const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

export interface AssignedResource {
  resourceId: number;
  role: string;
}

export interface CreateMultiResourceAppointment {
  customerId: number;
  serviceId: number;
  startTime: string;
  endTime: string;
  notes: string | null;
  resources: AssignedResource[];
}

export interface MultiResourceAppointment {
  id: number;
  customerId: number;
  serviceId: number;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  resources: Array<{
    resourceId: number;
    resourceName: string;
    role: string;
  }>;
}

export async function createMultiResourceAppointment(
  data: CreateMultiResourceAppointment
): Promise<MultiResourceAppointment> {
  const response = await fetch(
    `${BASE_URL}/api/MultiResourceAppointments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Çoklu kaynak kaydedilemedi: HTTP ${response.status} - ` +
        (await response.text())
    );
  }

  return (await response.json()) as MultiResourceAppointment;
}