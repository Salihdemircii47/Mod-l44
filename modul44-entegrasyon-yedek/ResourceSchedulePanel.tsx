import { useEffect, useState } from "react";
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
  "Pazar", "Pazartesi", "Salı", "Çarşamba",
  "Perşembe", "Cuma", "Cumartesi",
];

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "İşlem başarısız.";
}

export default function ResourceSchedulePanel({ sectorId }: Props) {
  const [resources, setResources] = useState<BackendResource[]>([]);
  const [resourceId, setResourceId] = useState<number | null>(null);
  const [hours, setHours] = useState<ResourceWorkingHour[]>([]);
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

  useEffect(() => {
    let alive = true;

    getBackendResources()
      .then((data) => {
        if (alive) setResources(data);
      })
      .catch((err: unknown) => {
        if (alive) setError(errorText(err));
      });

    return () => { alive = false; };
  }, []);

  const sectorResources = resources.filter(
    (r) => normalizeSector(r.sector) === sectorId
  );

  const selected = sectorResources.find(
    (r) => r.id === resourceId
  );

  useEffect(() => {
    if (!sectorResources.some((r) => r.id === resourceId)) {
      if (resourceId !== null) setResourceId(null);
    }
  }, [resourceId, sectorId, resources]);

  async function refresh(id: number) {
    const [newHours, newUnavailable] = await Promise.all([
      getWorkingHours(id),
      getUnavailabilities(id),
    ]);

    setHours(newHours);
    setUnavailable(newUnavailable);
  }

  useEffect(() => {
    if (resourceId === null) {
      setHours([]);
      setUnavailable([]);
      return;
    }

    let alive = true;
    setLoading(true);
    setError("");
    setHours([]);
    setUnavailable([]);

    Promise.all([
      getWorkingHours(resourceId),
      getUnavailabilities(resourceId),
    ])
      .then(([h, u]) => {
        if (!alive) return;
        setHours(h);
        setUnavailable(u);
      })
      .catch((err: unknown) => {
        if (alive) setError(errorText(err));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [resourceId]);

  async function saveHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resourceId === null || busy || start >= end) {
      setError("Kaynak ve saat aralığını kontrol et.");
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
      setMessage("Çalışma saati PostgreSQL'e kaydedildi.");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveAbsence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      resourceId === null ||
      busy ||
      !absenceStart ||
      !absenceEnd ||
      new Date(absenceStart).getTime() >=
        new Date(absenceEnd).getTime()
    ) {
      setError("Geçerli bir izin tarih aralığı seç.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await createUnavailability({
        resourceId,
        reason,
        startTime: new Date(absenceStart).toISOString(),
        endTime: new Date(absenceEnd).toISOString(),
        description: description.trim() || null,
      });

      await refresh(resourceId);
      setMessage("İzin / bakım kaydı PostgreSQL'e kaydedildi.");
      setAbsenceStart("");
      setAbsenceEnd("");
      setDescription("");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeHour(id: number) {
    if (resourceId === null || busy) return;
    if (!window.confirm("Çalışma saatini silmek istiyor musun?")) return;

    setBusy(true);
    setError("");

    try {
      await deleteWorkingHour(id);
      await refresh(resourceId);
      setMessage("Çalışma saati silindi.");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeAbsence(id: number) {
    if (resourceId === null || busy) return;
    if (!window.confirm("İzin / bakım kaydını silmek istiyor musun?")) return;

    setBusy(true);
    setError("");

    try {
      await deleteUnavailability(id);
      await refresh(resourceId);
      setMessage("İzin / bakım kaydı silindi.");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">
      <div>
        <h2 className="text-xl font-bold">Kaynak Çalışma Planı</h2>
        <p className="mt-1 text-sm text-slate-400">
          PostgreSQL üzerinden çalışma saatleri ve izin yönetimi
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-slate-300">Kaynak seç</span>
        <select
          value={resourceId ?? ""}
          onChange={(e) =>
            setResourceId(e.target.value ? Number(e.target.value) : null)
          }
          className="w-full rounded-xl border border-slate-600 bg-[#091322] p-3"
        >
          <option value="">Kaynak seçiniz</option>
          {sectorResources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.type}) — {r.isActive ? "Aktif" : "Pasif"}
            </option>
          ))}
        </select>
      </label>

      {selected && !selected.isActive && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          Bu kaynak pasif. Randevularda kullanılmadan önce kaynak
          yönetiminden aktif hale getirilmesi gerekiyor.
        </p>
      )}

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {message && (
        <p role="status" className="text-sm text-emerald-400">
          {message}
        </p>
      )}

      {resourceId !== null && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-[#263b58] p-4">
            <h3 className="font-semibold">Haftalık Çalışma Saatleri</h3>

            <form onSubmit={saveHours} className="space-y-3">
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full rounded-xl bg-[#091322] p-3"
              >
                {days.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-slate-400">
                  <span>Başlangıç</span>
                  <input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="w-full rounded-xl bg-[#091322] p-3 text-white"
                    required
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-400">
                  <span>Bitiş</span>
                  <input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="w-full rounded-xl bg-[#091322] p-3 text-white"
                    required
                  />
                </label>
              </div>

              <button
                disabled={busy || loading}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                Çalışma Saatini Kaydet
              </button>
            </form>

            {loading ? <p>Yükleniyor...</p> : hours.length === 0 ? (
              <p className="text-sm text-slate-400">
                Henüz çalışma saati tanımlanmadı.
              </p>
            ) : (
              hours.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#091322] p-3 text-sm">
                  <span>
                    {days[h.dayOfWeek] ?? h.dayOfWeek}{" "}
                    {h.startTime.slice(0, 5)}–{h.endTime.slice(0, 5)}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeHour(h.id)}
                    className="text-red-400 disabled:opacity-50"
                  >
                    Sil
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-[#263b58] p-4">
            <h3 className="font-semibold">İzin / Bakım Kayıtları</h3>

            <form onSubmit={saveAbsence} className="space-y-3">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl bg-[#091322] p-3"
              >
                <option value="İzin">İzin</option>
                <option value="Bakım">Bakım</option>
                <option value="Hastalık">Hastalık</option>
                <option value="Diğer">Diğer</option>
              </select>

              <label className="block space-y-1 text-xs text-slate-400">
                <span>Başlangıç</span>
                <input
                  type="datetime-local"
                  value={absenceStart}
                  onChange={(e) => setAbsenceStart(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[#091322] p-3 text-white"
                />
              </label>

              <label className="block space-y-1 text-xs text-slate-400">
                <span>Bitiş</span>
                <input
                  type="datetime-local"
                  value={absenceEnd}
                  onChange={(e) => setAbsenceEnd(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[#091322] p-3 text-white"
                />
              </label>

              <textarea
                placeholder="Açıklama (isteğe bağlı)"
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-[#091322] p-3"
              />

              <button
                disabled={busy || loading}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                İzin / Bakım Kaydet
              </button>
            </form>

            {loading ? <p>Yükleniyor...</p> : unavailable.length === 0 ? (
              <p className="text-sm text-slate-400">
                Henüz izin veya bakım kaydı yok.
              </p>
            ) : (
              unavailable.map((u) => (
                <div key={u.id} className="rounded-xl bg-[#091322] p-3 text-sm">
                  <p className="font-semibold">{u.reason}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(u.startTime).toLocaleString("tr-TR")} –{" "}
                    {new Date(u.endTime).toLocaleString("tr-TR")}
                  </p>
                  {u.description && (
                    <p className="mt-1 text-xs text-slate-300">
                      {u.description}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeAbsence(u.id)}
                    className="mt-2 text-red-400 disabled:opacity-50"
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