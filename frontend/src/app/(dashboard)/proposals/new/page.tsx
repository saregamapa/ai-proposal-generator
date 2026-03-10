'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

const schema = z.object({ clientId: z.string().optional(), clientName: z.string().min(1), companyName: z.string().min(1), industry: z.string().min(1), budget: z.string().optional(), timeline: z.string().optional(), additionalContext: z.string().max(2000).optional(), templateId: z.string().optional() });
type FormData = z.infer<typeof schema>;
const INDUSTRIES = ['Technology','Healthcare','Finance','E-commerce','Education','Real Estate','Marketing','Manufacturing','Legal','Other'];
const BUDGET_RANGES = ['< $1,000','$1,000 - $5,000','$5,000 - $15,000','$15,000 - $50,000','$50,000+','Flexible'];
const TIMELINE_OPTIONS = ['ASAP','1-2 weeks','1 month','2-3 months','3-6 months','Flexible'];
const COMMON_SERVICES = ['Brand Strategy','Web Design','Web Development','SEO','Social Media','Content Marketing','Paid Advertising','Email Marketing','Logo Design','Consulting','AI Automation','Data Analytics'];

export default function NewProposalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [services, setServices] = useState<string[]>([]);
  const [customService, setCustomService] = useState('');
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: () => api.get('/clients').then(r => r.data.data) });
  const { data: templates } = useQuery({ queryKey: ['templates'], queryFn: () => api.get('/templates').then(r => r.data.data) });
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const generateMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/proposals/generate', { ...data, services }),
    onSuccess: (res) => { toast({ title: 'Proposal generated!' }); router.push(`/proposals/${res.data.data.id}/edit`); },
    onError: (err: any) => toast({ title: 'Generation failed', description: err.response?.data?.error, variant: 'destructive' }),
  });
  const toggleService = (s: string) => setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const addCustom = () => { if (customService.trim()) { setServices(prev => [...prev, customService.trim()]); setCustomService(''); } };
  const onSubmit = (data: FormData) => { if (!services.length) { toast({ title: 'Add at least one service', variant: 'destructive' }); return; } generateMutation.mutate(data); };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/proposals" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
        <div><h1 className="text-2xl font-bold">Generate New Proposal</h1><p className="text-gray-500">Fill in the details and let AI create your proposal</p></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold">1. Client Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Contact Name *</label><input {...register('clientName')} placeholder="John Smith" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />{errors.clientName && <p className="text-red-500 text-xs mt-1">Required</p>}</div>
            <div><label className="block text-sm font-medium mb-1.5">Company Name *</label><input {...register('companyName')} placeholder="Acme Corp" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />{errors.companyName && <p className="text-red-500 text-xs mt-1">Required</p>}</div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Industry *</label><select {...register('industry')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Select industry</option>{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">2. Services Offered *</h2>
          <div className="flex flex-wrap gap-2">{COMMON_SERVICES.map(s => (<button key={s} type="button" onClick={() => toggleService(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${services.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>{s}</button>))}</div>
          <div className="flex gap-2"><input value={customService} onChange={e => setCustomService(e.target.value)} onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),addCustom())} placeholder="Add custom service..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /><button type="button" onClick={addCustom} className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"><Plus className="w-4 h-4" /></button></div>
          {services.length > 0 && <div className="flex flex-wrap gap-2">{services.map(s => (<span key={s} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">{s}<button type="button" onClick={() => setServices(p => p.filter(x => x !== s))}><X className="w-3 h-3" /></button></span>))}</div>}
        </div>
        <button type="submit" disabled={generateMutation.isPending} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:opacity-90 disabled:opacity-60">
          {generateMutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate AI Proposal</>}
        </button>
      </form>
    </div>
  );
}
