const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

export interface BackendAppointment {
  id: number;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  resourceId: number;
  resourceName: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
}

export interface CreateBackendAppointment {
  customerId: number;
  serviceId: number;
  resourceId: number;
  startTime: string;
  endTime: string;
  notes: string | null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${BASE_URL}${path}`,
    { ...options, headers }
  );

  if (!response.ok) {
    const details = await response.text();

    throw new Error(
      `HTTP ${response.status}: ${details || "İşlem başarısız."}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.text();

  return body
    ? (JSON.parse(body) as T)
    : (undefined as T);
}

export function getBackendAppointments():
  Promise<BackendAppointment[]> {
  return request<BackendAppointment[]>("/api/Appointments");
}

export function createBackendAppointment(
  data: CreateBackendAppointment
): Promise<BackendAppointment> {
  return request<BackendAppointment>(
    "/api/Appointments",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function cancelBackendAppointment(
  id: number
): Promise<void> {
  return request<void>(
    `/api/Appointments/${id}/cancel`,
    { method: "PATCH" }
  );
}

export function rescheduleBackendAppointment(
  id: number,
  startTime: string,
  endTime: string
): Promise<void> {
  return request<void>(
    `/api/Appointments/${id}/reschedule`,
    {
      method: "PATCH",
      body: JSON.stringify({ startTime, endTime }),
    }
  );
}