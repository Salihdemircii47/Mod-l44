
import { CalendarRange, Clock3 } from "lucide-react";
import type { ResourceSetting } from "../pages/ResourcesPage";

type Props = {
  resources: ResourceSetting[];
};

const days = [
  { name: "Pzt", number: 1 },
  { name: "Sal", number: 2 },
  { name: "Çar", number: 3 },
  { name: "Per", number: 4 },
  { name: "Cum", number: 5 },
  { name: "Cmt", number: 6 },
  { name: "Paz", number: 0 },
];

export default function ShiftCalendar({ resources }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#263b58] bg-[#101d30]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#263b58] p-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <CalendarRange size={20} className="text-cyan-400" />
            Haftalık Vardiya Planı
          </h2>
          <p className="mt-2 text-xs text-[#829ab9]">
            Kaynakların çalışma ve haftalık izin günleri
          </p>
        </div>
        <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-cyan-400">
          7 Günlük Plan
        </span>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[180px_repeat(7,minmax(0,1fr))] gap-2">
            <div className="rounded-lg bg-[#182d48] p-3 text-xs font-semibold text-[#9db4d2]">
              Kaynak
            </div>

            {days.map((day) => (
              <div
                key={day.number}
                className="rounded-lg bg-[#182d48] p-3 text-center text-xs font-semibold text-[#9db4d2]"
              >
                {day.name}
              </div>
            ))}

            {resources.map((resource) => (
              <div key={resource.name} className="contents">
                <div className="flex items-center rounded-lg bg-[#14243a] p-3">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {resource.name}
                    </p>
                    <p className="mt-1 text-[10px] text-[#839bb9]">
                      {resource.role}
                    </p>
                  </div>
                </div>

                {days.map((day) => {
                  const inactive = !resource.active;
                  const off = resource.dayOff === day.number;
                  const unavailable = inactive || off;

                  return (
                    <div
                      key={`${resource.name}-${day.number}`}
                      className={`flex min-h-18 flex-col items-center justify-center rounded-lg border p-2 text-center ${
                        inactive
                          ? "border-slate-700 bg-slate-800/50"
                          : off
                          ? "border-rose-500/20 bg-rose-500/10"
                          : "border-emerald-500/20 bg-emerald-500/10"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-bold ${
                          inactive
                            ? "text-slate-400"
                            : off
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {inactive
                          ? "Pasif"
                          : off
                          ? "İzinli"
                          : `${resource.startTime}–${resource.endTime}`}
                      </span>

                      {!unavailable && (
                        <Clock3 size={12} className="mt-2 text-emerald-400/60" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 border-t border-[#263b58] px-5 py-4 text-xs text-[#91a8c6]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Mesai
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          İzinli
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          Pasif
        </span>
      </div>
    </section>
  );
}

