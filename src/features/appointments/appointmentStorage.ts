import type { Appointment } from "../../types/appointment";

// Keep this key unchanged to preserve existing demo appointments.
const STORAGE_KEY = "mod44-demo-appointments-v1";

export function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is Appointment =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.sectorId === "string" &&
        typeof item.customer === "string" &&
        typeof item.service === "string" &&
        typeof item.resource === "string" &&
        typeof item.date === "string" &&
        typeof item.time === "string" &&
        typeof item.duration === "number" &&
        (item.status === "Onaylandı" || item.status === "İptal")
    );
  } catch {
    return [];
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}
