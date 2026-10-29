
import type { SectorId } from "../data/sectors";

import BackendResourcesPanel from "../components/BackendResourcesPanel";
import ResourceSchedulePanel from "../components/ResourceSchedulePanel";

// Eski bileşenlerin import uyumluluğu korunuyor.
export {
  resourceDefaults,
  RESOURCE_STORAGE_KEY,
  loadResourceSettings,
} from "../features/resources/resourceStorage";

export type { ResourceSetting } from "../types/resource";

type Props = {
  sectorId: SectorId;
};

export default function ResourcesPage({ sectorId }: Props) {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <header className="rounded-2xl border border-[#203653] bg-[#101d30] p-6">
        <p className="text-xs font-bold tracking-widest text-cyan-400">
          MOD44 / KAYNAK YÖNETİMİ
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Personel, Araç ve Ekipmanlar
        </h1>

        <p className="mt-2 text-sm text-[#8299b7]">
          Personel, araç ve ekipmanları PostgreSQL
          üzerinde yönet. Çalışma saatlerini ve
          kullanılamaz zamanları planla.
        </p>
      </header>

      {/* Gerçek kaynak CRUD işlemleri */}
      <BackendResourcesPanel sectorId={sectorId} />

      {/* Gerçek çalışma saatleri ve izinler */}
      <ResourceSchedulePanel sectorId={sectorId} />
    </div>
  );
}
