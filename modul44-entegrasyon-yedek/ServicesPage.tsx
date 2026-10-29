
import type { SectorId } from "../data/sectors";
import BackendServicesPanel from "../components/BackendServicesPanel";

// Eski importları kullanan bileşenler için koruyoruz.
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
          MOD44 / HİZMET YÖNETİMİ
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Hizmetler
        </h1>

        <p className="mt-2 text-sm text-[#8299b7]">
          Hizmetleri oluştur, düzenle ve yönet.
          Değişiklikler ASP.NET Core API üzerinden
          PostgreSQL veritabanına kaydedilir.
        </p>
      </header>

      <BackendServicesPanel sectorId={sectorId} />
    </div>
  );
}
