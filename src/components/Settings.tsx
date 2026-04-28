import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, ChevronLeft, DollarSign, PenTool, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { GuiaGestao } from './GuiaGestao';

interface Servico {
  id: string;
  nome: string;
  preco_sugerido: number;
  gasto_estimado: number;
}

export function Settings({ onBack }: { onBack: () => void }) {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchServicos();
  }, []);

  if (showGuide) {
    return <GuiaGestao onBack={() => setShowGuide(false)} />;
  }

  const fetchServicos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracoes_precos')
        .select('*')
        .order('nome');

      if (error) {
         // Fallback to initial values if table doesn't exist yet
         const initialServicos = [
           { id: '1', nome: 'Molde F1', preco_sugerido: 180, gasto_estimado: 3.5 },
           { id: '2', nome: 'Banho de Gel', preco_sugerido: 100, gasto_estimado: 1.5 },
           { id: '3', nome: 'Manutenção F1', preco_sugerido: 130, gasto_estimado: 2.5 },
           { id: '4', nome: 'Esmaltação em Gel', preco_sugerido: 70, gasto_estimado: 0 },
           { id: '5', nome: 'Unha Simples', preco_sugerido: 50, gasto_estimado: 0.5 }
         ];
         setServicos(initialServicos);
      } else if (data) {
        setServicos(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: string, field: keyof Servico, value: string | number) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('configuracoes_precos')
        .upsert(servicos.map(({ id, ...rest }) => rest));

      if (error) throw error;
      
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="p-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-pink-100/50">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <SettingsIcon size={20} className="text-pink-500" />
          Configurações de Elite
        </h2>
      </header>

      <main className="p-6 space-y-6">
        <div className="bg-gradient-to-br from-[#f21b7f] to-pink-500 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-black tracking-tight mb-2 uppercase">Gestão de Preços</h3>
          <p className="text-pink-50 text-xs font-medium leading-relaxed opacity-80">
            Ajuste os valores de venda e o consumo médio de material para cada técnica oferecida.
          </p>
        </div>

        <button 
          onClick={() => setShowGuide(true)}
          className="glass-card p-4 flex items-center justify-between border-l-[6px] border-l-blue-400 group active:scale-[0.98] transition-all w-full text-left"
        >
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
               <BookOpen size={20} />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dúvidas de Gestão?</p>
               <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest pr-4">Ver Manual de Lucratividade</h4>
             </div>
          </div>
          <ChevronLeft size={20} className="text-slate-300 rotate-180 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="space-y-4">
          {loading ? (
            <div className="p-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            servicos.map(servico => (
              <motion.div 
                key={servico.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                    <PenTool size={18} />
                  </div>
                  <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest">{servico.nome}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Sugerido</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={14} />
                      <input 
                        type="number"
                        inputMode="decimal"
                        className="input-glass w-full pl-8 py-3 text-sm font-bold text-slate-800"
                        value={servico.preco_sugerido}
                        onChange={e => handleUpdate(servico.id, 'preco_sugerido', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gasto Médio (g)</label>
                    <input 
                      type="number"
                      inputMode="decimal"
                      className="input-glass w-full py-3 text-sm font-bold text-slate-800"
                      value={servico.gasto_estimado}
                      onChange={e => handleUpdate(servico.id, 'gasto_estimado', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-gradient w-full py-5 text-sm font-black tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-pink-200 mt-4 disabled:opacity-50"
        >
          {saving ? 'SALVANDO...' : (
            <><Save size={18} /> SALVAR ATUALIZAÇÕES</>
          )}
        </button>
      </main>
    </div>
  );
}
