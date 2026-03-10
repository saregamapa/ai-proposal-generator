import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Props { label: string; value: string|number; icon: LucideIcon; color: string; change?: string; loading?: boolean; }
const COLOR_MAP: Record<string,{bg:string;icon:string}> = { indigo:{bg:'bg-indigo-50',icon:'text-indigo-600'}, blue:{bg:'bg-blue-50',icon:'text-blue-600'}, green:{bg:'bg-green-50',icon:'text-green-600'}, purple:{bg:'bg-purple-50',icon:'text-purple-600'} };
export function StatsCard({ label, value, icon: Icon, color, change, loading }: Props) {
  const colors = COLOR_MAP[color]||COLOR_MAP.indigo;
  if (loading) return <div className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse" />;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}><Icon className={cn('w-5 h-5', colors.icon)} /></div>
        {change && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{change}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
