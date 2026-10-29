import { useEffect, useState } from "react";
import type { SectorId } from "../data/sectors";

import {
  getBackendAppointments,
  cancelBackendAppointment,
  rescheduleBackendAppointment,
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

function isCancelled(status: string): boolean {
  const value = status.toLocaleLowerCase("tr-TR");
  return value.includes("iptal") || value.includes("cancel");
}

function toTurkeyInput(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default function BackendAppointmentManagement({
  sectorId,
}: Props) {
  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [resources, setResources] =
    useState<BackendResource[]>([]);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [newStart, setNewStart] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const [a, r] = await Promise.all([
      getBackendAppointments(),
      getBackendResources(),
    ]);

    setAppointments(a);
    setResources(r);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const [a, r] = await Promise.all([
          getBackendAppointments(),
          getBackendResources(),
        ]);

        if (!alive) return;

        setAppointments(a);
        setResources(r);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof Error ? err.message : "Yükleme hatası."
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    function handleUpdate() {
      void refresh().catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Yenileme hatası."
        );
      });
    }

    window.addEventListener(
      "mod44:appointments-updated",
      handleUpdate
    );

    return () => {
      alive = false;
      window.removeEventListener(
        "mod44:appointments-updated",
        handleUpdate
      );
    };
  }, []);

  async function cancel(item: BackendAppointment) {
    if (busy || isCancelled(item.status)) return;

    const confirmed = window.confirm(
      `${item.customerName} için #${item.id} randevusu iptal edilsin mi?`
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await cancelBackendAppointment(item.id);
      await refresh();

      window.dispatchEvent(
        new Event("mod44:appointments-updated")
      );

      setMessage("Randevu başarıyla iptal edildi.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "İptal edilemedi."
      );
    } finally {
      setBusy(false);
    }
  }

  async function reschedule(item: BackendAppointment) {
    if (busy || !newStart) return;

    const oldStart = new Date(item.startTime);
    const oldEnd = new Date(item.endTime);

    const duration = oldEnd.getTime() - oldStart.getTime();

    if (!Number.isFinite(duration) || duration <= 0) {
      setError("Randevu süresi geçersiz.");
      return;
    }

    // Türkiye saati +03:00
    const start = new Date(`${newStart}:00+03:00`);
    const end = new Date(start.getTime() + duration);

    if (Number.isNaN(start.getTime()) || start <= new Date()) {
      setError("Gelecekte geçerli bir tarih seç.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await rescheduleBackendAppointment(
        item.id,
        start.toISOString(),
        end.toISOString()
      );

      await refresh();

      window.dispatchEvent(
        new Event("mod44:appointments-updated")
      );

      setEditingId(null);
      setNewStart("");
      setMessage("Randevu başarıyla ertelendi.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erteleme başarısız."
      );
    } finally {
      setBusy(false);
    }
  }

  const sectorResourceIds = new Set(
    resources
      .filter((r) => normalizeSector(r.sector) === sectorId)
      .map((r) => r.id)
  );

  const visible = appointments.filter(
    (a) => sectorResourceIds.has(a.resourceId)
  );

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">
      <div>
        <h2 className="text-xl font-bold text-white">
          Gerçek Randevu Yönetimi
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          PostgreSQL üzerinden iptal ve erteleme
        </p>
      </div>

      {loading && <p className="text-slate-400">Yükleniyor...</p>}

      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-emerald-400">
          {message}
        </p>
      )}

      {!loading && visible.length === 0 && (
        <p className="text-slate-400">
          Bu sektörde randevu bulunmuyor.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((item) => {
          const cancelled = isCancelled(item.status);
          const editing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#294361] bg-[#0b1728] p-4"
            >
              <div className="flex justify-between gap-3">
                <h3 className="font-semibold text-white">
                  #{item.id} — {item.customerName}
                </h3>
                <span className={cancelled ? "text-red-400" : "text-emerald-400"}>
                  {item.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-300">
                {item.serviceName} / {item.resourceName}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {new Date(item.startTime).toLocaleString("tr-TR", {
                  timeZone: "Europe/Istanbul",
                })}
              </p>

              {!cancelled && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(editing ? null : item.id);
                      setNewStart(toTurkeyInput(item.startTime));
                    }}
                    className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm text-blue-300"
                  >
                    Ertele
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void cancel(item)}
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400"
                  >
                    İptal Et
                  </button>
                </div>
              )}

              {editing && !cancelled && (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm text-white">
                    Yeni tarih ve saat
                    <input
                      type="datetime-local"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-[#304963] bg-[#091322] p-3 text-white"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={busy || !newStart}
                    onClick={() => void reschedule(item)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Değişikliği Kaydet
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
