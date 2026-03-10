'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, LayoutDashboard, FileText, Users, BarChart3, CreditCard, Settings, ChevronRight, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/proposals', icon: FileText, label: 'Proposals' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics', pro: true },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  return (
    <div className="w-60 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="p-5 border-b border-gray-100"><Link href="/dashboard" className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div><span className="font-bold text-gray-900">ProposalAI</span></Link></div>
      <div className="px-4 py-3"><Link href="/proposals/new" className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" /> New Proposal</Link></div>
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href+'/');
          return (<Link key={item.href} href={item.href} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all', isActive?'bg-indigo-50 text-indigo-700 font-semibold':'text-gray-600 hover:bg-gray-50')}><item.icon className={cn('w-4 h-4 flex-shrink-0', isActive?'text-indigo-600':'text-gray-400')} />{item.label}{item.pro&&user?.plan==='FREE'&&<span className="ml-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span>}</Link>);
        })}
      </nav>
      {user?.plan==='FREE'&&<div className="p-4 border-t border-gray-100"><div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100"><p className="text-xs font-semibold text-indigo-700 mb-1">Free Plan</p><p className="text-xs text-gray-500 mb-2">Upgrade for unlimited proposals</p><Link href="/billing" className="flex items-center gap-1 text-xs font-semibold text-indigo-600">Upgrade to Pro <ChevronRight className="w-3 h-3" /></Link></div></div>}
      <div className="p-4 border-t border-gray-100"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.name}</p><p className="text-xs text-gray-400 truncate">{user?.email}</p></div></div></div>
    </div>
  );
}
