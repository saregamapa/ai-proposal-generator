'use client';
import Link from 'next/link';
import { Eye, MoreHorizontal, Edit, Copy, Trash2, ExternalLink } from 'lucide-react';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
interface Props { proposal: any; compact?: boolean; }
export function ProposalCard({ proposal, compact = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({ mutationFn: () => api.delete(`/proposals/${proposal.id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proposals'] }); queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }); toast({ title: 'Proposal deleted' }); } });
  const duplicateMutation = useMutation({ mutationFn: () => api.post(`/proposals/${proposal.id}/duplicate`), onSuccess: (res) => { queryClient.invalidateQueries({ queryKey: ['proposals'] }); toast({ title: 'Proposal duplicated!' }); window.location.href=`/proposals/${res.data.data.id}/edit`; } });
  if (compact) return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 text-sm truncate">{proposal.title}</p><p className="text-xs text-gray-400">{proposal.client?.companyName} · {formatDate(proposal.updatedAt)}</p></div>
      <div className="flex items-center gap-3"><ProposalStatusBadge status={proposal.status} /><span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {proposal._count?.views||0}</span><Link href={`/proposals/${proposal.id}/edit`} className="opacity-0 group-hover:opacity-100 p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4" /></Link></div>
    </div>
  );
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <Link href={`/proposals/${proposal.id}/edit`} className="font-semibold text-gray-900 hover:text-indigo-600 block truncate">{proposal.title}</Link>
          {proposal.client && <p className="text-sm text-gray-500 mt-0.5">{proposal.client.companyName}</p>}
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><MoreHorizontal className="w-4 h-4" /></button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-10 w-44 py-1">
              <Link href={`/proposals/${proposal.id}/edit`} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Edit className="w-4 h-4" /> Edit</Link>
              {proposal.publicToken && <a href={`/p/${proposal.publicToken}`} target="_blank" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><ExternalLink className="w-4 h-4" /> Preview</a>}
              <button onClick={() => duplicateMutation.mutate()} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full"><Copy className="w-4 h-4" /> Duplicate</button>
              <div className="border-t border-gray-100 my-1" />
              <button onClick={() => { if(confirm('Delete this proposal?')) deleteMutation.mutate(); setMenuOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between"><ProposalStatusBadge status={proposal.status} /><div className="flex items-center gap-3 text-sm text-gray-400"><span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {proposal._count?.views||0} views</span>{proposal.totalAmount&&<span className="font-semibold text-gray-700">{formatCurrency(Number(proposal.totalAmount))}</span>}</div></div>
      <p className="text-xs text-gray-400 mt-3">{formatDate(proposal.updatedAt)}</p>
    </div>
  );
}
