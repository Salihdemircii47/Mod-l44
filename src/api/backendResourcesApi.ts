export interface BackendResource {
  id: number;
  name: string;
  type: string;
  sector: string;
  isActive: boolean;
}

export interface CreateBackendResource {
  name: string;
  type: string;
  sector: string;
}

export interface UpdateBackendResource
  extends CreateBackendResource {
  isActive: boolean;
}

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
      `Kaynak API hatasi (${response.status}): ${message}`
    );
  }

  const content = await response.text();

  return content
    ? (JSON.parse(content) as T)
    : (undefined as T);
}

export function getBackendResources():
  Promise<BackendResource[]> {
  return request<BackendResource[]>("/api/Resources");
}

export function createBackendResource(
  input: CreateBackendResource
): Promise<BackendResource> {
  return request<BackendResource>("/api/Resources", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateBackendResource(
  id: number,
  input: UpdateBackendResource
): Promise<void> {
  return request<void>(`/api/Resources/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteBackendResource(
  id: number
): Promise<void> {
  return request<void>(`/api/Resources/${id}`, {
    method: "DELETE",
  });
}