
import {
  Activity, LayoutDashboard, CalendarDays, Users,
  Truck, Building2, Settings, ShieldCheck,
  ChevronRight, Sparkles
} from "lucide-react";

type SidebarProps = {
  activePage: string;
  onPageChange: (page: string) => void;
  workspaceName: string;
};

const menu = [
  { label: "Genel Bakış", icon: LayoutDashboard },
  { label: "Randevu Takvimi", icon: CalendarDays },
  { label: "Personel ve Ekipler", icon: Users },
  { label: "Araç ve Ekipmanlar", icon: Truck },
  { label: "Şube ve Hizmetler", icon: Building2 },
  { label: "Ayarlar", icon: Settings },
];

export default function Sidebar({
  activePage, onPageChange, workspaceName
}: SidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-[#1b2e4b] bg-[#080f1f] text-white lg:sticky lg:top-0 lg:h-screen lg:w-[250px]">
      <div className="flex items-center gap-3 border-b border-white/5 px-6 py-7">
        <div className="rounded-xl bg-gradient-to-br from-cyan-400 to-blue-700 p-3 shadow-lg shadow-blue-500/20">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-wider">MOD44</h1>
          <p className="text-[10px] tracking-wider text-[#7a95ba]">
            SMART OPERATIONS
          </p>
        </div>
      </div>

      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-[#516888]">
          WORKSPACE
        </p>
        <div className="flex items-center gap-3 rounded-xl border border-[#28466c] bg-[#111f35] p-3">
          <div className="rounded-lg bg-blue-500/15 p-2 text-cyan-400">
            <Building2 size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">{workspaceName}</p>
            <p className="mt-1 text-[10px] text-[#7e96b8]">
              Aktif çalışma alanı
            </p>
          </div>
          <ChevronRight size={14} className="text-[#6684aa]" />
        </div>
      </div>

      <div className="px-4 pt-8">
        <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-[#516888]">
          YÖNETİM PANELİ
        </p>

        <nav className="flex gap-1 overflow-x-auto pb-3 lg:flex-col">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onPageChange(item.label)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3.5 text-left text-xs font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20"
                    : "text-[#8399b7] hover:bg-[#152943] hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto hidden px-4 pb-5 pt-5 lg:block">
        <div className="relative overflow-hidden rounded-2xl border border-[#24436a] bg-gradient-to-br from-[#152e52] to-[#0c1b30] p-4">
          <Sparkles size={23} className="mb-3 text-cyan-400" />
          <p className="text-sm font-bold">Smart Planning</p>
          <p className="mt-2 text-[11px] leading-5 text-[#8eabd0]">
            Akıllı kaynak planlaması ve operasyon kontrolü.
          </p>
          <span className="mt-3 inline-flex items-center gap-2 text-[10px] text-emerald-400">
            <ShieldCheck size={13} /> Demo modu aktif
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold">
            AD
          </div>
          <div>
            <p className="text-xs font-semibold">Admin Demo</p>
            <p className="mt-1 text-[10px] text-[#7a95ba]">
              Sistem yöneticisi
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
