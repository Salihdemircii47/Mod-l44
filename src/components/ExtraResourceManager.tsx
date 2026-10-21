
import { useState } from "react";
import type { FormEvent } from "react";
import {
  Boxes,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import type { SectorId } from "../data/sectors";
import {
  loadExtraResources,
  saveExtraResources,
  type ExtraResource,
  type ExtraResourceType,
} from "../data/extraResources";

type Props = {
  sectorId: SectorId;
};

const types: {
  value: ExtraResourceType;
  label: string;
}[] = [
  { value: "room", label: "Oda" },
  { value: "equipment", label: "Ekipman" },
  { value: "operator", label: "Operatör" },
  { value: "vehicle", label: "Araç / İş Makinesi" },
  { value: "area", label: "Çalışma Alanı" },
];

const inputClass =
  "w-full rounded-xl border border-[#294361] bg-[#0b1728] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400";

export default function ExtraResourceManager({
  sectorId,
}: Props) {
  const [resources, setResources] =
    useState<ExtraResource[]>(loadExtraResources);

  const [name, setName] = useState("");
  const [type, setType] =
    useState<ExtraResourceType>("equipment");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const items = resources.filter(
    (item) => item.sectorId === sectorId
  );

  function persist(next: ExtraResource[]) {
    if (!saveExtraResources(next)) {
      setError("Kaynaklar kaydedilemedi.");
      return false;
    }

    setResources(next);
    setError("");
    return true;
  }

  function addResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Kaynak adı giriniz.");
      return;
    }

    if (
      items.some(
        (item) =>
          item.name.toLocaleLowerCase("tr-TR") ===
          trimmedName.toLocaleLowerCase("tr-TR")
      )
    ) {
      setError("Bu isimde bir kaynak zaten var.");
      return;
    }

    const next = [
      ...resources,
      {
        id: crypto.randomUUID(),
        sectorId,
        name: trimmedName,
        type,
        active: true,
      },
    ];

    if (persist(next)) {
      setName("");
      setMessage("Yeni kaynak oluşturuldu.");
    }
  }

  function toggleResource(id: string) {
    const next = resources.map((item) =>
      item.id === id
        ? { ...item, active: !item.active }
        : item
    );

    if (persist(next)) {
      setMessage("Kaynak durumu güncellendi.");
    }
  }

  function deleteResource(id: string) {
    if (
      !window.confirm(
        "Kaynağı silmek istediğine emin misin?"
      )
    ) {
      return;
    }

    const next = resources.filter(
      (item) => item.id !== id
    );

    if (persist(next)) {
      setMessage("Kaynak silindi.");
    }
  }

  return (
    <section className="space-y-5 rounded-2xl border border-[#263b58] bg-[#101d30] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
          <Boxes size={22} />
        </div>

        <div>
          <h2 className="font-bold text-white">
            Ek Kaynaklar ve Ekipmanlar
          </h2>
          <p className="mt-1 text-xs text-[#839bb9]">
            Oda, operatör, ekipman ve çalışma alanlarını yönetin.
          </p>
        </div>
      </div>

      <form
        onSubmit={addResource}
        className="grid gap-3 md:grid-cols-[1fr_180px_auto]"
      >
        <input
          className={inputClass}
          placeholder="Yeni kaynak adı"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={100}
          required
        />

        <select
          className={inputClass}
          value={type}
          onChange={(event) =>
            setType(event.target.value as ExtraResourceType)
          }
        >
          {types.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Plus size={17} /> Ekle
        </button>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#29415c] bg-[#0b192c] p-4"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                {item.name}
              </p>
              <p className="mt-1 text-xs text-[#89a4c4]">
                {types.find(
                  (typeItem) => typeItem.value === item.type
                )?.label}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-[#a2b9d6]">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => toggleResource(item.id)}
                  className="h-4 w-4 accent-cyan-400"
                />
                {item.active ? "Aktif" : "Pasif"}
              </label>

              <button
                type="button"
                onClick={() => deleteResource(item.id)}
                aria-label={`${item.name} kaynağını sil`}
                className="text-rose-400 hover:text-rose-300"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 text-xs text-rose-400"
        >
          <AlertTriangle size={16} />
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-emerald-400"
        >
          <CheckCircle2 size={16} />
          {message}
        </p>
      )}
    </section>
  );
}
