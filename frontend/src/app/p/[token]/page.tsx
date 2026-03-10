'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const publicApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api' });

export default function PublicProposalPage() {
  const { token } = useParams<{ token: string }>();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState<'approved'|'rejected'|null>(null);

  const { data: proposal, isLoading, error } = useQuery({ queryKey: ['public-proposal', token], queryFn: () => publicApi.get(`/public/proposals/${token}`).then(r => r.data.data) });
  const approveMutation = useMutation({ mutationFn: () => publicApi.post(`/public/proposals/${token}/approve`, { clientName, clientEmail, note }), onSuccess: () => setSubmitted('approved') });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !proposal) return <div className="min-h-screen flex items-center justify-center text-center"><div><h1 className="text-2xl font-bold mb-2">Proposal not found</h1><p className="text-gray-500">This link may have expired.</p></div></div>;
  if (submitted === 'approved') return <div className="min-h-screen flex items-center justify-center bg-green-50"><div className="text-center"><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" /><h1 className="text-3xl font-bold mb-2">Proposal Approved!</h1></div></div>;

  const pricing = (proposal.pricingTable as any[]) || [];
  const timeline = (proposal.timeline as any[]) || [];
  const total = pricing.reduce((sum: number, i: any) => sum + (i.total||0), 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-8 opacity-80"><Zap className="w-6 h-6" /><span className="font-semibold">ProposalAI</span></div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{proposal.title}</h1>
          {proposal.client && <p className="text-indigo-200 text-xl mb-2">Prepared for {proposal.client.companyName}</p>}
          {total > 0 && <div className="bg-white/10 inline-block rounded-xl px-5 py-3 mt-6"><p className="text-xs text-indigo-200 mb-1">Investment</p><p className="text-xl font-bold">{formatCurrency(total)}</p></div>}
        </div>
      </div>
      {proposal.status !== 'APPROVED' && (
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-end gap-3">
            <button onClick={() => setShowApproveModal(true)} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-green-700"><CheckCircle className="w-4 h-4" /> Approve Proposal</button>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {proposal.executiveSummary && <section><h2 className="text-2xl font-bold mb-4 pb-3 border-b-2 border-indigo-100">Executive Summary</h2><div dangerouslySetInnerHTML={{ __html: proposal.executiveSummary }} /></section>}
        {timeline.length > 0 && <section><h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-indigo-100">Timeline</h2><div className="space-y-4">{timeline.map((item: any, i: number) => <div key={i} className="flex gap-4"><div className="bg-indigo-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold">{item.week||item.duration}</div><div><p className="font-semibold">{item.phase}</p><p className="text-sm text-gray-500">{item.description}</p></div></div>)}</div></section>}
        {pricing.length > 0 && <section><h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-indigo-100">Investment</h2><table className="w-full text-sm"><thead className="bg-indigo-600 text-white"><tr><th className="text-left px-4 py-3">Service</th><th className="text-right px-4 py-3">Total</th></tr></thead><tbody>{pricing.map((item: any, i: number) => <tr key={i} className={i%2===0?'bg-gray-50':''}><td className="px-4 py-3">{item.service}</td><td className="px-4 py-3 text-right">{formatCurrency(item.total)}</td></tr>)}</tbody><tfoot><tr className="bg-indigo-50"><td className="px-4 py-3 font-bold">Total</td><td className="px-4 py-3 text-right font-bold text-lg">{formatCurrency(total)}</td></tr></tfoot></table></section>}
        {proposal.nextSteps && <section className="bg-indigo-50 rounded-2xl p-8"><h2 className="text-2xl font-bold text-indigo-900 mb-4">Ready to Get Started?</h2><div dangerouslySetInnerHTML={{ __html: proposal.nextSteps }} /><button onClick={() => setShowApproveModal(true)} className="mt-6 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold"><CheckCircle className="w-5 h-5" /> Approve This Proposal</button></section>}
      </div>
      <div className="border-t py-8 text-center text-sm text-gray-400"><p>Powered by <span className="text-indigo-600 font-semibold">ProposalAI</span></p></div>
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Approve Proposal</h3>
            <div className="space-y-4">
              <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Your full name *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input value={clientEmail} onChange={e => setClientEmail(e.target.value)} type="email" placeholder="Your email *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional message..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={() => approveMutation.mutate()} disabled={!clientName||!clientEmail||approveMutation.isPending} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">{approveMutation.isPending?'Approving...':'Confirm Approval'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
