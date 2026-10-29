import { useEffect, useState } from "react";

import {
  getBackendAppointments,
  type BackendAppointment,
} from "../api/backendAppointmentsApi";

export default function BackendAppointmentsPanel() {
  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const data = await getBackendAppointments();
      setAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Randevular alınamadı."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;

    getBackendAppointments()
      .then((data) => {
        if (alive) setAppointments(data);
      })
      .catch((err: unknown) => {
        if (alive) {
          setError(
            err instanceof Error
              ? err.message
              : "Bağlantı hatası."
          );
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="space-y-4 rounded-2xl border border-cyan-500/30 bg-[#101d30] p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">
            Gerçek Randevu Kayıtları
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            ASP.NET Core / PostgreSQL
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => void refresh()}
          className="rounded-xl border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 disabled:opacity-50"
        >
          Listeyi Yenile
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">
          Randevular yükleniyor...
        </p>
      ) : (
        <>
          <p className="text-sm text-emerald-400">
            PostgreSQL randevu sayısı: {appointments.length}
          </p>

          {appointments.length === 0 ? (
            <p className="text-sm text-slate-400">
              Henüz gerçek randevu bulunmuyor.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {appointments.map((item, index) => (
                <div
                  key={String(item.id ?? index)}
                  className="rounded-xl border border-[#263b58] bg-[#091322] p-4"
                >
                  <p className="font-semibold">
                    Randevu #{String(item.id ?? index + 1)}
                  </p>

                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}