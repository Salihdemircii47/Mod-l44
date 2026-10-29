
import type { SectorId } from "../data/sectors";

import BackendServicesPanel from "../components/BackendServicesPanel";
import BackendCustomersPanel from "../components/BackendCustomersPanel";

// Önceki dosyalardan kullanılan türleri koruyoruz.
export { loadServices } from "../features/services/serviceStorage";
export type { ServiceItem } from "../types/service";

type Props = {
  sectorId: SectorId;
};

export default function ServicesPage({ sectorId }: Props) {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="rounded-2xl border border-[#203653] bg-[#101d30] p-6">
        <p className="text-xs font-bold tracking-widest text-cyan-400">
          MOD44 / HİZMET VE MÜŞTERİ YÖNETİMİ
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Hizmetler ve Müşteriler
        </h1>

        <p className="mt-2 text-sm text-[#8299b7]">
          Bu ekrandaki kayıtlar ASP.NET Core API üzerinden
          PostgreSQL veritabanına kaydedilir.
        </p>
      </header>

      <BackendServicesPanel sectorId={sectorId} />

      <BackendCustomersPanel />
    </div>
  );
}
