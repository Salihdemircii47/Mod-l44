
import type { SectorId } from "../data/sectors";
import { loadExtraResources } from "../data/extraResources";
import {
  checkMultiResourceAvailability,
  type MultiResourceRequest,
} from "./multiResource";

export type ExtendedAppointment = {
  sectorId: SectorId;
  date: string;
  time: string;
  duration: number;
  status: string;
  extraResourceIds?: string[];
};

export type ExtendedBookingRequest =
  MultiResourceRequest & {
    extraResourceIds: string[];
    existingAppointments: ExtendedAppointment[];
  };

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function checkExtendedAvailability(
  request: ExtendedBookingRequest
): { available: boolean; reason: string } {
  // Önce ana ve yardımcı kaynakların uygunluğunu kontrol et.
  const mainResult = checkMultiResourceAvailability(request);

  if (!mainResult.available) {
    return mainResult;
  }

  const allResources = loadExtraResources();

  const selectedIds = [...new Set(request.extraResourceIds)];

  // Kullanıcının gönderdiği her ek kaynak var ve aktif olmalı.
  for (const id of selectedIds) {
    const resource = allResources.find(
      (item) =>
        item.id === id &&
        item.sectorId === request.sectorId
    );

    if (!resource) {
      return {
        available: false,
        reason: "Seçilen ek kaynak bulunamadı.",
      };
    }

    if (!resource.active) {
      return {
        available: false,
        reason: `${resource.name} pasif durumda.`,
      };
    }

    const requestedStart = toMinutes(request.time);
    const requestedEnd =
      requestedStart + request.duration;

    if (
      !Number.isFinite(requestedStart) ||
      !Number.isFinite(requestedEnd)
    ) {
      return {
        available: false,
        reason: "Geçersiz randevu saati veya süresi.",
      };
    }

    // Aynı oda/ekipman başka aktif randevuda kullanılıyor mu?
    const conflict = request.existingAppointments.find(
      (booking) => {
        if (
          booking.sectorId !== request.sectorId ||
          booking.date !== request.date ||
          booking.status === "İptal" ||
          !(booking.extraResourceIds ?? []).includes(id)
        ) {
          return false;
        }

        const existingStart = toMinutes(booking.time);
        const existingEnd =
          existingStart + booking.duration;

        return (
          requestedStart < existingEnd &&
          requestedEnd > existingStart
        );
      }
    );

    if (conflict) {
      return {
        available: false,
        reason:
          `${resource.name} seçilen saatlerde ` +
          "başka bir randevuda kullanılıyor.",
      };
    }
  }

  return {
    available: true,
    reason: "Tüm kaynaklar seçilen saatte müsait.",
  };
}

export function suggestExtendedTimes(
  request: ExtendedBookingRequest,
  count = 4
): string[] {
  const results: string[] = [];

  for (
    let start = 9 * 60;
    start + request.duration <= 18 * 60;
    start += 15
  ) {
    const time =
      `${String(Math.floor(start / 60)).padStart(2, "0")}:` +
      `${String(start % 60).padStart(2, "0")}`;

    if (
      checkExtendedAvailability({
        ...request,
        time,
      }).available
    ) {
      results.push(time);
    }

    if (results.length >= count) break;
  }

  return results;
}
