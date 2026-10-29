
import { useEffect, useState } from "react";

import type { SectorId } from "../../../data/sectors";
import type { Appointment } from "../../../types/appointment";

import {
  APPOINTMENTS_CHANGED,
  loadAppointments,
} from "../appointmentStorage";

function todayKey(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useDashboardStats(
  sectorId: SectorId
) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(loadAppointments);

  useEffect(() => {
    function refresh() {
      setAppointments(loadAppointments());
    }

    // Aynı sekmede oluşturulan kayıtlar
    window.addEventListener(
      APPOINTMENTS_CHANGED,
      refresh
    );

    // Başka bir sekmede yapılan değişiklikler
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        APPOINTMENTS_CHANGED,
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );
    };
  }, []);

  const today = todayKey();

  const sectorAppointments = appointments.filter(
    (item) => item.sectorId === sectorId
  );

  const activeAppointments =
    sectorAppointments.filter(
      (item) => item.status === "Onaylandı"
    );

  const todayAppointments =
    activeAppointments.filter(
      (item) => item.date === today
    );

  const cancelledAppointments =
    sectorAppointments.filter(
      (item) => item.status === "İptal"
    );

  const upcomingAppointments =
    activeAppointments
      .filter(
        (item) =>
          `${item.date}T${item.time}` >=
          new Date().toISOString().slice(0, 10) +
            "T00:00"
      )
      .sort((a, b) =>
        `${a.date}T${a.time}`.localeCompare(
          `${b.date}T${b.time}`
        )
      );

  const busyResourceNames = new Set(
    todayAppointments.flatMap((item) => [
      item.resource,
      ...(item.additionalResources ?? []),
    ])
  );

  return {
    totalAppointments: sectorAppointments.length,
    activeCount: activeAppointments.length,
    todayCount: todayAppointments.length,
    cancelledCount: cancelledAppointments.length,
    busyResourceCount: busyResourceNames.size,
    todayAppointments,
    upcomingAppointments,
  };
}
