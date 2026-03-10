'use client';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
export function TopBar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = async () => { try { await api.post('/auth/logout'); } catch {} logout(); router.push('/login'); };
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 max-w-sm"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input placeholder="Search proposals..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" /></div></div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-gray-600"><Bell className="w-5 h-5" /></button>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">{user?.plan||'FREE'}</span>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50"><LogOut className="w-4 h-4" /> Log out</button>
      </div>
    </header>
  );
}
