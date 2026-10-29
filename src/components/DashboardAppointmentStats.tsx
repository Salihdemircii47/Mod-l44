
import {
  CalendarCheck2,
  CalendarDays,
  Users,
  XCircle,
} from "lucide-react";

import type { SectorId } from "../data/sectors";

import { useDashboardStats } from "../features/appointments/hooks/useDashboardStats";

type Props = {
  sectorId: SectorId;
};

export default function DashboardAppointmentStats({
  sectorId,
}: Props) {
  const stats = useDashboardStats(sectorId);

  const cards = [
    {
      label: "Bugünkü Randevular",
      value: stats.todayCount,
      icon: CalendarDays,
    },
    {
      label: "Aktif Randevular",
      value: stats.activeCount,
      icon: CalendarCheck2,
    },
    {
      label: "Bugün Görevli Kaynaklar",
      value: stats.busyResourceCount,
      icon: Users,
    },
    {
      label: "İptal Edilen Randevular",
      value: stats.cancelledCount,
      icon: XCircle,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">
          Canlı Randevu Özeti
        </h2>
        <p className="mt-1 text-xs text-[#8299b7]">
          Tarayıcıda kayıtlı gerçek demo
          randevularından hesaplanır.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-[#263b58] bg-[#101d30] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#91a9c9]">
                  {card.label}
                </p>

                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                  <Icon size={19} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#263b58] bg-[#101d30] p-5">
        <h3 className="font-semibold text-white">
          Bugünkü Randevular
        </h3>

        {stats.todayAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-[#8299b7]">
            Bugün için aktif randevu bulunmuyor.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {stats.todayAppointments
              .slice()
              .sort((a, b) =>
                a.time.localeCompare(b.time)
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#29415d] bg-[#0b1728] p-4"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {item.customer}
                    </p>

                    <p className="mt-1 text-xs text-[#91a9c9]">
                      {item.service} · {item.resource}
                    </p>
                  </div>

                  <span className="rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300">
                    {item.time}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
