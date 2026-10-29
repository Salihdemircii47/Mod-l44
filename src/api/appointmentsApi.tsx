
import type {
  Appointment,
  CreateAppointmentRequest,
  AvailabilityResponse,
} from "../types/appointment";

import {
  loadAppointments,
  saveAppointments,
} from "../features/appointments/appointmentStorage";

import { loadServices } from "../features/services/serviceStorage";

import {
  checkExtendedAvailability,
  suggestExtendedTimes,
} from "../utils/extraResourceAvailability";

import {
  API_MODE,
  apiRequest,
  ApiError,
} from "./client";

function getService(
  sectorId: CreateAppointmentRequest["sectorId"],
  serviceId: string
) {
  return loadServices()[sectorId].find(
    (item) => item.id === serviceId && item.active
  );
}

// Randevuları listele
export async function getAppointments(): Promise<
  Appointment[]
> {
  if (API_MODE === "mock") {
    return loadAppointments();
  }

  return apiRequest<Appointment[]>("/appointments");
}

// Yeni randevu öncesi müsaitlik kontrolü
export async function checkAppointmentAvailability(
  input: CreateAppointmentRequest
): Promise<AvailabilityResponse> {
  if (API_MODE === "http") {
    return apiRequest<AvailabilityResponse>(
      "/availability/check",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
  }

  const service = getService(
    input.sectorId,
    input.serviceId
  );

  if (!service) {
    return {
      available: false,
      reason: "Hizmet bulunamadı veya pasif durumda.",
    };
  }

  const appointments = loadAppointments();

  const selectedResources = [
    input.resource,
    ...input.additionalResources,
  ];

  const request = {
    sectorId: input.sectorId,
    serviceId: input.serviceId,
    date: input.date,
    time: input.time,
    duration: service.duration,
    resources: selectedResources,
    extraResourceIds: input.extraResourceIds,
    appointments,
    existingAppointments: appointments,
  };

  const result = checkExtendedAvailability(request);

  return {
    available: result.available,
    reason: result.reason,
    suggestedTimes: result.available
      ? []
      : suggestExtendedTimes(request),
  };
}

// Randevu oluştur
export async function createAppointment(
  input: CreateAppointmentRequest
): Promise<Appointment> {
  if (API_MODE === "http") {
    return apiRequest<Appointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  if (!input.customer.trim()) {
    throw new ApiError(
      400,
      "Müşteri veya iş adı boş olamaz."
    );
  }

  const service = getService(
    input.sectorId,
    input.serviceId
  );

  if (!service) {
    throw new ApiError(
      400,
      "Seçilen hizmet aktif değil veya bulunamadı."
    );
  }

  // Kontrolü kayıt işlemine olabildiğince yakın yap.
  const availability =
    await checkAppointmentAvailability(input);

  if (!availability.available) {
    throw new ApiError(409, availability.reason);
  }

  const appointment: Appointment = {
    id: crypto.randomUUID(),
    sectorId: input.sectorId,
    customer: input.customer.trim(),
    service: service.name,
    resource: input.resource,
    additionalResources: [
      ...input.additionalResources,
    ],
    extraResourceIds: [...input.extraResourceIds],
    date: input.date,
    time: input.time,
    duration: service.duration,
    status: "Onaylandı",
  };

  const appointments = loadAppointments();

  saveAppointments([...appointments, appointment]);

  return appointment;
}

// Randevu iptal et
export async function cancelAppointment(
  id: string
): Promise<Appointment> {
  if (API_MODE === "http") {
    return apiRequest<Appointment>(
      `/appointments/${encodeURIComponent(id)}/cancel`,
      { method: "POST" }
    );
  }

  const appointments = loadAppointments();
  const existing = appointments.find(
    (item) => item.id === id
  );

  if (!existing) {
    throw new ApiError(404, "Randevu bulunamadı.");
  }

  const cancelled: Appointment = {
    ...existing,
    status: "İptal",
  };

  saveAppointments(
    appointments.map((item) =>
      item.id === id ? cancelled : item
    )
  );

  return cancelled;
}
