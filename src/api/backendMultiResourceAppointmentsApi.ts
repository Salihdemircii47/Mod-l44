
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

export interface AssignedResource {
  resourceId: number;
  role: string;
}

export interface AssignedResourceDetail
  extends AssignedResource {
  resourceName: string;
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
  resources: AssignedResourceDetail[];
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${await response.text()}`
    );
  }

  return (await response.json()) as T;
}

export function createMultiResourceAppointment(
  data: CreateMultiResourceAppointment
): Promise<MultiResourceAppointment> {
  return request<MultiResourceAppointment>(
    "/api/MultiResourceAppointments",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function getMultiResourceAppointmentById(
  id: number
): Promise<MultiResourceAppointment> {
  return request<MultiResourceAppointment>(
    `/api/MultiResourceAppointments/${id}`
  );
}
