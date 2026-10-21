
import type { SectorId } from "../data/sectors";
import { loadResourceSettings } from "../pages/ResourcesPage";

import { isResourceAllowed } from "./serviceResources";
import { resourceDefaults } from "../pages/ResourcesPage";


export type BookingForCheck = {
  sectorId: SectorId;
  date: string;
  time: string;
  resource: string;
  duration: number;
  status: string;
  additionalResources?: string[];
};

type AvailabilityRequest = {
  sectorId: SectorId;
  date: string;
  time: string;
  duration: number;
  resource: string;
  appointments: BookingForCheck[];
  serviceId?: string
};

export type AvailabilityResult = {
  available: boolean;
  reason: string;
};

const sectorRules: Record<
  SectorId,
  {
    opening: number;
    closing: number;
    buffer: number;
    closedDays: number[];
  }
> = {
  beauty: {
    opening: 9 * 60,
    closing: 18 * 60,
    buffer: 15,
    closedDays: [0],
  },
  fleet: {
    opening: 9 * 60,
    closing: 18 * 60,
    buffer: 30,
    closedDays: [0],
  },
  construction: {
    opening: 9 * 60,
    closing: 18 * 60,
    buffer: 30,
    closedDays: [0],
  },
};

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function toTime(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(
    value % 60
  ).padStart(2, "0")}`;
}

function weekday(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

export function getBufferMinutes(sectorId: SectorId): number {
  return sectorRules[sectorId].buffer;
}

export function checkAvailability(
  request: AvailabilityRequest
): AvailabilityResult {
  const {
    sectorId,
    date,
    time,
    duration,
    resource,
    appointments,
  } = request;

  const rule = sectorRules[sectorId];
  
if (
  request.serviceId &&
  !isResourceAllowed(
    sectorId,
    request.serviceId,
    resource,
    resourceDefaults[sectorId].map((item) => item.name)
  )
) {
  return {
    available: false,
    reason:
      `${resource}, seçilen hizmet için yetkili ` +
      "veya uygun kaynak olarak tanımlanmamış.",
  };
}


  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(time) ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return {
      available: false,
      reason: "Geçerli tarih, saat ve hizmet süresi seçiniz.",
    };
  }

  const day = weekday(date);
  const start = toMinutes(time);
  const end = start + duration;

  if (
    !Number.isFinite(start) ||
    start < 0 ||
    start >= 1440 ||
    start % 60 >= 60
  ) {
    return {
      available: false,
      reason: "Geçerli bir saat seçiniz.",
    };
  }

  if (rule.closedDays.includes(day)) {
    return {
      available: false,
      reason: "İşletme seçilen gün kapalıdır.",
    };
  }

  // Yönetim panelinde kaydedilen kaynak ayarlarını oku.
  const settings = loadResourceSettings();
  const selectedResource = settings[sectorId].find(
    (item) => item.name === resource
  );

  if (!selectedResource) {
    return {
      available: false,
      reason: "Seçilen kaynak bulunamadı.",
    };
  }

  if (!selectedResource.active) {
    return {
      available: false,
      reason: `${resource} şu anda pasif durumda.`,
    };
  }

  // dayOff = 7 ise haftalık izin yok.
  if (selectedResource.dayOff === day) {
    return {
      available: false,
      reason: `${resource} seçilen gün izinli.`,
    };
  }

  // İşletme ve kaynak mesai aralıklarının kesişimi.
  const opening = Math.max(
    rule.opening,
    toMinutes(selectedResource.startTime)
  );

  const closing = Math.min(
    rule.closing,
    toMinutes(selectedResource.endTime)
  );

  if (
    !Number.isFinite(opening) ||
    !Number.isFinite(closing) ||
    start < opening ||
    end > closing
  ) {
    return {
      available: false,
      reason:
        `${resource} için geçerli çalışma aralığı ` +
        `${toTime(opening)}–${toTime(closing)}. ` +
        "Hizmetin tamamı bu aralıkta olmalıdır.",
    };
  }

  // Aktif randevular ve hazırlık tamponu.
  const conflict = appointments.find((booking) => {
    if (
      booking.sectorId !== sectorId ||
      booking.date !== date ||
      
(
  booking.resource !== resource &&
  !(booking.additionalResources ?? []).includes(resource)
) ||

      booking.status === "İptal"
    ) {
      return false;
    }

    const existingStart = toMinutes(booking.time);
    const existingEnd = existingStart + booking.duration;

    return (
      start < existingEnd + rule.buffer &&
      end + rule.buffer > existingStart
    );
  });

  if (conflict) {
    return {
      available: false,
      reason:
        `${resource}, ${conflict.time} saatinde başlayan ` +
        `bir iş için rezerve edilmiş. ` +
        `${rule.buffer} dakikalık hazırlık süresi de ` +
        "hesaba katıldı.",
    };
  }

  return {
    available: true,
    reason: "Seçilen kaynak ve saat uygundur.",
  };
}

export function suggestAvailableTimes(
  request: AvailabilityRequest,
  count = 4
): string[] {
  const rule = sectorRules[request.sectorId];
  const settings = loadResourceSettings();
  const selectedResource = settings[request.sectorId].find(
    (item) => item.name === request.resource
  );

  if (!selectedResource) return [];

  const opening = Math.max(
    rule.opening,
    toMinutes(selectedResource.startTime)
  );

  const closing = Math.min(
    rule.closing,
    toMinutes(selectedResource.endTime)
  );

  const suggestions: string[] = [];

  // Çalışma saatleri içinde 15 dakikalık aralıklarla ara.
  for (
    let candidate = Math.ceil(opening / 15) * 15;
    candidate + request.duration <= closing;
    candidate += 15
  ) {
    const candidateTime = toTime(candidate);

    const result = checkAvailability({
      ...request,
      time: candidateTime,
    });

    if (result.available) {
      suggestions.push(candidateTime);
    }

    if (suggestions.length >= count) break;
  }

  return suggestions;
}
