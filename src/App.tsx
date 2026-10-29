

import { useState } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import { sectors } from "./data/sectors";
import type { SectorId } from "./data/sectors";
import ResourcesPage from "./pages/ResourcesPage";
import ServicesPage from "./pages/ServicesPage";

export default function App() {
  const [sectorId, setSectorId] = useState<SectorId>("beauty");
  const [activePage, setActivePage] = useState("Genel Bakış");

  const selectedSector = sectors.find(
    (sector) => sector.id === sectorId
  )!;

  function handleNewAppointment() {
    setActivePage("Randevu Takvimi");
  }

  return (
    <div className="min-h-screen bg-[#091322] text-white lg:flex">
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        workspaceName={selectedSector.shortName}
      />

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1b2d46] bg-[#0d192a] px-5 py-5 lg:px-9">
          <div className="flex items-center gap-2 text-xs text-[#6580a4]">
            <span>MOD44</span>
            <span>/</span>
            <span className="font-semibold text-white">{activePage}</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-2 rounded-xl border border-[#243754] bg-[#111f34] px-4 py-2.5 text-[#718baa] md:flex">
              <Search size={16} />
              <span className="text-xs">Arama yakında</span>
            </div>

            <span title="Bildirimler sonraki aşamada">
              <Bell size={19} className="text-[#92a8c5]" />
            </span>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold">
                AD
              </div>
              <ChevronDown size={14} className="text-[#7088a8]" />
            </div>
          </div>
        </header>

        <main className="px-5 py-8 lg:px-9">
          
          {activePage === "Genel Bakış" ? (
            <Dashboard
              sectorId={sectorId}
              onSectorChange={setSectorId}
              onNewAppointment={handleNewAppointment}
            />
          ) : activePage === "Randevu Takvimi" ? (
            <CalendarPage sectorId={sectorId} />
          ) : activePage === "Personel ve Ekipler" ? (
            <ResourcesPage sectorId={sectorId} />
          ) : activePage === "Araç ve Ekipmanlar" ? (
            <ResourcesPage sectorId={sectorId} />
          ) : activePage === "Şube ve Hizmetler" ? (
            <ServicesPage sectorId={sectorId} />
          ) : (
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#20324c] bg-[#101d30] p-9">
              <div className="text-xs font-bold tracking-widest text-cyan-400">
                MOD44 SMART OPERATIONS
              </div>
              <h2 className="mt-4 text-3xl font-bold text-white">
                {activePage}
              </h2>
              <p className="mt-3 text-sm text-[#8198b8]">
                Bu ekranı sonraki geliştirme adımlarında
                birlikte oluşturacağız.
              </p>

              <button
                type="button"
                onClick={() => setActivePage("Genel Bakış")}
                className="mt-7 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-500"
              >
                Genel Bakışa Dön
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
