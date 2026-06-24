import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-slate-800 bg-slate-900/80 p-5', className)}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
