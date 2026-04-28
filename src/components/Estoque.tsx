import React, { useState, useEffect } from 'react';
import { PackageOpen, Plus, Activity, Trash2, Pencil, X, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

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
  const [editingPot, setEditingPot] = useState<Pot | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [formData, setFormData] = useState({ 
    marca: '', 
    nome: '', 
    preco: '', 
    weight: '',
    frascos: '1' 
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const weightTotal = parseFloat(formData.weight) * parseInt(formData.frascos);
      
      const payload: any = {
        marca: formData.marca,
        nome: formData.nome,
        preco: parseFloat(formData.preco),
        quantidade_total: weightTotal,
      };

      if (editingPot) {
        // When editing, we usually want to update the total capacity but maintain current status unless it's a refill?
        // Let's keep it simple: we update the stats.
        const { error } = await supabase
          .from('estoque')
          .update(payload)
          .eq('id', editingPot.id);
        if (error) throw error;
      } else {
        payload.quantidade_atual = weightTotal;
        const { error } = await supabase
          .from('estoque')
          .insert([payload]);
        if (error) throw error;
      }
      
      setIsAdding(false);
      setEditingPot(null);
      setFormData({ marca: '', nome: '', preco: '', weight: '', frascos: '1' });
      await fetchInventory();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (pot: Pot) => {
    setEditingPot(pot);
    setFormData({
      marca: pot.marca,
      nome: pot.nome,
      preco: pot.preco.toString(),
      weight: pot.quantidade_total.toString(),
      frascos: '1'
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (pot: Pot) => {
    setItemToDelete({ id: pot.id, name: `${pot.marca} ${pot.nome}` });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('estoque').delete().eq('id', itemToDelete.id);
      if (error) throw error;
      setModalOpen(false);
      setItemToDelete(null);
      fetchInventory();
    } catch (error) {
      alert('Erro ao excluir produto');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Botão de Adicionar */}
      {!isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-gradient w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-pink-200"
        >
          <Plus size={20} /> CADASTRAR NOVO PRODUTO
        </button>
      )}

      {/* Formulário (Modal-like inline implementation) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 border-2 border-pink-100 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                <PackageOpen className="text-pink-500" />
                {editingPot ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button 
                onClick={() => { setIsAdding(false); setEditingPot(null); }}
                className="text-gray-400 hover:text-pink-500"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Marca</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Vólia" 
                    className="input-glass w-full" 
                    value={formData.marca} 
                    onChange={e => setFormData({...formData, marca: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Nome do Produto</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Ex: Gel Pink" 
                    className="input-glass w-full" 
                    value={formData.nome} 
                    onChange={e => setFormData({...formData, nome: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Preço Un. (R$)</label>
                  <input required type="number" step="0.01" className="input-glass w-full" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Peso Un. (g)</label>
                  <input required type="number" step="1" className="input-glass w-full" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[11px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1"><Hash size={10}/> Qtd. Frascos</label>
                  <input required type="number" step="1" className="input-glass w-full font-bold text-pink-600" value={formData.frascos} onChange={e => setFormData({...formData, frascos: e.target.value})} />
                </div>
              </div>

              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50 flex justify-between items-center mt-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Peso:</span>
                <span className="text-lg font-black text-pink-500">
                  { (parseFloat(formData.weight) || 0) * (parseInt(formData.frascos) || 1) }g
                </span>
              </div>

              <button type="submit" className="btn-gradient w-full py-4.5 mt-4 font-bold text-lg shadow-lg active:scale-95 transition-all">
                {editingPot ? 'ATUALIZAR PRODUTO' : 'CADASTRAR NO ESTOQUE'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading && !isAdding ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
          </div>
        ) : pots.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <PackageOpen size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium tracking-wide text-xs uppercase">E S T O Q U E &nbsp; V A Z I O</p>
          </div>
        ) : (
          pots.map(pot => {
            const percentage = Math.max(0, Math.min(100, (pot.quantidade_atual / pot.quantidade_total) * 100));
            const isLow = percentage < 25;

            return (
              <div key={pot.id} className="glass-card p-5 relative overflow-hidden transition-all hover:border-pink-200 group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{pot.marca}</span>
                    <h3 className="font-bold text-slate-800 text-lg">{pot.nome}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-full text-pink-600 border border-pink-100">
                      R$ {pot.preco.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6 mb-2 text-slate-500 uppercase">
                  <span className="text-[11px] font-bold flex items-center gap-2">
                    <Activity size={14} className="text-pink-400" /> 
                    RESTANTE: {pot.quantidade_atual.toFixed(1)}g / {pot.quantidade_total}g
                  </span>
                  <span className={`text-[11px] font-black ${isLow ? 'text-red-500 animate-pulse' : 'text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                
                {/* Progress Bar Container */}
                <div className="w-full bg-slate-100/50 rounded-full h-3 overflow-hidden border border-white/50 shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${isLow ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-gradient-to-r from-pink-400 to-[#f21b7f]'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Ações flutuantes (Mobile friendly) */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100/50">
                  <button 
                    onClick={() => handleEditClick(pot)}
                    className="flex-1 py-2.5 rounded-xl bg-pink-50 text-pink-500 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Pencil size={14} /> EDITAR
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(pot)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-500 active:scale-95 transition-all"
                  >
                    <Trash2 size={14} /> EXCLUIR
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={confirmDelete} 
        itemText={itemToDelete?.name} 
      />
    </div>
  );
}
