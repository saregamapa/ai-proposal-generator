'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
interface Props { data: { month: string; count: number }[]; loading?: boolean; }
export function ActivityChart({ data, loading }: Props) {
  if (loading) return <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />;
  if (!data.length) return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>;
  const formatted = data.map(d => ({ ...d, month: new Date(d.month+'-01').toLocaleDateString('en-US', { month: 'short' }) }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={formatted} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
        <Bar dataKey="count" name="Proposals" fill="#6366f1" radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
