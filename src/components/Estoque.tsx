import React, { useState, useEffect } from 'react';
import { PackageOpen, Plus, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Pot {
  id: string;
  marca: string;
  nome: string;
  preco: number;
  quantidade_total: number;
  quantidade_atual: number;
}

export function Estoque() {
  const [pots, setPots] = useState<Pot[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ marca: '', nome: '', preco: '', weight: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setPots(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPot = {
        marca: formData.marca,
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        quantidade_total: parseFloat(formData.weight),
        quantidade_atual: parseFloat(formData.weight)
      };

      const { error } = await supabase
        .from('estoque')
        .insert([newPot]);

      if (error) throw error;
      
      setIsAdding(false);
      setFormData({ marca: '', nome: '', preco: '', weight: '' });
      fetchInventory();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erro ao cadastrar produto');
    }
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
            <div className="grid grid-cols-2 gap-3">
              <input 
                required 
                type="text" 
                placeholder="Marca (Ex: Vólia)" 
                className="input-glass w-full" 
                value={formData.marca} 
                onChange={e => setFormData({...formData, marca: e.target.value})} 
              />
              <input 
                required 
                type="text" 
                placeholder="Nome (Ex: Gel Pink)" 
                className="input-glass w-full" 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="w-full">
                <input required type="number" step="0.01" placeholder="Preço (R$)" className="input-glass w-full" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} />
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
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : pots.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum item no estoque.</p>
        ) : (
          pots.map(pot => {
            const percentage = Math.max(0, Math.min(100, (pot.quantidade_atual / pot.quantidade_total) * 100));
            const isLow = percentage < 25;

            return (
              <div key={pot.id} className="glass-card p-5 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{pot.marca}</span>
                    <h3 className="font-bold text-slate-800 text-lg">{pot.nome}</h3>
                  </div>
                  <span className="text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-full text-pink-600 border border-pink-100">
                    R$ {pot.preco.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-6 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                    <Activity size={14} className="text-pink-400" /> 
                    RESTANTE: {pot.quantidade_atual.toFixed(1)}g / {pot.quantidade_total}g
                  </span>
                  <span className={`text-[11px] font-black ${isLow ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                
                {/* Progress Bar Container */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-white/50">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${isLow ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-pink-400 to-[#f21b7f]'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
