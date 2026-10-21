import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import WeekCalendar from "../components/WeekCalendar";
import type { SectorId } from "../data/sectors";

import {
  checkAvailability,
  suggestAvailableTimes,
  getBufferMinutes,
} from "../utils/availability";
import { loadServices } from "./ServicesPage";

type Appointment = {
  id: string;
  sectorId: SectorId;
  customer: string;
  service: string;
  resource: string;
  date: string;
  time: string;
  duration: number;
  status: "Onaylandı" | "İptal";
};

type Props = { sectorId: SectorId };

const configs = {
  beauty: {
    label: "Kuaför & Güzellik",
    resourceLabel: "Personel",
    resources: ["Elif Demir", "Burak Yıldız", "Zeynep Arslan"],
  },
  fleet: {
    label: "Vidanjör / Kombine / Kuka",
    resourceLabel: "Araç",
    resources: ["34 VDJ 101", "34 KMB 202", "34 KKA 303"],
  },
  construction: {
    label: "Altyapı İnşaat",
    resourceLabel: "Ekip / İş Makinesi",
    resources: ["Keşif Ekibi A", "Ekskavatör 01", "Saha Ekibi B"],
  },
};

// Bu anahtarı değiştirmiyoruz: önceki randevular localStorage'dan okunabilsin.
const STORAGE_KEY = "mod44-demo-appointments-v1";

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: string, amount: number): string {
  const [year, month, day] = value.split("-").map(Number);
  return dateKey(new Date(year, month - 1, day + amount));
}


function loadAppointments(): Appointment[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const data: unknown = JSON.parse(saved);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item): item is Appointment =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.sectorId === "string" &&
        typeof item.customer === "string" &&
        typeof item.service === "string" &&
        typeof item.resource === "string" &&
        typeof item.date === "string" &&
        typeof item.time === "string" &&
        typeof item.duration === "number" &&
        (item.status === "Onaylandı" || item.status === "İptal")
    );
  } catch {
    return [];
  }
}

const inputClass =
  "w-full rounded-xl border border-[#294361] bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400";

export default function CalendarPage({ sectorId }: Props) {
  const config = configs[sectorId];
  const activeServices = loadServices()[sectorId].filter((item) => item.active);

  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments);
  const [modalOpen, setModalOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [service, setService] = useState<string>(() => activeServices[0]?.id ?? "");
  const [resource, setResource] = useState<string>(config.resources[0]);
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    const nextConfig = configs[sectorId];
    setService(loadServices()[sectorId].find((item) => item.active)?.id ?? "");
    setResource(nextConfig.resources[0]);
    setError("");
    setSuggestions([]);
    setMessage("");
    setModalOpen(false);
  }, [sectorId]);

  const sectorAppointments = appointments.filter(
    (item) => item.sectorId === sectorId && item.status !== "İptal"
  );
  const dayAppointments = sectorAppointments
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const usedResources = new Set(dayAppointments.map((item) => item.resource));
  const selectedService = activeServices.find((item) => item.id === service);

  const displayDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "tr-TR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuggestions([]);

    if (!customer.trim()) {
      setError("Müşteri veya iş adı giriniz.");
      return;
    }

    // Katalogdan tekrar okuyarak pasife alınan/silinen hizmetleri engelle.
    const currentService = loadServices()[sectorId].find(
      (item) => item.id === service && item.active
    );
    if (!currentService) {
      setError("Geçerli ve aktif bir hizmet seçiniz.");
      return;
    }

    const request = {
      sectorId,
      date: selectedDate,
      time,
      duration: currentService.duration,
      resource,
      appointments,
    };

    const result = checkAvailability(request);
    if (!result.available) {
      setError(result.reason);
      setSuggestions(suggestAvailableTimes(request));
      return;
    }

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      sectorId,
      customer: customer.trim(),
      service: currentService.name,
      resource,
      date: selectedDate,
      time,
      duration: currentService.duration,
      status: "Onaylandı",
    };

    setAppointments((previous) => [...previous, appointment]);
    setMessage("Randevu başarıyla oluşturuldu.");
    setCustomer("");
    setSuggestions([]);
    setModalOpen(false);
  }

  function cancelAppointment(id: string) {
    if (!window.confirm("Bu randevuyu iptal etmek istiyor musunuz?")) return;
    setAppointments((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status: "İptal" } : item
      )
    );
    setMessage("Randevu iptal edildi; ilgili saat yeniden rezerve edilebilir.");
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* Sayfa başlığı */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[2px] text-cyan-400">
            MOD44 / PLANLAMA MERKEZİ
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">Randevu Takvimi</h1>
          <p className="mt-2 text-sm text-[#8299b7]">
            {config.label} için randevuları ve kaynakları yönetin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            setSuggestions([]);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} /> Yeni Randevu
        </button>
      </div>

      {/* Özet kartları */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Günlük Randevu", value: dayAppointments.length },
          { label: "Bugün Randevusu Olan Kaynak", value: usedResources.size },
          {
            label: "Bugün Randevusu Olmayan Kaynak",
            value: config.resources.length - usedResources.size,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[#203653] bg-[#111e32] p-5"
          >
            <p className="text-xs text-[#8ba1bf]">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-cyan-400">{item.value}</p>
          </div>
        ))}
      </div>

      {/* HAFTALIK/GÜNLÜK TAKVİM: önce bu bölüm gösterilir. */}
      <WeekCalendar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        appointments={appointments.filter((item) => item.sectorId === sectorId)}
        resources={config.resources}
      />

      {/* Kaynak bazlı günlük randevu kartları */}
      <section className="rounded-2xl border border-[#203653] bg-[#101d30] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-cyan-400" />
            <div>
              <h2 className="font-semibold capitalize text-white">{displayDate}</h2>
              <p className="text-xs text-[#7e94b3]">Kaynak bazlı günlük planlama</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Önceki gün"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="rounded-lg border border-[#2a4262] p-2 hover:bg-[#1c3451]"
            >
              <ChevronLeft size={19} />
            </button>
            <input
              type="date"
              aria-label="Randevu tarihi"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) {
                        setSelectedDate(event.target.value);
                        setError("");
                        setSuggestions([]);
                      }
              }}
              className="rounded-lg border border-[#2a4262] bg-[#0b1728] p-2 text-sm text-white [color-scheme:dark]"
            />
            <button
              type="button"
              aria-label="Sonraki gün"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="rounded-lg border border-[#2a4262] p-2 hover:bg-[#1c3451]"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
          >
            <CheckCircle2 size={17} /> {message}
          </div>
        )}

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {config.resources.map((name) => {
            const resourceAppointments = dayAppointments.filter(
              (item) => item.resource === name
            );
            return (
              <div
                key={name}
                className="min-h-64 rounded-2xl border border-[#28405f] bg-[#0b1728] p-4"
              >
                <div className="mb-5 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{name}</h3>
                    <p className="mt-1 text-xs text-[#7c93b1]">
                      {config.resourceLabel}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[11px] text-blue-300">
                    {resourceAppointments.length} iş
                  </span>
                </div>

                {resourceAppointments.length === 0 ? (
                  <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-[#29415f] text-center text-xs text-[#7189a9]">
                    Bu gün için kayıt yok
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resourceAppointments.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border-l-4 border-cyan-400 bg-[#162d49] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs font-bold text-cyan-300">
                            <Clock3 size={14} /> {item.time}
                          </span>
                          <button
                            type="button"
                            aria-label={`${item.customer} randevusunu iptal et`}
                            title="Randevuyu iptal et"
                            onClick={() => cancelAppointment(item.id)}
                            className="text-[#8ba6c7] hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="mt-3 text-sm font-bold text-white">{item.customer}</p>
                        <p className="mt-1 text-xs text-[#8ba4c2]">
                          {item.service} · {item.duration} dk
                        </p>
                        <span className="mt-3 inline-block rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">
                          Onaylandı
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Yeni randevu penceresi */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-title"
            className="my-auto w-full max-w-lg rounded-3xl border border-[#2a4667] bg-[#111f35] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 id="appointment-title" className="text-xl font-bold text-white">
                  Yeni Randevu
                </h2>
                <p className="mt-1 text-xs text-[#849bb9]">{config.label}</p>
              </div>
              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-white hover:bg-[#203650]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createAppointment} className="space-y-4">
              <label className="block space-y-2 text-xs text-[#9eb4d1]">
                <span>Müşteri / İş adı</span>
                <input
                  className={inputClass}
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                  placeholder="Örnek: ABC İnşaat"
                  maxLength={100}
                  required
                />
              </label>

              <label className="block space-y-2 text-xs text-[#9eb4d1]">
                <span>Hizmet</span>
                <select
                  className={inputClass}
                  value={service}
                  onChange={(event) => {
                      setService(event.target.value);
                      setError("");
                      setSuggestions([]);
                    }}
                  disabled={activeServices.length === 0}
                >
                  {activeServices.length === 0 && (
                    <option value="">Aktif hizmet bulunmuyor</option>
                  )}
                  {activeServices.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.duration} dk)
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-xs text-[#9eb4d1]">
                <span>{config.resourceLabel}</span>
                <select
                  className={inputClass}
                  value={resource}
                  onChange={(event) => {
                      setResource(event.target.value);
                      setError("");
                      setSuggestions([]);
                    }}
                >
                  {config.resources.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2 text-xs text-[#9eb4d1]">
                  <span>Tarih</span>
                  <input
                    type="date"
                    className={`${inputClass} [color-scheme:dark]`}
                    value={selectedDate}
                    onChange={(event) => {
                      if (event.target.value) {
                        setSelectedDate(event.target.value);
                        setError("");
                        setSuggestions([]);
                      }
                    }}
                    required
                  />
                </label>
                <label className="block space-y-2 text-xs text-[#9eb4d1]">
                  <span>Saat</span>
                  <input
                    type="time"
                    className={`${inputClass} [color-scheme:dark]`}
                    value={time}
                    onChange={(event) => {
                      setTime(event.target.value);
                      setError("");
                      setSuggestions([]);
                    }}
                    required
                  />
                </label>
              </div>

              <div className="rounded-xl bg-[#0b1728] p-3 text-xs text-[#90a9ca]">
                Süre: <strong className="text-white">{selectedService?.duration ?? 0} dakika</strong>
                <span className="mx-2">•</span> Mesai: 09.00–18.00
                <p className="mt-2 text-[11px] text-[#8ba5c5]">
                  Hazırlık / temizlik tamponu: {getBufferMinutes(sectorId)} dakika
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300"
                >
                  <AlertTriangle size={17} className="shrink-0" /> {error}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="mb-3 text-xs font-semibold text-cyan-300">
                    Önerilen Müsait Saatler
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestedTime) => (
                      <button
                        key={suggestedTime}
                        type="button"
                        onClick={() => {
                          setTime(suggestedTime);
                          setError("");
                          setSuggestions([]);
                        }}
                        className="rounded-lg border border-cyan-500/30 bg-[#102a44] px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-blue-600 hover:text-white"
                      >
                        {suggestedTime}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] text-[#829ab9]">
                    Bir saate tıklayarak randevu saatini değiştirebilirsiniz.
                  </p>
                </div>
              )}


              <button
                type="submit"
                disabled={!selectedService}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Randevuyu Oluştur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
