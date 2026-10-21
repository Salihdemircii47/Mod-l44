
import { useState } from "react";
import type { FormEvent } from "react";
import {
  BriefcaseBusiness,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Clock3,
  Wallet,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import type { SectorId } from "../data/sectors";

export type ServiceItem = {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

type ServiceCatalog = Record<SectorId, ServiceItem[]>;

const STORAGE_KEY = "mod44-services-v1";
const BRANCH_KEY = "mod44-branches-v1";

const defaultServices: ServiceCatalog = {
  beauty: [
    { id: "beauty-1", name: "Saç Kesimi", duration: 30, price: 500, active: true },
    { id: "beauty-2", name: "Saç Boyama", duration: 120, price: 1800, active: true },
    { id: "beauty-3", name: "Fön", duration: 45, price: 350, active: true },
    { id: "beauty-4", name: "Manikür", duration: 60, price: 600, active: true },
  ],
  fleet: [
    { id: "fleet-1", name: "Vidanjör Hizmeti", duration: 120, price: 3500, active: true },
    { id: "fleet-2", name: "Kombine Kanal Açma", duration: 180, price: 5500, active: true },
    { id: "fleet-3", name: "Kuka Hizmeti", duration: 90, price: 2800, active: true },
  ],
  construction: [
    { id: "construction-1", name: "Saha Keşfi", duration: 60, price: 1500, active: true },
    { id: "construction-2", name: "Kazı Planlaması", duration: 120, price: 4500, active: true },
    { id: "construction-3", name: "Boru Hattı Kontrolü", duration: 90, price: 3000, active: true },
  ],
};

const defaultBranches: Record<SectorId, string> = {
  beauty: "Merkez Güzellik Şubesi",
  fleet: "Merkez Operasyon Sahası",
  construction: "Ana Şantiye Ofisi",
};

export function loadServices(): ServiceCatalog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultServices);

    const data: unknown = JSON.parse(raw);

    if (!data || typeof data !== "object") {
      return structuredClone(defaultServices);
    }

    const parsed = data as Partial<ServiceCatalog>;

    return {
      beauty: Array.isArray(parsed.beauty)
        ? parsed.beauty : structuredClone(defaultServices.beauty),
      fleet: Array.isArray(parsed.fleet)
        ? parsed.fleet : structuredClone(defaultServices.fleet),
      construction: Array.isArray(parsed.construction)
        ? parsed.construction : structuredClone(defaultServices.construction),
    };
  } catch {
    return structuredClone(defaultServices);
  }
}

function loadBranches(): Record<SectorId, string> {
  try {
    const raw = localStorage.getItem(BRANCH_KEY);
    if (!raw) return { ...defaultBranches };

    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return { ...defaultBranches };

    const saved = data as Partial<Record<SectorId, string>>;
    return {
      beauty: typeof saved.beauty === "string" ? saved.beauty : defaultBranches.beauty,
      fleet: typeof saved.fleet === "string" ? saved.fleet : defaultBranches.fleet,
      construction: typeof saved.construction === "string"
        ? saved.construction : defaultBranches.construction,
    };
  } catch {
    return { ...defaultBranches };
  }
}

const inputClass =
  "w-full rounded-xl border border-[#304963] bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400";

const money = (price: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);

type Props = {
  sectorId: SectorId;
};

export default function ServicesPage({ sectorId }: Props) {
  const [catalog, setCatalog] = useState<ServiceCatalog>(loadServices);
  const [branches, setBranches] = useState(loadBranches);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const services = catalog[sectorId];
  const activeCount = services.filter((item) => item.active).length;

  function saveCatalog(next: ServiceCatalog) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setCatalog(next);
      return true;
    } catch {
      setError("Hizmetler kaydedilemedi. Tarayıcı depolamasını kontrol edin.");
      return false;
    }
  }

  function updateService(id: string, changes: Partial<ServiceItem>) {
    const next = {
      ...catalog,
      [sectorId]: services.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      ),
    };

    if (saveCatalog(next)) {
      setMessage("Hizmet durumu güncellendi.");
    }
  }

  function openNewModal() {
    setEditingId(null);
    setName("");
    setDuration(30);
    setPrice(0);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(service: ServiceItem) {
    setEditingId(service.id);
    setName(service.name);
    setDuration(service.duration);
    setPrice(service.price);
    setError("");
    setModalOpen(true);
  }

  function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Hizmet adı boş bırakılamaz.");
      return;
    }

    if (
      !Number.isFinite(duration) ||
      !Number.isInteger(duration) ||
      duration < 15 ||
      duration > 1440
    ) {
      setError("Hizmet süresi 15–1440 dakika arasında olmalıdır.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Geçerli bir fiyat giriniz.");
      return;
    }

    const duplicate = services.some(
      (item) =>
        item.id !== editingId &&
        item.name.toLocaleLowerCase("tr-TR") ===
          trimmedName.toLocaleLowerCase("tr-TR")
    );

    if (duplicate) {
      setError("Bu isimle bir hizmet zaten mevcut.");
      return;
    }

    const nextServices = editingId
      ? services.map((item) =>
          item.id === editingId
            ? { ...item, name: trimmedName, duration, price }
            : item
        )
      : [
          ...services,
          {
            id: crypto.randomUUID(),
            name: trimmedName,
            duration,
            price,
            active: true,
          },
        ];

    if (saveCatalog({ ...catalog, [sectorId]: nextServices })) {
      setMessage(editingId ? "Hizmet güncellendi." : "Yeni hizmet eklendi.");
      setModalOpen(false);
    }
  }

  function deleteService(service: ServiceItem) {
    if (
      !window.confirm(
        `"${service.name}" hizmetini katalogdan silmek istiyor musunuz?`
      )
    ) return;

    if (
      saveCatalog({
        ...catalog,
        [sectorId]: services.filter((item) => item.id !== service.id),
      })
    ) {
      setMessage("Hizmet katalogdan silindi.");
    }
  }

  function saveBranch() {
    if (!branches[sectorId].trim()) {
      setMessage("Şube adı boş bırakılamaz.");
      return;
    }

    try {
      localStorage.setItem(BRANCH_KEY, JSON.stringify(branches));
      setMessage("Şube bilgisi kaydedildi.");
    } catch {
      setMessage("Şube bilgisi kaydedilemedi.");
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-cyan-400">
            MOD44 / HİZMET YÖNETİMİ
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Şube ve Hizmetler
          </h1>
          <p className="mt-2 text-sm text-[#8299b7]">
            İşletmenizin hizmet kataloğunu, sürelerini ve fiyatlarını yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          Yeni Hizmet Ekle
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Toplam Hizmet", value: services.length },
          { label: "Aktif Hizmet", value: activeCount },
          { label: "Pasif Hizmet", value: services.length - activeCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#263b58] bg-[#101d30] p-5"
          >
            <p className="text-xs text-[#91a9c9]">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-cyan-400">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Şube bilgileri */}
      <section className="rounded-2xl border border-[#263b58] bg-[#101d30] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/15 p-3 text-cyan-400">
            <Building2 size={22} />
          </div>
          <div>
            <h2 className="font-bold text-white">Şube Bilgileri</h2>
            <p className="mt-1 text-xs text-[#8299b7]">
              Demo için sektör başına tek şube
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[220px] flex-1 space-y-2">
            <span className="text-xs text-[#9db5d4]">Şube Adı</span>
            <input
              className={inputClass}
              value={branches[sectorId]}
              onChange={(event) =>
                setBranches((old) => ({
                  ...old,
                  [sectorId]: event.target.value,
                }))
              }
            />
          </label>

          <button
            type="button"
            onClick={saveBranch}
            className="flex items-center gap-2 rounded-xl border border-[#355679] bg-[#183556] px-5 py-3 text-sm text-white hover:bg-[#244a73]"
          >
            <Save size={16} />
            Şubeyi Kaydet
          </button>
        </div>
      </section>

      {/* Hizmet listesi */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Hizmet Kataloğu</h2>
          <p className="mt-1 text-xs text-[#8299b7]">
            Fiyat, süre ve hizmet durumlarını buradan yönetin.
          </p>
        </div>

        {services.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#34516c] bg-[#101d30] p-10 text-center text-sm text-[#91a9c9]">
            Henüz hizmet eklenmedi.
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-[#263b58] bg-[#101d30] p-5 transition hover:border-[#38628b]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-white">{service.name}</h3>
                    <p className="mt-1 text-xs text-[#8299b7]">
                      Hizmet tanımı
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[11px] ${
                    service.active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {service.active ? "Aktif" : "Pasif"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#0b1728] p-4">
                  <div className="flex items-center gap-2 text-xs text-[#8ba4c2]">
                    <Clock3 size={15} />
                    Hizmet Süresi
                  </div>
                  <p className="mt-2 text-lg font-bold text-white">
                    {service.duration} dk
                  </p>
                </div>

                <div className="rounded-xl bg-[#0b1728] p-4">
                  <div className="flex items-center gap-2 text-xs text-[#8ba4c2]">
                    <Wallet size={15} />
                    Hizmet Fiyatı
                  </div>
                  <p className="mt-2 text-lg font-bold text-cyan-400">
                    {money(service.price)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#263b58] pt-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#a6bdd9]">
                  <input
                    type="checkbox"
                    checked={service.active}
                    onChange={(event) =>
                      updateService(service.id, {
                        active: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Hizmet aktif
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(service)}
                    className="flex items-center gap-2 rounded-lg border border-[#355679] px-3 py-2 text-xs text-[#c4d8f0] hover:bg-[#1d3653]"
                  >
                    <Pencil size={14} />
                    Düzenle
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteService(service)}
                    aria-label={`${service.name} hizmetini sil`}
                    className="rounded-lg border border-rose-500/20 p-2 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-300"
        >
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* Ekleme / Düzenleme penceresi */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            className="w-full max-w-lg rounded-3xl border border-[#345174] bg-[#14243a] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="service-modal-title"
                className="text-xl font-bold text-white"
              >
                {editingId ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
              </h2>

              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setModalOpen(false)}
                className="text-[#a7bdd7] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveService} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs text-[#a7bdd7]">Hizmet Adı</span>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Örn: Saç Bakımı"
                  maxLength={100}
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-xs text-[#a7bdd7]">
                    Süre (Dakika)
                  </span>
                  <input
                    type="number"
                    min="15"
                    max="1440"
                    step="1"
                    className={inputClass}
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.valueAsNumber)
                    }
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs text-[#a7bdd7]">
                    Fiyat (₺)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={price}
                    onChange={(event) =>
                      setPrice(event.target.valueAsNumber)
                    }
                    required
                  />
                </label>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300"
                >
                  <AlertTriangle size={17} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-bold text-white"
              >
                <Save size={17} />
                {editingId ? "Değişiklikleri Kaydet" : "Hizmet Oluştur"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
