
import type { SectorId } from "../data/sectors";

export type AppointmentStatus = "Onaylandı" | "İptal";

export type Appointment = {
  id: string;
  sectorId: SectorId;

  customer: string;
  service: string;

  resource: string;
  additionalResources?: string[];
  extraResourceIds?: string[];

  date: string;
  time: string;
  duration: number;

  status: AppointmentStatus;
};

export type CreateAppointmentRequest = {
  sectorId: SectorId;
  serviceId: string;
  customer: string;

  resource: string;
  additionalResources: string[];
  extraResourceIds: string[];

  date: string;
  time: string;
};

export type AvailabilityResponse = {
  available: boolean;
  reason: string;
  suggestedTimes?: string[];
};
