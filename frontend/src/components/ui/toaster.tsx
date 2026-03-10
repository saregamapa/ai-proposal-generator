'use client';
import { useToast } from './use-toast';
export function Toaster() {
  const { toasts } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {toasts.map(({ id, title, description, variant }) => (
        <div key={id} className={`rounded-xl p-4 shadow-lg border text-sm ${variant==='destructive'?'bg-red-50 border-red-200 text-red-900':'bg-white border-gray-200 text-gray-900'}`}>
          {title && <p className="font-semibold">{title}</p>}
          {description && <p className="text-xs mt-0.5 opacity-80">{description}</p>}
        </div>
      ))}
    </div>
  );
}
