import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface User { id: string; name: string; email: string; avatarUrl?: string; plan: string; }
interface AuthState { user: User|null; token: string|null; refreshToken: string|null; setAuth: (user: User, token: string, refreshToken: string) => void; logout: () => void; updateUser: (updates: Partial<User>) => void; }
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({ user: null, token: null, refreshToken: null, setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }), logout: () => set({ user: null, token: null, refreshToken: null }), updateUser: updates => set(state => ({ user: state.user ? { ...state.user, ...updates } : null })) }),
    { name: 'auth-storage', partialize: s => ({ user: s.user, token: s.token, refreshToken: s.refreshToken }) }
  )
);
