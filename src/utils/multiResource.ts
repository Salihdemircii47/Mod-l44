
import type { SectorId } from "../data/sectors";
import {
  checkAvailability,
  type BookingForCheck,
} from "./availability";

export type MultiResourceRequest = {
  sectorId: SectorId;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  resources: string[];
  appointments: BookingForCheck[];
};

export function checkMultiResourceAvailability(
  request: MultiResourceRequest
) {
  const resources = [...new Set(request.resources)];

  if (resources.length === 0) {
    return {
      available: false,
      reason: "En az bir kaynak seçmelisiniz.",
    };
  }

  for (const resource of resources) {
    const result = checkAvailability({
      sectorId: request.sectorId,
      serviceId: request.serviceId,
      date: request.date,
      time: request.time,
      duration: request.duration,
      resource,
      appointments: request.appointments,
    });

    if (!result.available) {
      return {
        available: false,
        reason: `${resource}: ${result.reason}`,
      };
    }
  }

  return {
    available: true,
    reason: "Seçilen tüm kaynaklar müsait.",
  };
}

export function suggestMultiResourceTimes(
  request: MultiResourceRequest,
  count = 4
): string[] {
  const suggestions: string[] = [];

  // Demo çalışma aralığı: 09.00–18.00.
  for (
    let start = 9 * 60;
    start + request.duration <= 18 * 60;
    start += 15
  ) {
    const time = `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(
      start % 60
    ).padStart(2, "0")}`;

    if (
      checkMultiResourceAvailability({
        ...request,
        time,
      }).available
    ) {
      suggestions.push(time);
    }

    if (suggestions.length >= count) break;
  }

  return suggestions;
}
