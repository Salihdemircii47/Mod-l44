
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, RefreshCw, Trash2, Users } from "lucide-react";

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  type CustomerDto,
} from "../api/customersApi";

function getError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "İşlem başarısız.";
}

export default function BackendCustomersPanel() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setCustomers(await getCustomers());
      setError("");
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    if (!name.trim() || !phone.trim()) {
      setError("Ad soyad ve telefon zorunludur.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await createCustomer({
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        address: address.trim() || null,
      });

      setName("");
      setPhone("");
      setEmail("");
      setAddress("");

      await refresh();

      window.dispatchEvent(
        new Event("mod44:customers-updated")
      );

      setMessage("Müşteri PostgreSQL'e kaydedildi.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(customer: CustomerDto) {
    if (
      busy ||
      !window.confirm(`${customer.fullName} silinsin mi?`)
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await deleteCustomer(customer.id);

      await refresh();

      window.dispatchEvent(
        new Event("mod44:customers-updated")
      );

      setMessage("Müşteri silindi.");
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-[#304963] " +
    "bg-[#0b1728] p-3 text-sm text-white " +
    "outline-none focus:border-cyan-400";

  return (
    <section className="space-y-5 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Users size={20} />
            Müşteri Yönetimi
          </h2>

          <p className="mt-1 text-sm text-[#8ca5c6]">
            Gerçek müşteri kayıtları · ASP.NET Core / PostgreSQL
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || busy}
          className="flex items-center gap-2 rounded-lg border border-[#304963] px-3 py-2 text-sm text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw size={15} />
          Yenile
        </button>
      </div>

      <form
        onSubmit={(e) => void submit(e)}
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
      >
        <input
          aria-label="Ad soyad"
          className={field}
          placeholder="Ad soyad *"
          required
          value={name}
          maxLength={150}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          aria-label="Telefon"
          className={field}
          placeholder="Telefon *"
          required
          value={phone}
          maxLength={30}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          aria-label="E-posta"
          className={field}
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          aria-label="Adres"
          className={field}
          placeholder="Adres (isteğe bağlı)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading || busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 text-sm font-semibold disabled:opacity-50"
        >
          <Plus size={16} />
          {busy ? "Kaydediliyor" : "Müşteri Ekle"}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-rose-400">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-sm text-emerald-400">
          {message}
        </p>
      )}

      <p className="text-sm text-emerald-400">
        Toplam müşteri: {customers.length}
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">
          Yükleniyor...
        </p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-slate-400">
          Henüz müşteri yok.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[#29415d] bg-[#0b1728] p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  #{customer.id} — {customer.fullName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {customer.phone || "Telefon belirtilmedi"}
                </p>

                {customer.email && (
                  <p className="mt-1 break-all text-xs text-slate-400">
                    {customer.email}
                  </p>
                )}

                {customer.address && (
                  <p className="mt-1 text-xs text-slate-400">
                    {customer.address}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(customer)}
                title="Müşteriyi sil"
                className="rounded-lg border border-rose-500/30 p-2 text-rose-400 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
