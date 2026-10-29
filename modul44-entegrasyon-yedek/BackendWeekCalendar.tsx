import { useEffect, useState } from "react";

import WeekCalendar from "./WeekCalendar";

import type { SectorId } from "../data/sectors";
import type { Appointment } from "../types/appointment";

import {
  getBackendAppointments,
  type BackendAppointment,
} from "../api/backendAppointmentsApi";

import {
  getBackendResources,
  type BackendResource,
} from "../api/backendResourcesApi";

import { normalizeSector } from "../utils/sectorMapping";

type Props = {
  sectorId: SectorId;
};

const TIME_ZONE = "Europe/Istanbul";

function localDateTime(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Geçersiz randevu tarihi: ${iso}`);
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    time: `${read("hour")}:${read("minute")}`,
  };
}

function toCalendarAppointment(
  appointment: BackendAppointment,
  sectorId: SectorId
): Appointment {
  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);

  const local = localDateTime(appointment.startTime);

  return {
    id: `db-${appointment.id}`,
    sectorId,
    customer: appointment.customerName,
    service: appointment.serviceName,
    resource: appointment.resourceName,
    additionalResources: [],
    extraResourceIds: [],
    date: local.date,
    time: local.time,
    duration: Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 60000)
    ),
    status: appointment.status.toLowerCase().includes("cancel")
      || appointment.status.toLocaleLowerCase("tr-TR").includes("iptal")
      ? "İptal"
      : "Onaylandı",
  };
}

function todayInTurkey() {
  return localDateTime(new Date().toISOString()).date;
}

export default function BackendWeekCalendar({
  sectorId,
}: Props) {
  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [resources, setResources] =
    useState<BackendResource[]>([]);

  const [selectedDate, setSelectedDate] =
    useState(todayInTurkey);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const [appointmentsData, resourcesData] =
        await Promise.all([
          getBackendAppointments(),
          getBackendResources(),
        ]);

      setAppointments(appointmentsData);
      setResources(resourcesData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gerçek takvim yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    Promise.all([
      getBackendAppointments(),
      getBackendResources(),
    ])
      .then(([appointmentsData, resourcesData]) => {
        if (!alive) return;
        setAppointments(appointmentsData);
        setResources(resourcesData);
      })
      .catch((err: unknown) => {
        if (alive) {
          setError(
            err instanceof Error
              ? err.message
              : "Takvim yüklenemedi."
          );
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function handleUpdated() {
      void refresh();
    }

    window.addEventListener(
      "mod44:appointments-updated",
      handleUpdated
    );

    return () => {
      window.removeEventListener(
        "mod44:appointments-updated",
        handleUpdated
      );
    };
  }, []);

  const sectorResourceNames = resources
    .filter((r) => normalizeSector(r.sector) === sectorId)
    .map((r) => r.name);

  const sectorResourceIds = new Set(
    resources
      .filter((r) => normalizeSector(r.sector) === sectorId)
      .map((r) => r.id)
  );

  const sectorAppointments = appointments.filter(
    (a) => sectorResourceIds.has(a.resourceId)
  );

  const calendarAppointments = sectorAppointments.map(
    (a) => toCalendarAppointment(a, sectorId)
  );

  const allResourceNames = Array.from(
    new Set([
      ...sectorResourceNames,
      ...sectorAppointments.map((a) => a.resourceName),
    ])
  );

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            Gerçek PostgreSQL Randevu Takvimi
          </h2>
          <p className="mt-1 text-xs text-[#8ca5c6]">
            Canlı API verileri · Türkiye saati
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="rounded-xl border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Yenile"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-rose-400">
          {error}
        </p>
      )}

      <label className="block max-w-xs space-y-2 text-sm text-[#9db5d4]">
        <span>Takvim tarihi</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) {
              setSelectedDate(e.target.value);
            }
          }}
          className="w-full rounded-xl border border-[#304963] bg-[#0b1728] p-3 text-white [color-scheme:dark]"
        />
      </label>

      {!error && !loading && (
        <>
          <p className="text-sm text-emerald-400">
            Bu sektörde {calendarAppointments.filter(
              (a) => a.status !== "İptal"
            ).length} aktif randevu kaydı
          </p>

          <WeekCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            appointments={calendarAppointments}
            resources={allResourceNames}
          />
        </>
      )}
    </section>
  );
}