export interface BackendService {
  id: number;
  name: string;
  sector: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

export type ServicePayload = Omit<
  BackendService,
  "id"
>;

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

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
    const message = await response.text();

    throw new Error(
      `API hatası ${response.status}: ${message}`
    );
  }

  const text = await response.text();

  return text
    ? (JSON.parse(text) as T)
    : (undefined as T);
}

export function getBackendServices() {
  return request<BackendService[]>("/api/Services");
}

export function createBackendService(
  input: ServicePayload
) {
  return request<BackendService>("/api/Services", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateBackendService(
  id: number,
  input: ServicePayload
): Promise<void> {
  await request<unknown>(`/api/Services/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteBackendService(
  id: number
): Promise<void> {
  await request<unknown>(`/api/Services/${id}`, {
    method: "DELETE",
  });
}