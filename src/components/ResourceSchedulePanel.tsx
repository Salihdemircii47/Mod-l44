
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { SectorId } from "../data/sectors";

import {
  getBackendResources,
  type BackendResource,
} from "../api/backendResourcesApi";

import {
  getWorkingHours,
  createWorkingHour,
  deleteWorkingHour,
  type ResourceWorkingHour,
} from "../api/resourceWorkingHoursApi";

import {
  getUnavailabilities,
  createUnavailability,
  deleteUnavailability,
  type ResourceUnavailability,
} from "../api/resourceUnavailabilitiesApi";

import { normalizeSector } from "../utils/sectorMapping";

type Props = {
  sectorId: SectorId;
};

const days = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

const input =
  "w-full rounded-xl border border-[#304963] " +
  "bg-[#091322] p-3 text-sm text-white [color-scheme:dark]";

const errText = (err: unknown) =>
  err instanceof Error
    ? err.message
    : "İşlem başarısız.";

function toUtcFromTurkey(value: string) {
  return new Date(`${value}:00+03:00`).toISOString();
}

export default function ResourceSchedulePanel({
  sectorId,
}: Props) {
  const [resources, setResources] =
    useState<BackendResource[]>([]);

  const [resourceId, setResourceId] =
    useState<number | null>(null);

  const [hours, setHours] =
    useState<ResourceWorkingHour[]>([]);

  const [unavailable, setUnavailable] =
    useState<ResourceUnavailability[]>([]);

  const [day, setDay] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");

  const [reason, setReason] = useState("İzin");
  const [absenceStart, setAbsenceStart] = useState("");
  const [absenceEnd, setAbsenceEnd] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadResources = useCallback(async () => {
    try {
      setResources(await getBackendResources());
    } catch (err) {
      setError(errText(err));
    }
  }, []);

  useEffect(() => {
    void loadResources();

    const handle = () => void loadResources();

    window.addEventListener(
      "mod44:resources-updated",
      handle
    );

    return () => {
      window.removeEventListener(
        "mod44:resources-updated",
        handle
      );
    };
  }, [loadResources]);

  const sectorResources = resources.filter(
    (r) => normalizeSector(r.sector) === sectorId
  );

  const selected = sectorResources.find(
    (r) => r.id === resourceId
  );

  useEffect(() => {
    if (
      resourceId !== null &&
      !sectorResources.some((r) => r.id === resourceId)
    ) {
      setResourceId(null);
    }
  }, [sectorId, resourceId, resources]);

  const refresh = useCallback(async (id: number) => {
    const [working, absent] = await Promise.all([
      getWorkingHours(id),
      getUnavailabilities(id),
    ]);

    setHours(working);
    setUnavailable(absent);
  }, []);

  useEffect(() => {
    if (resourceId === null) {
      setHours([]);
      setUnavailable([]);
      return;
    }

    let alive = true;

    setLoading(true);
    setError("");

    Promise.all([
      getWorkingHours(resourceId),
      getUnavailabilities(resourceId),
    ])
      .then(([working, absent]) => {
        if (alive) {
          setHours(working);
          setUnavailable(absent);
        }
      })
      .catch((err: unknown) => {
        if (alive) setError(errText(err));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [resourceId]);

  async function saveHours(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (resourceId === null || busy || start >= end) {
      setError("Geçerli bir kaynak ve saat aralığı seç.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await createWorkingHour({
        resourceId,
        dayOfWeek: day,
        startTime: `${start}:00`,
        endTime: `${end}:00`,
      });

      await refresh(resourceId);

      setMessage("Çalışma saatleri kaydedildi.");
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveAbsence(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      resourceId === null ||
      busy ||
      !absenceStart ||
      !absenceEnd
    ) {
      setError("İzin bilgilerini tamamla.");
      return;
    }

    const a = toUtcFromTurkey(absenceStart);
    const b = toUtcFromTurkey(absenceEnd);

    if (
      new Date(a).getTime() >=
      new Date(b).getTime()
    ) {
      setError(
        "İzin bitişi başlangıçtan sonra olmalı."
      );
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await createUnavailability({
        resourceId,
        reason,
        startTime: a,
        endTime: b,
        description: description.trim() || null,
      });

      await refresh(resourceId);

      setAbsenceStart("");
      setAbsenceEnd("");
      setDescription("");

      setMessage("İzin / bakım kaydedildi.");
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeHour(id: number) {
    if (
      resourceId === null ||
      busy ||
      !window.confirm("Çalışma saati silinsin mi?")
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await deleteWorkingHour(id);
      await refresh(resourceId);
      setMessage("Çalışma saati silindi.");
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeAbsence(id: number) {
    if (
      resourceId === null ||
      busy ||
      !window.confirm("İzin kaydı silinsin mi?")
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await deleteUnavailability(id);
      await refresh(resourceId);
      setMessage("İzin silindi.");
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">
      <div>
        <h2 className="text-xl font-bold">
          Kaynak Çalışma Planı
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Gerçek çalışma saatleri ve izin / bakım kayıtları
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">
          Kaynak seç
        </span>

        <select
          className={input}
          value={resourceId ?? ""}
          onChange={(e) =>
            setResourceId(
              e.target.value
                ? Number(e.target.value)
                : null
            )
          }
        >
          <option value="">Kaynak seçiniz</option>

          {sectorResources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.type}) —{" "}
              {r.isActive ? "Aktif" : "Pasif"}
            </option>
          ))}
        </select>
      </label>

      {selected && !selected.isActive && (
        <p className="text-sm text-amber-300">
          Kaynak pasif. Randevuda kullanmak için
          önce aktifleştir.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-rose-400">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-sm text-emerald-400">
          {message}
        </p>
      )}

      {resourceId !== null && (
        <div className="grid gap-5 lg:grid-cols-2">

          {/* ÇALIŞMA SAATLERİ */}
          <div className="space-y-4 rounded-xl border border-[#263b58] p-4">
            <h3 className="font-semibold">
              Haftalık Çalışma Saatleri
            </h3>

            <form
              className="space-y-3"
              onSubmit={(e) => void saveHours(e)}
            >
              <select
                className={input}
                value={day}
                onChange={(e) =>
                  setDay(Number(e.target.value))
                }
              >
                {days.map((label, i) => (
                  <option key={i} value={i}>
                    {label}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-slate-400">
                  <span>Başlangıç</span>

                  <input
                    className={input}
                    type="time"
                    value={start}
                    onChange={(e) =>
                      setStart(e.target.value)
                    }
                    required
                  />
                </label>

                <label className="space-y-1 text-xs text-slate-400">
                  <span>Bitiş</span>

                  <input
                    className={input}
                    type="time"
                    value={end}
                    onChange={(e) =>
                      setEnd(e.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={busy || loading}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                Çalışma Saati Kaydet
              </button>
            </form>

            {loading ? (
              <p>Yükleniyor...</p>
            ) : hours.length === 0 ? (
              <p className="text-sm text-slate-400">
                Çalışma saati tanımlanmadı.
              </p>
            ) : (
              hours.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#091322] p-3 text-sm"
                >
                  <span>
                    {days[h.dayOfWeek]}{" "}
                    {h.startTime.slice(0, 5)}–
                    {h.endTime.slice(0, 5)}
                  </span>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void removeHour(h.id)
                    }
                    className="text-rose-400 disabled:opacity-50"
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>

          {/* İZİN VE BAKIM */}
          <div className="space-y-4 rounded-xl border border-[#263b58] p-4">
            <h3 className="font-semibold">
              İzin / Bakım
            </h3>

            <form
              className="space-y-3"
              onSubmit={(e) => void saveAbsence(e)}
            >
              <select
                className={input}
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
              >
                <option>İzin</option>
                <option>Bakım</option>
                <option>Hastalık</option>
                <option>Diğer</option>
              </select>

              <label className="block space-y-1 text-xs text-slate-400">
                <span>Başlangıç (Türkiye saati)</span>

                <input
                  className={input}
                  type="datetime-local"
                  value={absenceStart}
                  onChange={(e) =>
                    setAbsenceStart(e.target.value)
                  }
                  required
                />
              </label>

              <label className="block space-y-1 text-xs text-slate-400">
                <span>Bitiş (Türkiye saati)</span>

                <input
                  className={input}
                  type="datetime-local"
                  value={absenceEnd}
                  onChange={(e) =>
                    setAbsenceEnd(e.target.value)
                  }
                  required
                />
              </label>

              <textarea
                className={input}
                placeholder="Açıklama"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                maxLength={500}
              />

              <button
                type="submit"
                disabled={busy || loading}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                İzin / Bakım Kaydet
              </button>
            </form>

            {loading ? (
              <p>Yükleniyor...</p>
            ) : unavailable.length === 0 ? (
              <p className="text-sm text-slate-400">
                İzin / bakım bulunamadı.
              </p>
            ) : (
              unavailable.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl bg-[#091322] p-3 text-sm"
                >
                  <p className="font-semibold">
                    {a.reason}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(
                      a.startTime
                    ).toLocaleString("tr-TR", {
                      timeZone: "Europe/Istanbul",
                    })}
                    {" – "}
                    {new Date(
                      a.endTime
                    ).toLocaleString("tr-TR", {
                      timeZone: "Europe/Istanbul",
                    })}
                  </p>

                  {a.description && (
                    <p className="mt-1 text-xs text-slate-300">
                      {a.description}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void removeAbsence(a.id)
                    }
                    className="mt-2 text-rose-400 disabled:opacity-50"
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
