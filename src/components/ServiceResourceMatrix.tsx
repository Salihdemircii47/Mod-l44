
import { useState } from "react";
import { Link2, Save, CheckCircle2 } from "lucide-react";

import type { SectorId } from "../data/sectors";
import { resourceDefaults } from "../pages/ResourcesPage";
import {
  getAllowedResources,
  saveAllowedResources,
} from "../utils/serviceResources";

type Service = {
  id: string;
  name: string;
  active: boolean;
};

type Props = {
  sectorId: SectorId;
  services: Service[];
};

export default function ServiceResourceMatrix({
  sectorId,
  services,
}: Props) {
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");

  const resources = resourceDefaults[sectorId].map(
    (item) => item.name
  );

  function toggle(
    serviceId: string,
    resourceName: string
  ) {
    const current = getAllowedResources(
      sectorId,
      serviceId,
      resources
    );

    const next = current.includes(resourceName)
      ? current.filter((name) => name !== resourceName)
      : [...current, resourceName];

    if (saveAllowedResources(sectorId, serviceId, next)) {
      setRevision((old) => old + 1);
      setMessage("Eşleştirme kaydedildi.");
    } else {
      setMessage("Eşleştirme kaydedilemedi.");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#263b58] bg-[#101d30]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#263b58] p-5">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Link2 size={19} className="text-cyan-400" />
            Hizmet ve Kaynak Eşleştirmesi
          </h2>
          <p className="mt-2 text-xs text-[#829ab9]">
            Her hizmeti gerçekleştirebilecek kaynakları seçin.
          </p>
        </div>

        <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-cyan-300">
          {services.length} hizmet
        </span>
      </div>

      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs text-[#8ba4c2]">
                Hizmet
              </th>
              {resources.map((resource) => (
                <th
                  key={resource}
                  className="px-3 py-3 text-center text-xs text-[#9cb6d5]"
                >
                  {resource}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {services.map((service) => {
              const allowed = getAllowedResources(
                sectorId,
                service.id,
                resources
              );

              return (
                <tr key={service.id} className="bg-[#142741]">
                  <td className="rounded-l-xl px-4 py-4">
                    <p className="font-semibold text-white">
                      {service.name}
                    </p>
                    <p className="mt-1 text-[11px] text-[#829ab9]">
                      {service.active ? "Aktif" : "Pasif"}
                    </p>
                  </td>

                  {resources.map((resource) => (
                    <td
                      key={resource}
                      className="px-3 py-4 text-center"
                    >
                      <input
                        type="checkbox"
                        aria-label={`${service.name} - ${resource}`}
                        checked={allowed.includes(resource)}
                        onChange={() =>
                          toggle(service.id, resource)
                        }
                        className="h-4 w-4 cursor-pointer accent-cyan-400"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {message && (
        <div
          role="status"
          className="mx-5 mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300"
        >
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[#263b58] px-5 py-4 text-xs text-[#829ab9]">
        <Save size={15} className="text-cyan-400" />
        Seçimler otomatik kaydedilir.
        <span className="hidden">{revision}</span>
      </div>
    </section>
  );
}
