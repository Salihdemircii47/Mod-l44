import { useEffect, useState } from "react";

import {
  getCustomers,
  createCustomer,
  type CustomerDto,
} from "../api/customersApi";

export default function CustomerConnectionTest() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const result = await getCustomers();
      setCustomers(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Backend bağlantı hatası"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!fullName.trim() || saving) return;

    setSaving(true);
    setError("");

    try {
      await createCustomer({
        fullName: fullName.trim(),
        phone: "",
        email: null,
        address: null,
      });

      setFullName("");
      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Müşteri kaydedilemedi"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-[#101f34] p-6 text-white">
      <div className="mb-5">
        <h2 className="text-xl font-bold">
          PostgreSQL Bağlantı Testi
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Gerçek müşteri kayıtları
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="mb-5 flex flex-wrap gap-3"
      >
        <input
          type="text"
          value={fullName}
          maxLength={150}
          onChange={(event) =>
            setFullName(event.target.value)
          }
          placeholder="Yeni müşteri adı soyadı"
          className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-[#091322] px-4 py-3 text-white"
          required
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Müşteri Ekle"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-400">
          Veriler yükleniyor...
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-emerald-400">
            Toplam müşteri: {customers.length}
          </p>

          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border border-slate-700 bg-[#091322] p-4"
            >
              <p className="font-semibold">
                {customer.fullName}
              </p>
              <p className="text-xs text-slate-400">
                Müşteri ID: {customer.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}