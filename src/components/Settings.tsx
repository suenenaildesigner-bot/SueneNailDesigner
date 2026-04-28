import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, ChevronLeft, PenTool, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { GuiaGestao } from './GuiaGestao';

interface Servico {
  id: string;
  nome_servico: string;
  valor_sugerido: number;
  gasto_medio: number;
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
        .from('configuracoes_atendimento')
        .select('*')
        .order('servico');

      if (error || !data || data.length === 0) {
         // Fallback to initial values if table doesn't exist yet or is empty
         const initialServicos = [
           { id: '1', nome_servico: 'Molde F1', valor_sugerido: 180, gasto_medio: 3.5 },
           { id: '2', nome_servico: 'Banho de Gel', valor_sugerido: 100, gasto_medio: 1.5 },
           { id: '3', nome_servico: 'Manutenção F1', valor_sugerido: 130, gasto_medio: 2.5 },
           { id: '4', nome_servico: 'Esmaltação em Gel', valor_sugerido: 70, gasto_medio: 0 },
           { id: '5', nome_servico: 'Unha Simples', valor_sugerido: 50, gasto_medio: 0.5 }
         ];
         setServicos(initialServicos);
      } else {
        // Map table columns (servico, valor, gasto) back to UI model
        const mappedData = data.map((d: any, index: number) => ({
          id: String(index + 1), 
          nome_servico: d.servico,
          valor_sugerido: d.valor,
          gasto_medio: d.gasto
        }));
        setServicos(mappedData);
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
      
      const payload = servicos.map(s => {
        // Comprehensive sanitization: remove everything except digits, dots and commas
        const cleanValue = (val: any) => {
          const str = String(val).replace(/[^0-9.,]/g, '');
          return Number(str.replace(',', '.'));
        };

        return {
          servico: s.nome_servico,
          valor: cleanValue(s.valor_sugerido),
          gasto: cleanValue(s.gasto_medio)
        };
      });

      console.log('Enviando Payload para configuracoes_atendimento:', payload);

      const { error } = await supabase
        .from('configuracoes_atendimento')
        .upsert(payload, { onConflict: 'servico' });

      if (error) {
        console.error('ERRO TÉCNICO SUPABASE:', error);
        throw error;
      }
      
      alert('Sistema de Elite Sincronizado!');
      fetchServicos(); 
    } catch (error: any) {
      console.error('Erro ao salvar no Supabase:', error);
      alert(`Falha no Salvamento: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="p-8 flex items-center gap-5 sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-pink-100 shadow-sm">
        <button onClick={onBack} className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 active:scale-95 transition-all">
          <ChevronLeft size={22} />
        </button>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
          <SettingsIcon size={22} className="text-[#f21b7f]" />
          Configurações de Elite
        </h2>
      </header>

      <main className="p-8 space-y-10">
        <div className="bg-gradient-to-br from-[#f21b7f] to-pink-500 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-black tracking-tight mb-3 uppercase">Gestão de Preços</h3>
          <p className="text-pink-50 text-sm font-medium leading-relaxed opacity-90">
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

        <div className="space-y-8">
          {loading ? (
            <div className="p-24 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f21b7f]"></div>
            </div>
          ) : (
            servicos.map(servico => (
              <motion.div 
                key={servico.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 border-l-[10px] border-l-[#f21b7f] bg-white shadow-xl mb-8"
              >
                <div className="flex items-center gap-6 mb-12">
                  <div className="p-6 bg-pink-50 rounded-[30px] text-[#f21b7f] shadow-inner">
                    <PenTool size={24} />
                  </div>
                  <h4 className="font-black text-slate-800 uppercase text-[16px] tracking-[0.4em]">{servico.nome_servico}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                  <div className="space-y-6">
                    <label className="text-[14px] font-black text-[#f21b7f] uppercase tracking-widest ml-1">Preço do Serviço</label>
                    <div className="relative group">
                      <input 
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="input-glass w-full px-10 py-8 text-2xl font-black text-slate-700 hover:border-pink-200 focus:border-[#f21b7f] transition-all outline-none rounded-[32px] bg-slate-50/50"
                        placeholder="0.00"
                        value={servico.valor_sugerido}
                        onChange={e => handleUpdate(servico.id, 'valor_sugerido', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <label className="text-[14px] font-black text-[#f21b7f] uppercase tracking-widest ml-1">Consumo de Gel</label>
                    <div className="relative group">
                      <input 
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        className="input-glass w-full px-10 py-8 text-2xl font-black text-slate-700 hover:border-pink-200 focus:border-[#f21b7f] transition-all outline-none rounded-[32px] bg-slate-50/50"
                        placeholder="Ex: 3.5"
                        value={servico.gasto_medio}
                        onChange={e => handleUpdate(servico.id, 'gasto_medio', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-gradient w-full py-7 text-base font-black tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-pink-200/50 mt-8 disabled:opacity-50 rounded-[35px]"
        >
          {saving ? 'SALVANDO...' : (
            <><Save size={22} /> SALVAR ATUALIZAÇÕES</>
          )}
        </button>
      </main>
    </div>
  );
}
