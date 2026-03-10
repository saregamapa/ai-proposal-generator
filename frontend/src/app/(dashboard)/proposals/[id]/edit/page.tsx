'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { PricingTableEditor } from '@/components/proposals/PricingTableEditor';
import { TimelineEditor } from '@/components/proposals/TimelineEditor';
import { ProposalStatusBadge } from '@/components/proposals/ProposalStatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Send, Download, Copy, ExternalLink, Save } from 'lucide-react';
import Link from 'next/link';

const SECTIONS = [
  { key: 'executiveSummary', label: 'Executive Summary', type: 'rich' },
  { key: 'clientProblem', label: 'Client Problem', type: 'rich' },
  { key: 'proposedSolution', label: 'Proposed Solution', type: 'rich' },
  { key: 'scopeOfWork', label: 'Scope of Work', type: 'rich' },
  { key: 'deliverables', label: 'Deliverables', type: 'rich' },
  { key: 'timeline', label: 'Timeline', type: 'timeline' },
  { key: 'pricingTable', label: 'Pricing Table', type: 'pricing' },
  { key: 'terms', label: 'Terms & Conditions', type: 'rich' },
  { key: 'nextSteps', label: 'Next Steps', type: 'rich' },
];

export default function ProposalEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('executiveSummary');
  const [localData, setLocalData] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);

  const { data: proposal, isLoading } = useQuery({ queryKey: ['proposal', id], queryFn: () => api.get(`/proposals/${id}`).then(r => r.data.data) });
  useEffect(() => { if (proposal) setLocalData(proposal); }, [proposal]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.put(`/proposals/${id}`, data),
    onSuccess: () => { setIsDirty(false); queryClient.invalidateQueries({ queryKey: ['proposal', id] }); toast({ title: 'Saved!' }); },
    onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
  });
  const sendMutation = useMutation({
    mutationFn: () => api.post(`/proposals/${id}/send`),
    onSuccess: (res) => { navigator.clipboard.writeText(res.data.data.shareLink); toast({ title: 'Proposal sent! Link copied.' }); queryClient.invalidateQueries({ queryKey: ['proposal', id] }); },
  });
  const pdfMutation = useMutation({ mutationFn: () => api.post(`/proposals/${id}/pdf`), onSuccess: () => toast({ title: 'PDF generating...' }) });

  const updateSection = (key: string, value: any) => { setLocalData(prev => ({ ...prev, [key]: value })); setIsDirty(true); };
  const activeSectionConfig = SECTIONS.find(s => s.key === activeSection);

  if (isLoading) return <div className="h-full flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex h-full gap-0 -m-6">
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <Link href="/proposals" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h3 className="font-semibold text-gray-900 text-sm truncate">{localData.title}</h3>
          <ProposalStatusBadge status={proposal?.status} />
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeSection === s.key ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>{s.label}</button>
          ))}
        </nav>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <h2 className="font-semibold">{activeSectionConfig?.label}</h2>
          <div className="flex items-center gap-2">
            {isDirty && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Unsaved</span>}
            <button onClick={() => saveMutation.mutate(localData)} disabled={saveMutation.isPending||!isDirty} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><Save className="w-4 h-4" /> Save</button>
            <button onClick={() => pdfMutation.mutate()} disabled={pdfMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><Download className="w-4 h-4" /> PDF</button>
            <button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"><Send className="w-4 h-4" /> Send</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-96">
            {activeSectionConfig?.type === 'rich' && <RichTextEditor key={activeSection} content={localData[activeSection]||''} onChange={val => updateSection(activeSection, val)} placeholder={`Write your ${activeSectionConfig.label.toLowerCase()}...`} />}
            {activeSectionConfig?.type === 'pricing' && <PricingTableEditor items={localData.pricingTable||[]} onChange={items => { updateSection('pricingTable', items); updateSection('totalAmount', items.reduce((s:number,i:any)=>s+(i.total||0),0)); }} />}
            {activeSectionConfig?.type === 'timeline' && <TimelineEditor items={localData.timeline||[]} onChange={items => updateSection('timeline', items)} />}
          </div>
        </div>
      </div>
    </div>
  );
}
