
import type { SectorId } from "../data/sectors";

import BackendWeekCalendar from "../components/BackendWeekCalendar";
import BackendAppointmentCreatePanel from "../components/BackendAppointmentCreatePanel";
import BackendAppointmentManagement from "../components/BackendAppointmentManagement";

type Props = {
  sectorId: SectorId;
};

const sectorLabels: Record<SectorId, string> = {
  beauty: "Kuaför & Güzellik",
  fleet: "Vidanjör / Kombine / Kuka",
  construction: "Altyapı İnşaat",
};

export default function CalendarPage({
  sectorId,
}: Props) {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* SAYFA BAŞLIĞI */}
      <header className="rounded-2xl border border-[#203653] bg-[#101d30] p-6">

        <p className="text-[11px] font-bold tracking-[2px] text-cyan-400">
          MOD44 / PLANLAMA MERKEZİ
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Randevu Takvimi
        </h1>

        <p className="mt-2 text-sm text-[#8299b7]">
          {sectorLabels[sectorId]}
        </p>

        <p className="mt-2 text-xs text-emerald-400">
          ASP.NET Core API / PostgreSQL
        </p>

      </header>

      {/* GERÇEK RANDEVU OLUŞTURMA */}
      <BackendAppointmentCreatePanel
        sectorId={sectorId}
      />

      {/* GERÇEK POSTGRESQL TAKVİMİ */}
      <BackendWeekCalendar
        sectorId={sectorId}
      />

      {/* GERÇEK İPTAL VE ERTELEME */}
      <BackendAppointmentManagement
        sectorId={sectorId}
      />

    </div>
  );
}
