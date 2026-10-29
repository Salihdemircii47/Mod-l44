
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  CircleOff,
} from "lucide-react";

import type { SectorId } from "../data/sectors";

import {
  getBackendResources,
  createBackendResource,
  updateBackendResource,
  deleteBackendResource,
  type BackendResource,
} from "../api/backendResourcesApi";

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

export default function BackendResourcesPanel({
  sectorId,
}: Props) {
  const [resources, setResources] = useState<BackendResource[]>([]);
  const [editing, setEditing] = useState<BackendResource | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getBackendResources();
      setResources(result);
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
    setType("");
    setIsActive(true);
    setError("");
    setMessage("");
  }, [sectorId]);

  const filteredResources = resources.filter(
    (resource) =>
      normalizeSector(resource.sector) === sectorId
  );

  const activeResources = filteredResources.filter(
    (resource) => resource.isActive
  );

  function resetForm() {
    setEditing(null);
    setName("");
    setType("");
    setIsActive(true);
  }

  function startEdit(resource: BackendResource) {
    setEditing(resource);
    setName(resource.name);
    setType(resource.type);
    setIsActive(resource.isActive);
    setError("");
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    if (!name.trim() || !type.trim()) {
      setError("Kaynak adı ve türü zorunludur.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const wasEditing = Boolean(editing);

      if (editing) {
        await updateBackendResource(editing.id, {
          name: name.trim(),
          type: type.trim(),
          sector: editing.sector,
          isActive,
        });
      } else {
        await createBackendResource({
          name: name.trim(),
          type: type.trim(),
          sector: toBackendSector(sectorId),
        });
      }

      await refresh();
      resetForm();

      window.dispatchEvent(
        new Event("mod44:resources-updated")
      );

      setMessage(
        wasEditing
          ? "Kaynak başarıyla güncellendi."
          : "Yeni kaynak PostgreSQL'e kaydedildi."
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  }

  async function removeResource(resource: BackendResource) {
    if (saving) return;

    const confirmed = window.confirm(
      `${resource.name} kaynağını silmek istiyor musun?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await deleteBackendResource(resource.id);

      if (editing?.id === resource.id) {
        resetForm();
      }

      await refresh();

      window.dispatchEvent(
        new Event("mod44:resources-updated")
      );

      setMessage("Kaynak silindi.");
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

  return (
    <section className="space-y-6 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            Gerçek Kaynak Yönetimi
          </h2>

          <p className="mt-1 text-sm text-[#8ca5c6]">
            PostgreSQL / Personel / Araç / Ekipman
          </p>
        </div>

        <button
          type="button"
          disabled={loading || saving}
          onClick={() => void refresh()}
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
        <div className="grid gap-3 lg:grid-cols-3">
          <label className="space-y-2">
            <span className="text-xs text-slate-400">
              Kaynak adı
            </span>

            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Ayşe / Araç 01"
              className={inputClass}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs text-slate-400">
              Kaynak türü
            </span>

            <input
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Personel, Araç veya Ekipman"
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
                  : "Yeni Kaynak Ekle"}
            </button>
          </div>
        </div>

        {editing && (
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-white">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(e.target.checked)
                }
                className="h-4 w-4 accent-cyan-500"
              />
              Kaynak aktif
            </label>

            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 text-sm text-amber-300"
            >
              <X size={16} />
              Düzenlemeyi İptal Et
            </button>
          </div>
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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#29415d] bg-[#0b1728] p-4">
          <p className="text-xs text-slate-400">
            Bu Sektördeki Kaynaklar
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {filteredResources.length}
          </p>
        </div>

        <div className="rounded-xl border border-[#29415d] bg-[#0b1728] p-4">
          <p className="text-xs text-slate-400">
            Aktif Kaynaklar
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {activeResources.length}
          </p>
        </div>

        <div className="rounded-xl border border-[#29415d] bg-[#0b1728] p-4">
          <p className="text-xs text-slate-400">
            Tüm Sektörler
          </p>

          <p className="mt-2 text-2xl font-bold text-cyan-400">
            {resources.length}
          </p>
        </div>
      </div>

      {loading && resources.length === 0 ? (
        <p className="text-sm text-slate-400">
          Kaynaklar yükleniyor...
        </p>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#304963] p-8 text-center">
          <Users
            size={32}
            className="mx-auto mb-3 text-slate-500"
          />

          <p className="font-semibold">
            Bu sektörde kaynak bulunamadı.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Yeni personel, araç veya ekipman ekleyebilirsin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="rounded-2xl border border-[#29415d] bg-[#0b1728] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                    <Users size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      {resource.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Kaynak kimliği: {resource.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Tür: {resource.type}
                    </p>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                    resource.isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {resource.isActive ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <CircleOff size={13} />
                  )}

                  {resource.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-[#29415d] pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => startEdit(resource)}
                  className="flex items-center gap-2 rounded-lg border border-[#355679] px-3 py-2 text-sm text-blue-300 disabled:opacity-50"
                >
                  <Pencil size={15} />
                  Düzenle
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void removeResource(resource)
                  }
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
