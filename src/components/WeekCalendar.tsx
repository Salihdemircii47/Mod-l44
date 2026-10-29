
import { useState } from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
  UserRound,
  Layers3,
} from "lucide-react";

import type { Appointment } from "../types/appointment";

type Props = {
  selectedDate: string;
  onDateChange: (date: string) => void;
  appointments: Appointment[];
  resources: string[];
};

type View = "week" | "day" | "resource";

const HOUR_HEIGHT = 72;

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function moveDate(value: string, days: number): string {
  const date = dateFromKey(value);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function startOfWeek(value: string): string {
  const date = dateFromKey(value);

  date.setDate(
    date.getDate() - ((date.getDay() + 6) % 7)
  );

  return dateKey(date);
}

function minutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function localToday(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const v = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${v("year")}-${v("month")}-${v("day")}`;
}

export default function WeekCalendar({
  selectedDate,
  onDateChange,
  appointments,
  resources,
}: Props) {
  const [view, setView] = useState<View>("week");

  const [detail, setDetail] =
    useState<Appointment | null>(null);

  const weekStart = startOfWeek(selectedDate);

  const days = Array.from(
    { length: 7 },
    (_, i) => moveDate(weekStart, i)
  );

  const columns =
    view === "week"
      ? days.map((date) => ({
          key: date,
          date,
          resource: null as string | null,
          title: dateFromKey(date).toLocaleDateString(
            "tr-TR",
            {
              weekday: "short",
              day: "numeric",
            }
          ),
        }))
      : view === "resource"
        ? resources.map((resource) => ({
            key: resource,
            date: selectedDate,
            resource,
            title: resource,
          }))
        : [
            {
              key: selectedDate,
              date: selectedDate,
              resource: null as string | null,
              title: dateFromKey(
                selectedDate
              ).toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
              }),
            },
          ];

  // Görüntülenen günlerdeki gerçek randevular
  const onScreenDates = new Set(
    columns.map((col) => col.date)
  );

  const visible = appointments.filter(
    (appointment) =>
      appointment.status !== "İptal" &&
      onScreenDates.has(appointment.date)
  );

  // Randevu mesai dışındaysa takvimin saat aralığını genişlet.
  const startHour = Math.max(
    0,
    Math.min(
      9,
      ...visible.map(
        (a) => Math.floor(minutes(a.time) / 60)
      )
    )
  );

  const endHour = Math.min(
    24,
    Math.max(
      18,
      ...visible.map(
        (a) =>
          Math.ceil(
            (minutes(a.time) + a.duration) / 60
          )
      )
    )
  );

  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i
  );

  const totalHeight = hours.length * HOUR_HEIGHT;

  const buttonClass =
    "rounded-lg border border-[#29415d] " +
    "px-3 py-2 text-xs text-[#a6bfdc] " +
    "hover:bg-[#1b3656]";

  const label =
    view === "week"
      ? `${dateFromKey(days[0]).toLocaleDateString(
          "tr-TR",
          { day: "numeric", month: "short" }
        )} – ${dateFromKey(days[6]).toLocaleDateString(
          "tr-TR",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )}`
      : dateFromKey(selectedDate).toLocaleDateString(
          "tr-TR",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#263b58] bg-[#101d30]">

      {/* TAKVİM KONTROLLERİ */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#263b58] p-5">
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            <CalendarDays
              size={19}
              className="text-cyan-400"
            />
            Planlama Takvimi
          </h2>

          <p className="mt-2 text-xs capitalize text-[#819ab9]">
            {label}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-[#091627] p-1">
            {(
              [
                ["week", "Hafta"],
                ["day", "Gün"],
                ["resource", "Kaynak"],
              ] as const
            ).map(([value, title]) => (
              <button
                type="button"
                key={value}
                onClick={() => setView(value)}
                className={`rounded-lg px-3 py-2 text-xs ${
                  view === value
                    ? "bg-blue-600 text-white"
                    : "text-[#829bb9] hover:text-white"
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={buttonClass}
            aria-label="Önceki dönem"
            onClick={() =>
              onDateChange(
                moveDate(
                  selectedDate,
                  view === "week" ? -7 : -1
                )
              )
            }
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            className={buttonClass}
            onClick={() => onDateChange(localToday())}
          >
            Bugün
          </button>

          <button
            type="button"
            className={buttonClass}
            aria-label="Sonraki dönem"
            onClick={() =>
              onDateChange(
                moveDate(
                  selectedDate,
                  view === "week" ? 7 : 1
                )
              )
            }
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* TAKVİM TABLOSU */}
      {columns.length === 0 ? (
        <p className="p-6 text-sm text-slate-400">
          Bu sektör için kaynak bulunamadı.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="grid"
            style={{
              minWidth:
                view === "week"
                  ? 900
                  : Math.max(650, columns.length * 160),

              gridTemplateColumns:
                `70px repeat(${columns.length}, minmax(0, 1fr))`,
            }}
          >

            {/* SOL ÜST BAŞLIK */}
            <div className="border-b border-r border-[#263b58] bg-[#0c1a2c] p-4 text-xs text-[#829bb9]">
              Saat
            </div>

            {/* GÜN / KAYNAK BAŞLIKLARI */}
            {columns.map((col) => (
              <div
                key={col.key}
                className={`border-b border-r border-[#263b58] p-4 text-center ${
                  col.date === localToday()
                    ? "bg-blue-600/15"
                    : "bg-[#0c1a2c]"
                }`}
              >
                <p className="text-xs font-semibold text-white">
                  {col.title}
                </p>
              </div>
            ))}

            {/* SAAT SÜTUNU */}
            <div className="border-r border-[#263b58]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-[#20344f] pr-2 pt-2 text-right text-[10px] text-[#7492b5]"
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* TAKVİM RANDEVULARI */}
            {columns.map((col) => {
              const entries = appointments.filter(
                (item) =>
                  item.status !== "İptal" &&
                  item.date === col.date &&
                  (
                    col.resource === null ||
                    item.resource === col.resource ||
                    (
                      item.additionalResources ?? []
                    ).includes(col.resource)
                  )
              );

              return (
                <div
                  key={col.key}
                  className="relative border-r border-[#263b58]"
                  style={{ height: totalHeight }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: HOUR_HEIGHT }}
                      className="border-b border-[#20344f] hover:bg-blue-500/5"
                    />
                  ))}

                  {entries.map((item, index) => {
                    const top =
                      (
                        (minutes(item.time) -
                          startHour * 60) / 60
                      ) * HOUR_HEIGHT;

                    const height =
                      item.duration / 60 * HOUR_HEIGHT;

                    const visibleTop = Math.max(0, top);

                    const visibleHeight = Math.min(
                      height - Math.max(0, -top),
                      totalHeight - visibleTop
                    );

                    if (visibleHeight <= 0) {
                      return null;
                    }

                    const palette = [
                      "from-[#14598c] to-[#1e4179] border-cyan-400",
                      "from-[#433080] to-[#262f66] border-violet-400",
                      "from-[#145f56] to-[#164b60] border-emerald-400",
                    ];

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDetail(item)}
                        title={`${item.customer} · ${item.service} · ${item.resource}`}
                        className={`absolute z-10 overflow-hidden rounded-lg border-l-[3px] bg-gradient-to-br p-2 text-left shadow-lg hover:brightness-125 ${
                          palette[index % palette.length]
                        }`}
                        style={{
                          top: visibleTop + 2,
                          height: Math.max(
                            8,
                            visibleHeight - 4
                          ),
                          left: "4px",
                          right: "4px",
                        }}
                      >
                        <span className="block truncate text-[10px] font-bold text-cyan-100">
                          {item.time}
                        </span>

                        {visibleHeight >= 34 && (
                          <span className="block truncate text-[10px] font-semibold text-white">
                            {item.customer}
                          </span>
                        )}

                        {visibleHeight >= 55 && (
                          <span className="block truncate text-[10px] text-blue-100">
                            {item.service}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ALT BİLGİ */}
      <div className="flex flex-wrap gap-5 border-t border-[#263b58] px-5 py-4 text-xs text-[#8da6c5]">
        <span className="flex items-center gap-2">
          <Layers3
            size={15}
            className="text-cyan-400"
          />

          {view === "resource"
            ? "Kaynak bazlı günlük plan"
            : "Zaman bazlı planlama"}
        </span>

        <span>
          {String(startHour).padStart(2, "0")}:00–
          {String(endHour).padStart(2, "0")}:00
          {" "}· Görüntülenen saatler
        </span>
      </div>

      {/* RANDEVU DETAYI */}
      {detail && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Randevu detayı"
            className="w-full max-w-md rounded-2xl border border-[#345174] bg-[#14243a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                Randevu Detayı
              </h3>

              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setDetail(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm text-[#c4d6ee]">
              <p className="flex items-center gap-3">
                <UserRound
                  size={19}
                  className="text-cyan-400"
                />
                {detail.customer}
              </p>

              <p className="flex items-center gap-3">
                <CalendarDays
                  size={19}
                  className="text-cyan-400"
                />
                {detail.date} · {detail.service}
              </p>

              <p className="flex items-center gap-3">
                <Clock3
                  size={19}
                  className="text-cyan-400"
                />
                {detail.time} · {detail.duration} dakika
              </p>

              <div className="rounded-xl bg-[#0b1829] p-4">
                <p>
                  Ana kaynak:{" "}
                  <strong className="text-white">
                    {detail.resource}
                  </strong>
                </p>

                {(detail.additionalResources?.length ?? 0) > 0 && (
                  <p className="mt-2">
                    Yardımcı kaynaklar:{" "}
                    {detail.additionalResources?.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
