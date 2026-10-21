
import { useState } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  Clock3, X, UserRound, Layers3
} from "lucide-react";

type CalendarAppointment = {
  id: string;
  customer: string;
  service: string;
  resource: string;
  date: string;
  time: string;
  duration: number;
  status: string;
};

type Props = {
  selectedDate: string;
  onDateChange: (date: string) => void;
  appointments: CalendarAppointment[];
  resources: string[];
};

type View = "week" | "day" | "resource";

const START_HOUR = 9;
const END_HOUR = 18;
const HOUR_HEIGHT = 72;

function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function moveDate(value: string, days: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function startOfWeek(value: string) {
  const date = parseDate(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return dateKey(date);
}

function toMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

const panelButton =
  "rounded-lg border border-[#29415d] px-3 py-2 text-xs text-[#a6bfdc] hover:bg-[#1b3656]";

export default function WeekCalendar({
  selectedDate,
  onDateChange,
  appointments,
  resources,
}: Props) {
  const [view, setView] = useState<View>("week");
  const [detail, setDetail] =
    useState<CalendarAppointment | null>(null);

  const weekStart = startOfWeek(selectedDate);

  const days = Array.from({ length: 7 }, (_, i) =>
    moveDate(weekStart, i)
  );

  const columns =
    view === "week"
      ? days.map((date) => ({
          key: date,
          date,
          resource: null as string | null,
          title: parseDate(date).toLocaleDateString("tr-TR", {
            weekday: "short",
            day: "numeric",
          }),
        }))
      : view === "resource"
      ? resources.map((resource) => ({
          key: resource,
          date: selectedDate,
          resource,
          title: resource,
        }))
      : [{
          key: selectedDate,
          date: selectedDate,
          resource: null as string | null,
          title: parseDate(selectedDate).toLocaleDateString(
            "tr-TR",
            { weekday: "long", day: "numeric" }
          ),
        }];

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  const periodLabel =
    view === "week"
      ? `${parseDate(days[0]).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "short"
        })} – ${parseDate(days[6]).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })}`
      : parseDate(selectedDate).toLocaleDateString("tr-TR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        });

  function changePeriod(direction: number) {
    onDateChange(
      moveDate(selectedDate, direction * (view === "week" ? 7 : 1))
    );
  }

  const totalHeight = hours.length * HOUR_HEIGHT;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#263b58] bg-[#101d30]">

      {/* ÜST KONTROLLER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#263b58] p-5">
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            <CalendarDays size={19} className="text-cyan-400" />
            Planlama Takvimi
          </h2>
          <p className="mt-2 text-xs capitalize text-[#819ab9]">
            {periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-[#091627] p-1">
            {([
              ["week", "Hafta"],
              ["day", "Gün"],
              ["resource", "Kaynak"]
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`rounded-lg px-3 py-2 text-xs transition ${
                  view === value
                    ? "bg-blue-600 text-white"
                    : "text-[#829bb9] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Önceki dönem"
            className={panelButton}
            onClick={() => changePeriod(-1)}
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            className={panelButton}
            onClick={() => onDateChange(dateKey(new Date()))}
          >
            Bugün
          </button>

          <button
            type="button"
            aria-label="Sonraki dönem"
            className={panelButton}
            onClick={() => changePeriod(1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* TAKVİM TABLOSU */}
      <div className="overflow-x-auto">
        <div
          className="grid"
          style={{
            minWidth: view === "week" ? 900 : 650,
            gridTemplateColumns:
              `70px repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="border-b border-r border-[#263b58] bg-[#0c1a2c] p-4 text-xs text-[#829bb9]">
            Saat
          </div>

          {columns.map((col) => {
            const isToday = col.date === dateKey(new Date());

            return (
              <div
                key={col.key}
                className={`border-b border-r border-[#263b58] p-4 text-center ${
                  isToday ? "bg-blue-600/15" : "bg-[#0c1a2c]"
                }`}
              >
                <p className={`text-xs font-semibold ${
                  isToday ? "text-cyan-400" : "text-white"
                }`}>
                  {col.title}
                </p>
                {view === "resource" && (
                  <p className="mt-2 text-[10px] text-[#7691b2]">
                    Kaynak planı
                  </p>
                )}
              </div>
            );
          })}

          {/* SAAT SÜTUNU */}
          <div className="border-r border-[#263b58]">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-[#20344f] pr-2 pt-2 text-right text-[10px] text-[#7492b5]"
                style={{ height: HOUR_HEIGHT }}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* GÜN / KAYNAK SÜTUNLARI */}
          {columns.map((col) => {
            const items = appointments.filter((item) =>
              item.status !== "İptal" &&
              item.date === col.date &&
              (col.resource === null ||
                item.resource === col.resource)
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

                {items.map((item, index) => {
                  const start = toMinutes(item.time);
                  const top =
                    ((start - START_HOUR * 60) / 60) *
                    HOUR_HEIGHT;

                  const height =
                    (item.duration / 60) * HOUR_HEIGHT;

                  const visibleTop = Math.max(0, top);
                  const visibleHeight = Math.min(
                    height - Math.max(0, -top),
                    totalHeight - visibleTop
                  );

                  if (visibleHeight <= 0) return null;

                  const colors = [
                    "from-[#14598c] to-[#1e4179] border-cyan-400",
                    "from-[#433080] to-[#262f66] border-violet-400",
                    "from-[#145f56] to-[#164b60] border-emerald-400",
                  ];

                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={`${item.customer} · ${item.resource}`}
                      onClick={() => setDetail(item)}
                      className={`absolute z-10 overflow-hidden rounded-lg border-l-[3px] bg-gradient-to-br p-2 text-left shadow-lg hover:brightness-125 ${
                        colors[index % colors.length]
                      }`}
                      style={{
                        top: visibleTop + 2,
                        height: Math.max(8, visibleHeight - 4),
                        // Haftalık görünümde eşzamanlı
                        // işler için tam çakışmayı azaltır.
                        left: view === "week" ? "3%" : "6px",
                        right: view === "week" ? "3%" : "6px",
                      }}
                    >
                      <span className="block truncate text-[10px] font-bold text-cyan-100">
                        {item.time}
                      </span>

                      {visibleHeight >= 40 && (
                        <span className="mt-1 block truncate text-[10px] font-semibold text-white">
                          {item.customer}
                        </span>
                      )}

                      {visibleHeight >= 60 && (
                        <span className="mt-1 block truncate text-[10px] text-blue-100">
                          {view === "resource"
                            ? item.service
                            : item.resource}
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

      <div className="flex flex-wrap gap-5 border-t border-[#263b58] px-5 py-4 text-xs text-[#8da6c5]">
        <span className="flex items-center gap-2">
          <Layers3 size={15} className="text-cyan-400" />
          {view === "resource"
            ? "Kaynak bazlı günlük plan"
            : "Zaman bazlı planlama"}
        </span>
        <span>09.00–18.00 · Demo mesai saatleri</span>
      </div>

      {/* RANDEVU DETAY PENCERESİ */}
      {detail && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            className="w-full max-w-md rounded-2xl border border-[#345174] bg-[#14243a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 id="detail-title" className="text-lg font-bold">
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
              <div className="flex items-center gap-3">
                <UserRound size={19} className="text-cyan-400" />
                {detail.customer}
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays size={19} className="text-cyan-400" />
                {detail.date} · {detail.service}
              </div>
              <div className="flex items-center gap-3">
                <Clock3 size={19} className="text-cyan-400" />
                {detail.time} · {detail.duration} dakika
              </div>
              <div className="rounded-xl bg-[#0b1829] p-4">
                Kaynak:{" "}
                <strong className="text-white">
                  {detail.resource}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
