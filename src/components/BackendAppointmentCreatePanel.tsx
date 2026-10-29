
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { SectorId } from "../data/sectors";

import {
  getBackendServices,
  type BackendService,
} from "../api/backendServicesApi";

import {
  getBackendResources,
  type BackendResource,
} from "../api/backendResourcesApi";

import {
  createBackendAppointment,
} from "../api/backendAppointmentsApi";

import {
  createMultiResourceAppointment,
} from "../api/backendMultiResourceAppointmentsApi";

import {
  getResourceAvailability,
  getMultiResourceAvailability,
  type AvailableSlot,
} from "../api/backendAvailabilityApi";

import { normalizeSector } from "../utils/sectorMapping";

type Props = {
  sectorId: SectorId;
};

type Customer = {
  id: number;
  fullName: string;
};

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5187"
).replace(/\/$/, "");

function getError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Beklenmeyen bir hata oluştu.";
}

function todayInTurkey(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function isFuture(slot: AvailableSlot): boolean {
  return new Date(slot.startUtc).getTime() > Date.now();
}

export default function BackendAppointmentCreatePanel({
  sectorId,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<BackendService[]>([]);
  const [resources, setResources] = useState<BackendResource[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [resourceId, setResourceId] = useState("");

  const [additionalResourceIds, setAdditionalResourceIds] =
    useState<number[]>([]);

  const [date, setDate] = useState(todayInTurkey);
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] =
    useState<AvailableSlot | null>(null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const versionRef = useRef(0);
  const savingRef = useRef(false);

  // GERÇEK API VERİLERİNİ YÜKLE
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const [customerResponse, serviceData, resourceData] =
          await Promise.all([
            fetch(`${API_URL}/api/Customers`),
            getBackendServices(),
            getBackendResources(),
          ]);

        if (!customerResponse.ok) {
          throw new Error("Müşteriler yüklenemedi.");
        }

        const customerData =
          (await customerResponse.json()) as Customer[];

        if (!active) return;

        setCustomers(customerData);
        setServices(serviceData);
        setResources(resourceData);
      } catch (err) {
        if (active) setError(getError(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  // SEKTÖR DEĞİŞİNCE SEÇİMLERİ SIFIRLA
  useEffect(() => {
    versionRef.current += 1;
    setServiceId("");
    setResourceId("");
    setAdditionalResourceIds([]);
    setSlots([]);
    setSelectedSlot(null);
    setChecking(false);
    setError("");
    setMessage("");
  }, [sectorId]);

  const sectorServices = services.filter(
    (service) =>
      normalizeSector(service.sector) === sectorId
  );

  const sectorResources = resources.filter(
    (resource) =>
      normalizeSector(resource.sector) === sectorId &&
      resource.isActive
  );

  const mainResourceId = Number(resourceId);

  const selectedResourceIds = resourceId
    ? [
        mainResourceId,
        ...additionalResourceIds.filter(
          (id) => id !== mainResourceId
        ),
      ]
    : [];

  const isMultiResource = selectedResourceIds.length > 1;

  function clearAvailability() {
    versionRef.current += 1;
    setSlots([]);
    setSelectedSlot(null);
    setChecking(false);
    setError("");
    setMessage("");
  }

  function changeMainResource(value: string) {
    clearAvailability();
    setResourceId(value);

    setAdditionalResourceIds((previous) =>
      previous.filter((id) => id !== Number(value))
    );
  }

  function toggleAdditionalResource(id: number) {
    if (saving || checking) return;

    clearAvailability();

    setAdditionalResourceIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  // TEK / ÇOKLU KAYNAK UYGUNLUK SORGUSU
  async function queryAvailability(
    ids: number[],
    currentServiceId: number,
    selectedDate: string
  ) {
    if (ids.length === 1) {
      return getResourceAvailability(
        ids[0],
        currentServiceId,
        selectedDate
      );
    }

    return getMultiResourceAvailability(
      ids,
      currentServiceId,
      selectedDate
    );
  }

  async function checkAvailability() {
    if (
      checking ||
      savingRef.current ||
      !resourceId ||
      !serviceId ||
      !date
    ) {
      return;
    }

    const ids = [...selectedResourceIds];

    if (
      !sectorServices.some((s) => s.id === Number(serviceId)) ||
      !ids.every((id) =>
        sectorResources.some((r) => r.id === id)
      )
    ) {
      setError("Hizmet veya kaynak seçimi geçersiz.");
      return;
    }

    const version = ++versionRef.current;

    setChecking(true);
    setSlots([]);
    setSelectedSlot(null);
    setError("");
    setMessage("");

    try {
      const result = await queryAvailability(
        ids,
        Number(serviceId),
        date
      );

      if (version !== versionRef.current) return;

      const available = result.availableSlots.filter(isFuture);

      setSlots(available);

      setMessage(
        available.length > 0
          ? `${ids.length} kaynak için ${available.length} uygun saat bulundu.`
          : "Seçilen kaynakların uygun saati bulunamadı."
      );
    } catch (err) {
      if (version === versionRef.current) {
        setError(getError(err));
      }
    } finally {
      if (version === versionRef.current) {
        setChecking(false);
      }
    }
  }

  // RANDEVUYU GERÇEK BACKEND'E KAYDET
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (savingRef.current || checking) return;

    setError("");
    setMessage("");

    if (
      !customerId ||
      !serviceId ||
      !resourceId ||
      !selectedSlot
    ) {
      setError("Bütün zorunlu alanları doldur.");
      return;
    }

    if (!isFuture(selectedSlot)) {
      setError("Bu saat artık geçmişte kaldı.");
      setSelectedSlot(null);
      return;
    }

    const ids = [...selectedResourceIds];

    if (
      !ids.every((id) =>
        sectorResources.some((r) => r.id === id)
      )
    ) {
      setError("Seçilen kaynaklardan biri artık geçersiz.");
      return;
    }

    const version = versionRef.current;
    const slot = selectedSlot;
    const selectedDate = date;
    const selectedServiceId = Number(serviceId);

    savingRef.current = true;
    setSaving(true);

    try {
      // KAYIT ÖNCESİ TEKRAR UYGUNLUK KONTROLÜ
      const latest = await queryAvailability(
        ids,
        selectedServiceId,
        selectedDate
      );

      if (version !== versionRef.current) {
        throw new Error(
          "Seçimler değişti. Saatleri yeniden sorgula."
        );
      }

      const stillAvailable = latest.availableSlots.some(
        (item) =>
          item.startUtc === slot.startUtc &&
          item.endUtc === slot.endUtc &&
          isFuture(item)
      );

      if (!stillAvailable) {
        setSlots(latest.availableSlots.filter(isFuture));
        setSelectedSlot(null);

        throw new Error(
          "Seçilen saat artık müsait değil. Yeni saat seç."
        );
      }

      let createdId: number | undefined;

      // TEK KAYNAK
      if (ids.length === 1) {
        const created = await createBackendAppointment({
          customerId: Number(customerId),
          serviceId: selectedServiceId,
          resourceId: ids[0],
          startTime: slot.startUtc,
          endTime: slot.endUtc,
          notes: notes.trim() || null,
        });

        createdId = created?.id;
      } else {
        // ÇOKLU KAYNAK
        const created = await createMultiResourceAppointment({
          customerId: Number(customerId),
          serviceId: selectedServiceId,
          startTime: slot.startUtc,
          endTime: slot.endUtc,
          notes: notes.trim() || null,
          resources: ids.map((id, index) => ({
            resourceId: id,
            role: index === 0 ? "Primary" : "Assistant",
          })),
        });

        createdId = created?.id;
      }

      versionRef.current += 1;
      setSlots([]);
      setSelectedSlot(null);
      setNotes("");

      setMessage(
        `Randevu başarıyla oluşturuldu. ID: ${
          createdId ?? "API onayladı"
        }`
      );

      window.dispatchEvent(
        new Event("mod44:appointments-updated")
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#304963] " +
    "bg-[#0b1728] p-3 text-sm text-white " +
    "outline-none focus:border-cyan-400";

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">

      <div>
        <h2 className="text-xl font-bold">
          Gerçek Randevu Oluştur
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          PostgreSQL bağlantılı kaynak ve randevu planlama
        </p>
      </div>

      {loading ? (
        <p className="text-slate-400">
          Veriler yükleniyor...
        </p>
      ) : (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-5"
        >

          {/* MÜŞTERİ - HİZMET - KAYNAK - TARİH */}
          <div className="grid gap-4 md:grid-cols-2">

            <label className="space-y-2 text-sm">
              <span>Müşteri</span>

              <select
                required
                disabled={saving}
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
                className={inputClass}
              >
                <option value="">Müşteri seçiniz</option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span>Hizmet</span>

              <select
                required
                disabled={saving}
                value={serviceId}
                onChange={(e) => {
                  clearAvailability();
                  setServiceId(e.target.value);
                }}
                className={inputClass}
              >
                <option value="">Hizmet seçiniz</option>

                {sectorServices.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name} ({service.durationMinutes} dk)
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span>Ana kaynak</span>

              <select
                required
                disabled={saving}
                value={resourceId}
                onChange={(e) =>
                  changeMainResource(e.target.value)
                }
                className={inputClass}
              >
                <option value="">Kaynak seçiniz</option>

                {sectorResources.map((resource) => (
                  <option
                    key={resource.id}
                    value={resource.id}
                  >
                    {resource.name} ({resource.type})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span>Tarih</span>

              <input
                type="date"
                required
                disabled={saving}
                min={todayInTurkey()}
                value={date}
                onChange={(e) => {
                  clearAvailability();
                  setDate(e.target.value);
                }}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </label>
          </div>

          {/* YARDIMCI KAYNAKLAR */}
          <div className="space-y-3 rounded-xl border border-[#304963] bg-[#0b1728] p-4">

            <h3 className="text-sm font-semibold">
              Yardımcı Kaynaklar (İsteğe Bağlı)
            </h3>

            <p className="text-xs text-slate-400">
              Birden fazla kaynak seçildiğinde ortak
              müsait saatler hesaplanır.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {sectorResources
                .filter(
                  (resource) =>
                    resource.id !== mainResourceId
                )
                .map((resource) => (
                  <label
                    key={resource.id}
                    className="flex items-center gap-3 rounded-lg border border-[#304963] p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      disabled={saving || checking}
                      checked={additionalResourceIds.includes(
                        resource.id
                      )}
                      onChange={() =>
                        toggleAdditionalResource(resource.id)
                      }
                      className="h-4 w-4 accent-cyan-500"
                    />

                    <span>{resource.name}</span>
                    <span className="text-xs text-slate-400">
                      {resource.type}
                    </span>
                  </label>
                ))}
            </div>

            {sectorResources.length <= 1 && (
              <p className="text-xs text-amber-300">
                Yardımcı kaynak için aynı sektöre
                ikinci aktif kaynak eklemelisin.
              </p>
            )}

            <p className="text-xs text-cyan-300">
              Seçilen kaynak sayısı: {selectedResourceIds.length}
            </p>
          </div>

          {/* MÜSAİTLİK SORGUSU */}
          <button
            type="button"
            disabled={
              saving ||
              checking ||
              !serviceId ||
              !resourceId ||
              !date
            }
            onClick={() => void checkAvailability()}
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 disabled:opacity-50"
          >
            {checking
              ? "Kontrol ediliyor..."
              : "Müsait Saatleri Göster"}
          </button>

          {/* UYGUN SAATLER */}
          {slots.length > 0 && (
            <div className="space-y-3">

              <h3 className="text-sm font-semibold">
                Uygun Saatler ({slots.length})
              </h3>

              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const selected =
                    selectedSlot?.startUtc === slot.startUtc;

                  return (
                    <button
                      type="button"
                      key={slot.startUtc}
                      disabled={saving || checking}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setError("");
                      }}
                      className={`rounded-xl border px-4 py-3 text-sm transition ${
                        selected
                          ? "border-cyan-300 bg-cyan-500 text-white"
                          : "border-[#304963] bg-[#0b1728] text-slate-300 hover:border-cyan-400"
                      }`}
                    >
                      {slot.startTime}–{slot.endTime}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEÇİLEN SAAT */}
          {selectedSlot && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              Seçilen saat: {selectedSlot.startTime}–
              {selectedSlot.endTime}
            </div>
          )}

          {/* NOT */}
          <label className="block space-y-2 text-sm">
            <span>Not (isteğe bağlı)</span>

            <textarea
              rows={2}
              disabled={saving}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </label>

          {/* KAYDET */}
          <button
            type="submit"
            disabled={
              saving ||
              checking ||
              !customerId ||
              !serviceId ||
              !resourceId ||
              !selectedSlot
            }
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {saving
              ? "Kaydediliyor..."
              : isMultiResource
                ? "Çoklu Kaynak Randevusu Oluştur"
                : "Randevuyu PostgreSQL'e Kaydet"}
          </button>
        </form>
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
    </section>
  );
}
