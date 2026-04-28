import React, { useState } from 'react';
import { PackageOpen, Plus, Activity } from 'lucide-react';

interface Pot {
  id: string;
  name: string;
  price: number;
  totalWeight: number;
  currentWeight: number;
}

export function Estoque() {
  const [pots, setPots] = useState<Pot[]>([
    { id: '1', name: 'Vólia Gel Classic Blank', price: 90, totalWeight: 24, currentWeight: 18 },
    { id: '2', name: 'Vólia Gel Classic Pink', price: 90, totalWeight: 24, currentWeight: 5 },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', weight: '' });

  const handleAddPot = (e: React.FormEvent) => {
    e.preventDefault();
    const newPot: Pot = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      totalWeight: parseFloat(formData.weight),
      currentWeight: parseFloat(formData.weight)
    };
    setPots([...pots, newPot]);
    setIsAdding(false);
    setFormData({ name: '', price: '', weight: '' });
  };

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl shadow-sm border border-white/50">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <PackageOpen className="text-pink-500" /> Meu Estoque
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-pink-100 text-pink-600 p-2 rounded-xl hover:bg-pink-200 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddPot} className="glass-card p-6 animate-in slide-in-from-top-2">
          <h3 className="font-semibold text-gray-700 mb-4">Cadastrar Pote</h3>
          <div className="space-y-4">
            <div className="w-full">
              <input 
                required 
                type="text" 
                placeholder="Nome do Produto (Ex: Vólia Gel)" 
                className="input-glass w-full" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="w-full">
                <input required type="number" step="0.01" placeholder="Preço (R$)" className="input-glass w-full" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="w-full">
                <input required type="number" step="1" placeholder="Peso (g)" className="input-glass w-full" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn-gradient w-full py-4 mt-2 font-bold text-lg">CADASTRAR PRODUTO</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {pots.map(pot => {
          const percentage = Math.max(0, Math.min(100, (pot.currentWeight / pot.totalWeight) * 100));
          const isLow = percentage < 20;

          return (
            <div key={pot.id} className="glass-card p-5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{pot.name}</h3>
                <span className="text-xs font-semibold bg-white/80 px-2 py-1 rounded-lg text-pink-600">R$ {pot.price.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between mt-4 mb-1">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Activity size={12} /> Restante: {pot.currentWeight.toFixed(1)}g / {pot.totalWeight}g
                </span>
                <span className={`text-xs font-bold ${isLow ? 'text-red-500' : 'text-green-500'}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full bg-white/50 rounded-[4px] h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isLow ? 'bg-[#ff4757]' : 'bg-[#FF1493]'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
