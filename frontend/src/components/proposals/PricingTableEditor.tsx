'use client';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
interface PricingItem { id: string; service: string; description: string; quantity: number; unitPrice: number; total: number; }
interface Props { items: PricingItem[]; onChange: (items: PricingItem[]) => void; }
export function PricingTableEditor({ items, onChange }: Props) {
  const addRow = () => onChange([...items, { id: crypto.randomUUID(), service: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const updateRow = (id: string, field: keyof PricingItem, value: any) => {
    const updated = items.map(item => {
      if (item.id !== id) return item;
      const newItem = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') newItem.total = (field==='quantity'?value:newItem.quantity)*(field==='unitPrice'?value:newItem.unitPrice);
      return newItem;
    });
    onChange(updated);
  };
  const removeRow = (id: string) => onChange(items.filter(i => i.id !== id));
  const total = items.reduce((sum, i) => sum + (i.total||0), 0);
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead><tr className="bg-gray-50"><th className="text-left px-3 py-2.5 font-semibold text-gray-600">Service</th><th className="text-left px-3 py-2.5 font-semibold text-gray-600">Description</th><th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-20">Qty</th><th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-28">Unit Price</th><th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-28">Total</th><th className="w-10" /></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => (
            <tr key={item.id} className="group">
              <td className="px-3 py-2"><input value={item.service} onChange={e => updateRow(item.id,'service',e.target.value)} placeholder="Service name" className="w-full bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1" /></td>
              <td className="px-3 py-2"><input value={item.description} onChange={e => updateRow(item.id,'description',e.target.value)} placeholder="Description" className="w-full bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 text-gray-500" /></td>
              <td className="px-3 py-2"><input type="number" min="1" value={item.quantity} onChange={e => updateRow(item.id,'quantity',parseFloat(e.target.value)||1)} className="w-full bg-transparent focus:outline-none text-right" /></td>
              <td className="px-3 py-2"><div className="flex items-center justify-end gap-1"><span className="text-gray-400">$</span><input type="number" min="0" value={item.unitPrice} onChange={e => updateRow(item.id,'unitPrice',parseFloat(e.target.value)||0)} className="w-full bg-transparent focus:outline-none text-right" /></div></td>
              <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
              <td className="px-3 py-2"><button onClick={() => removeRow(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr className="bg-indigo-50"><td colSpan={4} className="px-3 py-3 font-bold text-indigo-900">Total</td><td className="px-3 py-3 text-right font-bold text-indigo-900 text-lg">{formatCurrency(total)}</td><td /></tr></tfoot>
      </table>
      <button onClick={addRow} type="button" className="flex items-center gap-2 text-sm text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50"><Plus className="w-4 h-4" /> Add line item</button>
    </div>
  );
}
