
import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  BriefcaseBusiness,
  Plus,
  RefreshCw,
  Scissors,
  Truck,
  HardHat,
} from "lucide-react";

import { sectors } from "../data/sectors";
import type { SectorId } from "../data/sectors";

import {
  getBackendAppointments,
  type BackendAppointment,
} from "../api/backendAppointmentsApi";

import {
  getBackendResources,
  type BackendResource,
} from "../api/backendResourcesApi";

import {
  getBackendServices,
  type BackendService,
} from "../api/backendServicesApi";

import { normalizeSector } from "../utils/sectorMapping";

type DashboardProps = {
  sectorId: SectorId;
  onSectorChange: (id: SectorId) => void;
  onNewAppointment: () => void;
};

const sectorIcons = {
  beauty: Scissors,
  fleet: Truck,
  construction: HardHat,
};

function getTurkeyDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatTurkeyDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTurkeyTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function isCancelled(status: string): boolean {
  return ["cancelled", "canceled", "iptal"].includes(
    status.toLowerCase()
  );
}

export default function Dashboard({
  sectorId,
  onSectorChange,
  onNewAppointment,
}: DashboardProps) {
  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [resources, setResources] =
    useState<BackendResource[]>([]);

  const [services, setServices] =
    useState<BackendService[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [appointmentData, resourceData, serviceData] =
        await Promise.all([
          getBackendAppointments(),
          getBackendResources(),
          getBackendServices(),
        ]);

      setAppointments(appointmentData);
      setResources(resourceData);
      setServices(serviceData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Backend verileri alınamadı."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onUpdated = () => void refresh();

    window.addEventListener(
      "mod44:appointments-updated",
      onUpdated
    );

    return () => {
      window.removeEventListener(
        "mod44:appointments-updated",
        onUpdated
      );
    };
  }, [refresh]);

  const sectorResources = resources.filter(
    (item) =>
      normalizeSector(item.sector) === sectorId
  );

  const activeResources = sectorResources.filter(
    (item) => item.isActive
  );

  const sectorServices = services.filter(
    (item) =>
      normalizeSector(item.sector) === sectorId
  );

  const resourceIds = new Set(
    sectorResources.map((resource) => resource.id)
  );

  const serviceIds = new Set(
    sectorServices.map((service) => service.id)
  );

  const sectorAppointments = appointments.filter(
    (appointment) =>
      serviceIds.has(appointment.serviceId) ||
      resourceIds.has(appointment.resourceId)
  );

  const today = getTurkeyDate(new Date().toISOString());

  const todayAppointments = sectorAppointments.filter(
    (appointment) =>
      getTurkeyDate(appointment.startTime) === today &&
      !isCancelled(appointment.status)
  );

  const activeAppointments = sectorAppointments.filter(
    (appointment) => !isCancelled(appointment.status)
  );

  const cancelledAppointments = sectorAppointments.filter(
    (appointment) => isCancelled(appointment.status)
  );

  const upcomingAppointments = activeAppointments
    .filter(
      (appointment) =>
        new Date(appointment.startTime).getTime() >= Date.now()
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    )
    .slice(0, 8);

  const stats = [
    {
      label: "Bugünkü Randevular",
      value: todayAppointments.length,
      icon: CalendarDays,
    },
    {
      label: "Aktif Kaynaklar",
      value: activeResources.length,
      icon: Users,
    },
    {
      label: "Aktif Randevular",
      value: activeAppointments.length,
      icon: CheckCircle2,
    },
    {
      label: "Tanımlı Hizmetler",
      value: sectorServices.length,
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#203653] bg-[#101d30] p-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-cyan-400">
            MOD44 / OPERASYON MERKEZİ
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Genel Bakış
          </h1>

          <p className="mt-2 text-sm text-[#8299b7]">
            PostgreSQL üzerinden güncel operasyon verileri
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#355679] px-4 py-3 text-sm text-white disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Yenile
          </button>

          <button
            type="button"
            onClick={onNewAppointment}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Yeni Randevu
          </button>
        </div>
      </header>

      {/* SEKTÖR SEÇİMİ */}
      <div className="grid gap-3 md:grid-cols-3">
        {sectors.map((sector) => {
          const Icon = sectorIcons[sector.id];
          const selected = sectorId === sector.id;

          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => onSectorChange(sector.id)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${
                selected
                  ? "border-blue-500 bg-[#15345b]"
                  : "border-[#20324c] bg-[#101d30]"
              }`}
            >
              <Icon
                size={24}
                className="text-cyan-400"
              />

              <div>
                <p className="text-sm font-bold text-white">
                  {sector.name}
                </p>

                <p className="text-xs text-slate-400">
                  {selected ? "Aktif sektör" : "Sektörü aç"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          Backend bağlantı hatası: {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-400">
          Veriler yükleniyor...
        </p>
      )}

      {/* GERÇEK İSTATİSTİKLER */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#20324c] bg-[#101d30] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#91a9c9]">
                  {stat.label}
                </p>

                <Icon size={20} className="text-cyan-400" />
              </div>

              <p className="mt-4 text-3xl font-bold text-white">
                {loading ? "..." : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* BUGÜNÜN RANDEVULARI */}
      <section className="rounded-2xl border border-[#20324c] bg-[#101d30] p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white">
            Bugünkü Randevular
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Türkiye saatine göre bugünün kayıtları
          </p>
        </div>

        {!loading && todayAppointments.length === 0 ? (
          <p className="text-sm text-slate-400">
            Bugün için randevu bulunmuyor.
          </p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#29415d] bg-[#0b1728] p-4"
              >
                <div>
                  <p className="font-semibold text-white">
                    {appointment.customerName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {appointment.serviceName} ·{" "}
                    {appointment.resourceName}
                  </p>
                </div>

                <span className="rounded-lg bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300">
                  {formatTurkeyTime(appointment.startTime)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* YAKLAŞAN RANDEVULAR */}
      <section className="rounded-2xl border border-[#20324c] bg-[#101d30] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">
          Yaklaşan Randevular
        </h2>

        {!loading && upcomingAppointments.length === 0 ? (
          <p className="text-sm text-slate-400">
            Yaklaşan randevu bulunmuyor.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#29415d] bg-[#0b1728] p-4"
              >
                <div>
                  <p className="font-semibold text-white">
                    {appointment.customerName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {appointment.serviceName} ·{" "}
                    {appointment.resourceName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatTurkeyDate(appointment.startTime)}
                  </p>
                </div>

                <span className="text-sm font-semibold text-cyan-300">
                  {formatTurkeyTime(appointment.startTime)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500">
        İptal edilen randevu sayısı: {cancelledAppointments.length}
      </p>
    </div>
  );
}
