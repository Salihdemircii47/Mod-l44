const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

export interface CustomerDto {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  createdAt: string;
}

export interface CreateCustomerDto {
  fullName: string;
  phone?: string;
  email?: string | null;
  address?: string | null;
}

async function customerRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `API hatası ${response.status}: ${message}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const content = await response.text();

  return content
    ? (JSON.parse(content) as T)
    : (undefined as T);
}

export function getCustomers(): Promise<CustomerDto[]> {
  return customerRequest<CustomerDto[]>("/api/Customers");
}

export function getCustomerById(
  id: number
): Promise<CustomerDto> {
  return customerRequest<CustomerDto>(
    `/api/Customers/${id}`
  );
}

export function createCustomer(
  data: CreateCustomerDto
): Promise<CustomerDto> {
  return customerRequest<CustomerDto>(
    "/api/Customers",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function deleteCustomer(
  id: number
): Promise<void> {
  return customerRequest<void>(
    `/api/Customers/${id}`,
    {
      method: "DELETE",
    }
  );
}