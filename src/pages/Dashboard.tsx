
import {
  CalendarDays, Users, CheckCircle2, Activity,
  Plus, Scissors, Truck, HardHat, ArrowUpRight,
  ArrowRight, Clock3, Zap, TrendingUp
} from "lucide-react";
import { sectors } from "../data/sectors";
import type { SectorId } from "../data/sectors";

type DashboardProps = {
  sectorId: SectorId;
  onSectorChange: (id: SectorId) => void;
  onNewAppointment: () => void;
};

const sectorIcons = {
  beauty: Scissors,
  fleet: Truck,
  construction: HardHat,
};

const statIcons = [CalendarDays, Users, CheckCircle2, Activity];

const week = [
  { day: "Pzt", value: 52 },
  { day: "Sal", value: 74 },
  { day: "Çar", value: 61 },
  { day: "Per", value: 89 },
  { day: "Cum", value: 70 },
  { day: "Cmt", value: 98 },
  { day: "Paz", value: 47 },
];

const statusColors: Record<string, string> = {
  "Onaylandı": "bg-emerald-400/10 text-emerald-400",
  "Devam Ediyor": "bg-blue-400/10 text-blue-400",
  "Bekliyor": "bg-amber-400/10 text-amber-400",
};

const panel = "rounded-2xl border border-[#20324c] bg-[#101d30]";

export default function Dashboard({
  sectorId, onSectorChange, onNewAppointment
}: DashboardProps) {
  const sector = sectors.find(s => s.id === sectorId)!;

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* Başlık */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[2px] text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            SMART OPERATIONS CENTER
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Genel Bakış <span className="text-blue-400">.</span>
          </h1>
          <p className="mt-2 text-sm text-[#7990ae]">
            Tüm operasyonlarınız tek ekranda, kontrol sizde.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewAppointment}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110"
        >
          <Plus size={18} /> Yeni Randevu
        </button>
      </div>

      {/* Sektör seçimi */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Çalışma Alanları</h2>
          <span className="text-[11px] text-[#6e86a7]">3 farklı sektör</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {sectors.map(item => {
            const Icon = sectorIcons[item.id];
            const active = sectorId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectorChange(item.id)}
                className={`group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 ${
                  active
                    ? "border-blue-500 bg-gradient-to-br from-[#15345b] to-[#13243e] shadow-lg shadow-blue-600/10"
                    : "border-[#20324c] bg-[#101d30] hover:border-[#3f628f]"
                }`}
              >
                <div className={`rounded-xl p-3 ${
                  active ? "bg-blue-500 text-white" : "bg-[#1a3454] text-cyan-400"
                }`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white">{item.name}</p>
                  <p className="mt-1 text-[10px] text-[#8b9fbc]">
                    {active ? "● Aktif çalışma alanı" : "Çalışma alanına geç"}
                  </p>
                </div>
                <ArrowUpRight size={17} className="text-[#6382ab]" />
              </button>
            );
          })}
        </div>
      </section>

      {/* İstatistik kartları */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sector.stats.map((stat, i) => {
          const Icon = statIcons[i];
          const colors = [
            "from-blue-500 to-cyan-400",
            "from-violet-600 to-fuchsia-400",
            "from-emerald-600 to-teal-400",
            "from-pink-600 to-rose-400",
          ];

          return (
            <div
              key={stat.label}
              className={`${panel} relative overflow-hidden p-5 transition hover:-translate-y-1 hover:border-[#42658e]`}
            >
              <div className={`absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r ${colors[i]}`} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#92a6c4]">{stat.label}</span>
                <div className={`rounded-xl bg-gradient-to-br ${colors[i]} p-2.5 text-white`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
              <p className="mt-2 text-[11px] text-[#6682a5]">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      {/* Grafik alanı */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className={`${panel} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Operasyon Analizi</h2>
              <p className="mt-1 text-xs text-[#7087a6]">Örnek haftalık iş yoğunluğu</p>
            </div>
            <span className="rounded-lg border border-[#2a4262] bg-[#172a44] px-3 py-2 text-[11px] text-cyan-300">
              Bu Hafta
            </span>
          </div>

          <div className="mt-7 flex items-end justify-between gap-3 border-b border-[#29405d] pb-3">
            {week.map((item, i) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-44 w-full max-w-14 items-end justify-center">
                  <div
                    className={`w-full max-w-9 rounded-t-lg transition-all duration-500 ${
                      i === 5
                        ? "bg-gradient-to-t from-violet-700 to-fuchsia-400 shadow-[0_0_22px_#8b5cf644]"
                        : "bg-gradient-to-t from-blue-700 to-cyan-400"
                    }`}
                    style={{ height: `${item.value}%` }}
                    title={`${item.day}: ${item.value} örnek yoğunluk puanı`}
                  />
                </div>
                <span className="text-[10px] text-[#758da9]">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#8ca5c6]">
            <TrendingUp size={15} className="text-emerald-400" />
            Gösterim amaçlı yoğunluk verisi
          </div>
        </div>

        <div className={`${panel} p-6`}>
          <h2 className="text-sm font-bold text-white">Kapasite Dağılımı</h2>
          <p className="mt-1 text-xs text-[#7087a6]">Örnek kaynak kullanımı</p>

          <div className="flex justify-center py-7">
            <div
              className="relative h-44 w-44 rounded-full"
              style={{
                background: "conic-gradient(#00bcf2 0% 58%, #9061f9 58% 78%, #263b58 78% 100%)"
              }}
            >
              <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-[#101d30]">
                <span className="text-[10px] text-[#8ca4c4]">Kullanım</span>
                <strong className="mt-1 text-3xl text-white">78%</strong>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {[
              ["Aktif", "58%", "#00bcf2"],
              ["Planlı", "20%", "#9061f9"],
              ["Müsait", "22%", "#263b58"],
            ].map(([name, value, color]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                <span className="flex-1 text-[#94a8c6]">{name}</span>
                <strong className="text-white">{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tablo ve aktivite */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className={`${panel} min-w-0 p-6`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Yaklaşan Randevular</h2>
              <p className="mt-1 text-xs text-[#7087a6]">Planlanan iş ve kaynaklar</p>
            </div>
            <CalendarDays size={19} className="text-cyan-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-xs">
              <thead>
                <tr className="border-b border-[#263a55] text-[#6e88a9]">
                  {["Müşteri / İş", "Hizmet", "Kaynak", "Saat", "Durum"].map(h => (
                    <th key={h} className="pb-4 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sector.appointments.map(a => (
                  <tr key={a.id} className="border-b border-[#1b2e45]">
                    <td className="py-5 pr-3 font-semibold text-white">{a.customer}</td>
                    <td className="py-5 pr-3 text-[#90a5c2]">{a.service}</td>
                    <td className="py-5 pr-3 text-[#90a5c2]">{a.resource}</td>
                    <td className="py-5 pr-3 text-white">{a.time}</td>
                    <td className="py-5">
                      <span className={`whitespace-nowrap rounded-lg px-2 py-1.5 text-[10px] font-semibold ${statusColors[a.status] || ""}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={onNewAppointment}
            className="mt-5 flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-white"
          >
            Randevu takvimine git <ArrowRight size={15} />
          </button>
        </div>

        <div className={`${panel} p-6`}>
          <h2 className="text-sm font-bold text-white">Sistem Durumu</h2>
          <p className="mt-1 text-xs text-[#7087a6]">Geliştirme aşamaları</p>

          {[
            { icon: CheckCircle2, title: "Frontend hazır", desc: "React arayüzü çalışıyor", color: "text-emerald-400" },
            { icon: Zap, title: "Planlama arayüzü", desc: "Takvim geliştirilecek", color: "text-cyan-400" },
            { icon: Clock3, title: ".NET API", desc: "Backend sonraki aşamada", color: "text-amber-400" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="mt-6 flex items-center gap-3">
                <div className="rounded-xl bg-[#1a304d] p-3">
                  <Icon size={20} className={item.color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-[11px] text-[#7890b1]">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <p className="pb-4 text-center text-[10px] text-[#536b8c]">
        MOD44 SMART OPERATIONS · DEMO PROTOTİPİ · VERİLER ÖRNEKTİR
      </p>
    </div>
  );
}
