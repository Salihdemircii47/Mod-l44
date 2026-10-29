
import { useCallback, useEffect, useMemo, useState } from "react";

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

import {
  getMultiResourceAppointmentById,
} from "../api/backendMultiResourceAppointmentsApi";

import { normalizeSector } from "../utils/sectorMapping";

const TZ = "Europe/Istanbul";

type Props = {
  sectorId: SectorId;
};

type AppointmentWithResources = BackendAppointment & {
  assignedResourceIds: number[];
  assignedResourceNames: string[];
};

function turkeyParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));

  const value = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

function cancelled(status: string): boolean {
  const s = status.toLocaleLowerCase("tr-TR");

  return s.includes("cancel") || s.includes("iptal");
}

export default function BackendWeekCalendar({
  sectorId,
}: Props) {
  const [appointments, setAppointments] =
    useState<AppointmentWithResources[]>([]);

  const [resources, setResources] =
    useState<BackendResource[]>([]);

  const [selectedDate, setSelectedDate] = useState(
    () => turkeyParts(new Date().toISOString()).date
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [items, resourceList] = await Promise.all([
        getBackendAppointments(),
        getBackendResources(),
      ]);

      // Normal randevu listesi sadece ana kaynağı içeriyor.
      // Çoklu kaynak endpoint'inden bütün atamaları alıyoruz.
      const details = await Promise.allSettled(
        items.map((item) =>
          getMultiResourceAppointmentById(item.id)
        )
      );

      const combined = items.map((item, index) => {
        const detail = details[index];

        const assignments =
          detail.status === "fulfilled"
            ? detail.value.resources
            : [];

        return {
          ...item,

          assignedResourceIds: Array.from(
            new Set([
              item.resourceId,
              ...assignments.map((r) => r.resourceId),
            ])
          ),

          assignedResourceNames: Array.from(
            new Set(
              [
                item.resourceName,
                ...assignments.map((r) => r.resourceName),
              ].filter(Boolean)
            )
          ),
        };
      });

      setAppointments(combined);
      setResources(resourceList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Takvim verileri alınamadı."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const updated = () => void refresh();

    window.addEventListener(
      "mod44:appointments-updated",
      updated
    );

    window.addEventListener(
      "mod44:resources-updated",
      updated
    );

    return () => {
      window.removeEventListener(
        "mod44:appointments-updated",
        updated
      );

      window.removeEventListener(
        "mod44:resources-updated",
        updated
      );
    };
  }, [refresh]);

  const { calendarAppointments, resourceNames } =
    useMemo(() => {
      const sectorResources = resources.filter(
        (r) => normalizeSector(r.sector) === sectorId
      );

      const ids = new Set(
        sectorResources.map((r) => r.id)
      );

      const sectorItems = appointments.filter(
        (a) =>
          a.assignedResourceIds.some((id) => ids.has(id))
      );

      const entries: Appointment[] = sectorItems.map(
        (a) => {
          const t = turkeyParts(a.startTime);

          const duration =
            (
              new Date(a.endTime).getTime() -
              new Date(a.startTime).getTime()
            ) / 60000;

          return {
            id: `db-${a.id}`,
            sectorId,
            customer: a.customerName,
            service: a.serviceName,
            resource: a.resourceName,

            additionalResources:
              a.assignedResourceNames.filter(
                (name) => name !== a.resourceName
              ),

            extraResourceIds: [],
            date: t.date,
            time: t.time,

            duration: Math.max(
              1,
              Math.round(duration)
            ),

            status: cancelled(a.status)
              ? "İptal"
              : "Onaylandı",
          };
        }
      );

      return {
        calendarAppointments: entries,

        resourceNames: Array.from(
          new Set([
            ...sectorResources.map((r) => r.name),
            ...sectorItems.flatMap(
              (a) => a.assignedResourceNames
            ),
          ])
        ),
      };
    }, [appointments, resources, sectorId]);

  const nextAppointment = calendarAppointments
    .filter(
      (a) =>
        a.status !== "İptal" &&
        new Date(
          `${a.date}T${a.time}:00+03:00`
        ).getTime() >= Date.now()
    )
    .sort((a, b) =>
      `${a.date}${a.time}`.localeCompare(
        `${b.date}${b.time}`
      )
    )[0];

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-5 text-white">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            Gerçek PostgreSQL Randevu Takvimi
          </h2>

          <p className="mt-1 text-xs text-[#8ca5c6]">
            Canlı randevular, ana ve yardımcı kaynaklar
            · Türkiye saati
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

      <div className="flex flex-wrap items-end gap-3">
        <label className="block max-w-xs space-y-2 text-sm text-[#9db5d4]">
          <span className="block">Takvim tarihi</span>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              e.target.value &&
              setSelectedDate(e.target.value)
            }
            className="w-full rounded-xl border border-[#304963] bg-[#0b1728] p-3 text-white [color-scheme:dark]"
          />
        </label>

        {nextAppointment && (
          <button
            type="button"
            onClick={() =>
              setSelectedDate(nextAppointment.date)
            }
            className="rounded-xl border border-[#304963] px-4 py-3 text-sm text-cyan-300"
          >
            Sonraki randevuya git
          </button>
        )}
      </div>

      {!loading && !error && (
        <>
          <p className="text-sm text-emerald-400">
            Bu sektörde{" "}
            {
              calendarAppointments.filter(
                (a) => a.status !== "İptal"
              ).length
            }{" "}
            aktif randevu
          </p>

          <WeekCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            appointments={calendarAppointments}
            resources={resourceNames}
          />
        </>
      )}
    </section>
  );
}
