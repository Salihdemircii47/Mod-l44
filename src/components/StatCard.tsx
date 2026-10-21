
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>

      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </div>
  );
}
