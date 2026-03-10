import { useState, useCallback } from 'react';
interface Toast { id: string; title?: string; description?: string; variant?: 'default'|'destructive'; }
let listeners: ((toasts: Toast[]) => void)[] = [];
let toastList: Toast[] = [];
function notify() { listeners.forEach(fn => fn([...toastList])); }
export function toast(t: Omit<Toast, 'id'>) {
  const id = crypto.randomUUID();
  toastList = [...toastList, { ...t, id }];
  notify();
  setTimeout(() => { toastList = toastList.filter(x => x.id !== id); notify(); }, 4000);
}
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastList);
  const stable = useCallback((fn: (t: Toast[]) => void) => { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; }, []);
  useState(() => { const unsub = stable(setToasts); return unsub; });
  return { toasts, toast };
}
