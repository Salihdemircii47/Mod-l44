
import { useState } from "react";
import {
  Users, Truck, HardHat, Clock3, Save,
  CheckCircle2, ShieldCheck
} from "lucide-react";
import type { SectorId } from "../data/sectors";
import ShiftCalendar from "../components/ShiftCalendar";

export type ResourceSetting = {
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  dayOff: number;
  active: boolean;
};

export const resourceDefaults: Record<SectorId, ResourceSetting[]> = {
  beauty: [
    { name: "Elif Demir", role: "Saç Uzmanı", startTime: "09:00", endTime: "18:00", dayOff: 0, active: true },
    { name: "Burak Yıldız", role: "Erkek Kuaförü", startTime: "09:00", endTime: "18:00", dayOff: 2, active: true },
    { name: "Zeynep Arslan", role: "Güzellik Uzmanı", startTime: "10:00", endTime: "18:00", dayOff: 0, active: true },
  ],
  fleet: [
    { name: "34 VDJ 101", role: "Vidanjör Aracı", startTime: "09:00", endTime: "18:00", dayOff: 0, active: true },
    { name: "34 KMB 202", role: "Kombine Aracı", startTime: "09:00", endTime: "18:00", dayOff: 0, active: true },
    { name: "34 KKA 303", role: "Kuka Aracı", startTime: "09:00", endTime: "18:00", dayOff: 0, active: true },
  ],
  construction: [
    { name: "Keşif Ekibi A", role: "Saha Keşif Ekibi", startTime: "09:00", endTime: "18:00", dayOff: 0, active: true },
    { name: "Ekskavatör 01", role: "İş Makinesi", startTime: "09:00", endTime: "18:00", dayOff: 0, active: true },
    { name: "Saha Ekibi B", role: "Altyapı Ekibi", startTime: "09:00", endTime: "18:00", dayOff: 0, active: true },
  ],
};

export const RESOURCE_STORAGE_KEY = "mod44-resource-settings-v1";

export function loadResourceSettings(): Record<SectorId, ResourceSetting[]> {
  try {
    const raw = localStorage.getItem(RESOURCE_STORAGE_KEY);
    if (!raw) return structuredClone(resourceDefaults);

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return structuredClone(resourceDefaults);
    }

    // Eski kayıtlarda eksik alan varsa varsayılanları koru.
    return {
      beauty: mergeResources(resourceDefaults.beauty, parsed.beauty),
      fleet: mergeResources(resourceDefaults.fleet, parsed.fleet),
      construction: mergeResources(resourceDefaults.construction, parsed.construction),
    };
  } catch {
    return structuredClone(resourceDefaults);
  }
}

function mergeResources(
  defaults: ResourceSetting[],
  stored: unknown
): ResourceSetting[] {
  if (!Array.isArray(stored)) return structuredClone(defaults);

  return defaults.map((item) => {
    const saved = stored.find(
      (entry) => entry && entry.name === item.name
    );

    if (!saved) return { ...item };

    return {
      ...item,
      role: typeof saved.role === "string" ? saved.role : item.role,
      startTime: typeof saved.startTime === "string" ? saved.startTime : item.startTime,
      endTime: typeof saved.endTime === "string" ? saved.endTime : item.endTime,
      dayOff: Number.isInteger(saved.dayOff) && saved.dayOff >= 0 && saved.dayOff <= 7
        ? saved.dayOff : item.dayOff,
      active: typeof saved.active === "boolean" ? saved.active : item.active,
    };
  });
}

const days = [
  { value: 7, label: "İzin yok" },
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 0, label: "Pazar" },
];

const fieldClass =
  "w-full rounded-xl border border-[#294361] bg-[#0b1728] p-3 text-xs text-white outline-none focus:border-cyan-400 [color-scheme:dark]";

type Props = {
  sectorId: SectorId;
};

export default function ResourcesPage({ sectorId }: Props) {
  const [settings, setSettings] = useState(loadResourceSettings);
  const [message, setMessage] = useState("");

  const resources = settings[sectorId];
  const Icon = sectorId === "beauty"
    ? Users
    : sectorId === "fleet"
    ? Truck
    : HardHat;

  function updateResource(
    name: string,
    changes: Partial<ResourceSetting>
  ) {
    setSettings((old) => ({
      ...old,
      [sectorId]: old[sectorId].map((item) =>
        item.name === name ? { ...item, ...changes } : item
      ),
    }));
    setMessage("");
  }

  function saveSettings() {
    const invalid = resources.find(
      (item) => item.startTime >= item.endTime
    );

    if (invalid) {
      setMessage(`${invalid.name}: Bitiş saati başlangıçtan sonra olmalıdır.`);
      return;
    }

    try {
      localStorage.setItem(
        RESOURCE_STORAGE_KEY,
        JSON.stringify(settings)
      );
      setMessage("Ayarlar başarıyla kaydedildi.");
    } catch {
      setMessage("Ayarlar kaydedilemedi. Tarayıcı depolamasını kontrol edin.");
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-cyan-400">
            MOD44 / KAYNAK YÖNETİMİ
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Personel ve Kaynaklar
          </h1>
          <p className="mt-2 text-sm text-[#8299b7]">
            Çalışma saatlerini, izin günlerini ve kaynak durumlarını yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSettings}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white"
        >
          <Save size={18} />
          Değişiklikleri Kaydet
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Toplam Kaynak", value: resources.length },
          { label: "Aktif Kaynak", value: resources.filter(r => r.active).length },
          { label: "Pasif Kaynak", value: resources.filter(r => !r.active).length },
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
        <ShiftCalendar resources={resources} />
      <div className="space-y-4">
        {resources.map((resource) => (
          <div
            key={resource.name}
            className="rounded-2xl border border-[#263b58] bg-[#101d30] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/15 p-3 text-cyan-400">
                  <Icon size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-white">{resource.name}</h2>
                  <p className="mt-1 text-xs text-[#8ba2c1]">{resource.role}</p>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#a9bfda]">
                <input
                  type="checkbox"
                  checked={resource.active}
                  onChange={(event) =>
                    updateResource(resource.name, { active: event.target.checked })
                  }
                  className="h-4 w-4 accent-cyan-400"
                />
                {resource.active ? "Aktif" : "Pasif"}
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-xs text-[#a8beda]">
                <span className="flex items-center gap-2">
                  <Clock3 size={15} /> Mesai Başlangıcı
                </span>
                <input
                  type="time"
                  className={fieldClass}
                  value={resource.startTime}
                  onChange={(event) =>
                    updateResource(resource.name, { startTime: event.target.value })
                  }
                />
              </label>

              <label className="space-y-2 text-xs text-[#a8beda]">
                <span>Mesai Bitişi</span>
                <input
                  type="time"
                  className={fieldClass}
                  value={resource.endTime}
                  onChange={(event) =>
                    updateResource(resource.name, { endTime: event.target.value })
                  }
                />
              </label>

              <label className="space-y-2 text-xs text-[#a8beda]">
                <span>Haftalık İzin Günü</span>
                <select
                  className={fieldClass}
                  value={resource.dayOff}
                  onChange={(event) =>
                    updateResource(resource.name, {
                      dayOff: Number(event.target.value),
                    })
                  }
                >
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-300"
        >
          <CheckCircle2 size={19} />
          {message}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border border-[#29415d] bg-[#10243b] p-4 text-xs text-[#9eb4d1]">
        <ShieldCheck size={20} className="shrink-0 text-cyan-400" />
        Demo ayarları bu tarayıcıda saklanır. Sunucu tabanlı
        yetkilendirme ve merkezi kayıt .NET backend aşamasında eklenecek.
      </div>
    </div>
  );
}
