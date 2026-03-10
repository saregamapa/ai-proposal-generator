'use client';
import { Plus, Trash2 } from 'lucide-react';

interface TimelineItem { id: string; phase: string; week: string; duration: string; description: string; }
interface Props { items: TimelineItem[]; onChange: (items: TimelineItem[]) => void; }

export function TimelineEditor({ items, onChange }: Props) {
  const addPhase = () => onChange([...items, { id: crypto.randomUUID(), phase: '', week: `Week ${items.length * 2 + 1}-${items.length * 2 + 2}`, duration: '2 weeks', description: '' }]);
  const update = (id: string, field: keyof TimelineItem, value: string) => onChange(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  const remove = (id: string) => onChange(items.filter(i => i.id !== id));

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-3 items-start group p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-indigo-200 transition-colors">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-1">{idx + 1}</span>
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input value={item.phase} onChange={e => update(item.id, 'phase', e.target.value)} placeholder="Phase name" className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
              <input value={item.week} onChange={e => update(item.id, 'week', e.target.value)} placeholder="Week 1-2" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
            </div>
            <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)} placeholder="What happens in this phase..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none" />
          </div>
          <button onClick={() => remove(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 mt-1 transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={addPhase} type="button" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
        <Plus className="w-4 h-4" /> Add phase
      </button>
    </div>
  );
}
