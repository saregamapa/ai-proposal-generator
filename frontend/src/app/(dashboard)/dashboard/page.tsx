'use client';
import { useQuery } from '@tanstack/react-query';
import { FileText, Eye, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProposalCard } from '@/components/proposals/ProposalCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => api.get('/analytics/dashboard').then(r => r.data.data) });
  const stats = [
    { label: 'Total Proposals', value: data?.totalProposals || 0, icon: FileText, color: 'indigo', change: '+12%' },
    { label: 'Total Views', value: data?.totalViews || 0, icon: Eye, color: 'blue', change: '+8%' },
    { label: 'Revenue Won', value: formatCurrency(data?.approvedAmount || 0), icon: DollarSign, color: 'green', change: '+24%' },
    { label: 'Approval Rate', value: data?.statusBreakdown ? `${Math.round(((data.statusBreakdown.APPROVED||0)/(data.totalProposals||1))*100)}%` : '0%', icon: TrendingUp, color: 'purple', change: '+5%' },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your proposals.</p>
        </div>
        <Link href="/proposals/new" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> New Proposal
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => <StatsCard key={stat.label} {...stat} loading={isLoading} />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold">Proposal Activity</h2><span className="text-sm text-gray-500">Last 6 months</span></div>
          <ActivityChart data={data?.monthlyProposals || []} loading={isLoading} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Proposal Status</h2>
          <div className="space-y-3">
            {Object.entries(data?.statusBreakdown || {}).map(([status, count]) => {
              const colors: Record<string,string> = { DRAFT:'bg-gray-100 text-gray-600', SENT:'bg-blue-100 text-blue-700', VIEWED:'bg-yellow-100 text-yellow-700', APPROVED:'bg-green-100 text-green-700', REJECTED:'bg-red-100 text-red-700' };
              return (<div key={status} className="flex items-center justify-between"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[status]||'bg-gray-100 text-gray-600'}`}>{status}</span><span className="font-semibold">{count as number}</span></div>);
            })}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Proposals</h2>
          <Link href="/proposals" className="flex items-center gap-1 text-sm text-indigo-600 font-medium">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {data?.recentProposals?.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No proposals yet</p></div>
        ) : (
          <div className="space-y-3">{data?.recentProposals?.map((p: any) => <ProposalCard key={p.id} proposal={p} compact />)}</div>
        )}
      </div>
    </div>
  );
}
