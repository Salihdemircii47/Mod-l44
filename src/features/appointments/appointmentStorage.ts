
import type { Appointment } from "../../types/appointment";

const STORAGE_KEY = "mod44-demo-appointments-v1";

export const APPOINTMENTS_CHANGED =
  "mod44:appointments-changed";

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
        ["beauty", "fleet", "construction"].includes(
          item.sectorId
        ) &&
        typeof item.customer === "string" &&
        typeof item.service === "string" &&
        typeof item.resource === "string" &&
        typeof item.date === "string" &&
        typeof item.time === "string" &&
        typeof item.duration === "number" &&
        Number.isFinite(item.duration) &&
        (item.status === "Onaylandı" ||
          item.status === "İptal")
    );
  } catch {
    return [];
  }
}

export function saveAppointments(
  appointments: Appointment[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(appointments)
  );

  // Aynı sekmedeki Dashboard'u haberdar et.
  window.dispatchEvent(
    new Event(APPOINTMENTS_CHANGED)
  );
}
