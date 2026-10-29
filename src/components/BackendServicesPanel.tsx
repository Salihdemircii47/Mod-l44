
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  BriefcaseBusiness,
  Clock3,
  Pencil,
  Trash2,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

import type { SectorId } from "../data/sectors";

import {
  getBackendServices,
  createBackendService,
  updateBackendService,
  deleteBackendService,
  type BackendService,
} from "../api/backendServicesApi";

import {
  normalizeSector,
  toBackendSector,
} from "../utils/sectorMapping";

type Props = {
  sectorId: SectorId;
};

function getError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Beklenmeyen bir hata oluştu.";
}

export default function BackendServicesPanel({
  sectorId,
}: Props) {
  const [services, setServices] = useState<BackendService[]>([]);
  const [editing, setEditing] = useState<BackendService | null>(null);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getBackendServices();
      setServices(data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setEditing(null);
    setName("");
    setDuration(30);
    setPrice(0);
    setMessage("");
    setError("");
  }, [sectorId]);

  const filteredServices = services.filter(
    (service) =>
      normalizeSector(service.sector) === sectorId
  );

  function resetForm() {
    setEditing(null);
    setName("");
    setDuration(30);
    setPrice(0);
  }

  function startEdit(service: BackendService) {
    setEditing(service);
    setName(service.name);
    setDuration(service.durationMinutes);
    setPrice(service.price);
    setError("");
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    if (!name.trim()) {
      setError("Hizmet adı boş olamaz.");
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 100000
    ) {
      setError("Geçerli bir hizmet süresi gir.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Geçerli bir hizmet ücreti gir.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editing) {
        await updateBackendService(editing.id, {
          name: name.trim(),
          sector: editing.sector,
          description: editing.description,
          durationMinutes: duration,
          price,
        });
      } else {
        await createBackendService({
          name: name.trim(),
          sector: toBackendSector(sectorId),
          description: null,
          durationMinutes: duration,
          price,
        });
      }

      const wasEditing = Boolean(editing);

      await refresh();
      resetForm();

      window.dispatchEvent(
        new Event("mod44:services-updated")
      );

      setMessage(
        wasEditing
          ? "Hizmet başarıyla güncellendi."
          : "Yeni hizmet PostgreSQL'e kaydedildi."
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  }

  async function removeService(service: BackendService) {
    if (saving) return;

    const confirmed = window.confirm(
      `${service.name} hizmetini silmek istiyor musun?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await deleteBackendService(service.id);

      if (editing?.id === service.id) {
        resetForm();
      }

      await refresh();

      window.dispatchEvent(
        new Event("mod44:services-updated")
      );

      setMessage("Hizmet silindi.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#304963] " +
    "bg-[#0b1728] px-4 py-3 text-sm text-white " +
    "outline-none transition focus:border-cyan-400";

  const priceFormat = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  });

  return (
    <section className="space-y-6 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            Gerçek Hizmet Yönetimi
          </h2>

          <p className="mt-1 text-sm text-[#8ca5c6]">
            ASP.NET Core API / PostgreSQL
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || saving}
          className="flex items-center gap-2 rounded-xl border border-[#304963] px-4 py-2 text-sm text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          {loading ? "Yükleniyor..." : "Listeyi Yenile"}
        </button>
      </div>

      <form
        onSubmit={(event) => void save(event)}
        className="space-y-4"
      >
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="space-y-2">
            <span className="text-xs text-slate-400">
              Hizmet adı
            </span>

            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Saç Kesimi"
              className={inputClass}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs text-slate-400">
              Süre (dakika)
            </span>

            <input
              required
              type="number"
              min={1}
              max={100000}
              value={duration}
              onChange={(e) =>
                setDuration(Number(e.target.value))
              }
              className={inputClass}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs text-slate-400">
              Ücret (TL)
            </span>

            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) =>
                setPrice(Number(e.target.value))
              }
              className={inputClass}
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {editing ? (
                <Pencil size={16} />
              ) : (
                <Plus size={16} />
              )}

              {saving
                ? "Kaydediliyor..."
                : editing
                  ? "Değişiklikleri Kaydet"
                  : "Hizmet Ekle"}
            </button>
          </div>
        </div>

        {editing && (
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 text-sm text-amber-300"
          >
            <X size={16} />
            Düzenlemeyi İptal Et
          </button>
        )}
      </form>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300"
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#29415d] pb-4">
        <div>
          <p className="text-sm font-semibold text-emerald-400">
            Bu sektördeki hizmet sayısı: {filteredServices.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Tüm sektörlerde toplam: {services.length}
          </p>
        </div>
      </div>

      {loading && services.length === 0 ? (
        <p className="text-sm text-slate-400">
          Hizmetler yükleniyor...
        </p>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#304963] p-8 text-center">
          <BriefcaseBusiness
            size={32}
            className="mx-auto mb-3 text-slate-500"
          />

          <p className="font-semibold">
            Bu sektörde hizmet bulunamadı.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Yukarıdaki formdan yeni hizmet oluşturabilirsin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="rounded-2xl border border-[#29415d] bg-[#0b1728] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      {service.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Hizmet kimliği: {service.id}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                  Veritabanı
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#101d30] p-4">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock3 size={14} />
                    Hizmet Süresi
                  </p>

                  <p className="mt-2 text-lg font-bold">
                    {service.durationMinutes} dk
                  </p>
                </div>

                <div className="rounded-xl bg-[#101d30] p-4">
                  <p className="text-xs text-slate-400">
                    Hizmet Ücreti
                  </p>

                  <p className="mt-2 text-lg font-bold text-cyan-400">
                    {priceFormat.format(service.price)}
                  </p>
                </div>
              </div>

              {service.description && (
                <p className="mt-4 text-sm text-slate-400">
                  {service.description}
                </p>
              )}

              <div className="mt-5 flex justify-end gap-2 border-t border-[#29415d] pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => startEdit(service)}
                  className="flex items-center gap-2 rounded-lg border border-[#355679] px-3 py-2 text-sm text-blue-300 disabled:opacity-50"
                >
                  <Pencil size={15} />
                  Düzenle
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void removeService(service)}
                  className="flex items-center gap-2 rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-rose-400 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Sil
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
