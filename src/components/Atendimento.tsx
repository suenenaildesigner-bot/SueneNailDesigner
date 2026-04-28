import React, { useState, useEffect } from 'react';
import { Scissors, DollarSign, Droplet, Calculator, CheckCircle2, Sparkles, User, Briefcase, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface Gel {
  id: string;
  marca: string;
  nome: string;
  quantidade_atual: number;
  quantidade_total: number;
  preco: number;
}

interface SugestaoAgenda {
  id: string;
  cliente_nome: string;
  servico: string;
  data_hora: string;
}

export function Atendimento() {
  const [clienteNome, setClienteNome] = useState('');
  const [servico, setServico] = useState('');
  const [valorCobrado, setValorCobrado] = useState('');
  const [valorExtra, setValorExtra] = useState('');
  const [gramatura, setGramatura] = useState('');
  const [gelSelecionado, setGelSelecionado] = useState('');
  const [pots, setPots] = useState<Gel[]>([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [agendamentoSugerido, setAgendamentoSugerido] = useState<SugestaoAgenda | null>(null);

  useEffect(() => {
    fetchPots();
    fetchUpcomingAppointment();
  }, []);

  const fetchPots = async () => {
    const { data } = await supabase
      .from('estoque')
      .select('*')
      .gt('quantidade_atual', 0);
    if (data) setPots(data);
  };

  const fetchUpcomingAppointment = async () => {
    try {
      const now = new Date();
      const start = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
      const end = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from('agenda')
        .select('id, cliente_nome, servico, data_hora')
        .gte('data_hora', start)
        .lte('data_hora', end)
        .eq('status', 'pending')
        .order('data_hora', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setAgendamentoSugerido(data);
      }
    } catch (error) {
      console.error('Erro ao buscar sugestão de agenda:', error);
    }
  };

  const handleApplySuggestion = () => {
    if (agendamentoSugerido) {
      setClienteNome(agendamentoSugerido.cliente_nome);
      setServico(agendamentoSugerido.servico);
      // Preços sugeridos baseados no serviço (exemplo)
      if (agendamentoSugerido.servico.toLowerCase().includes('alongamento')) setValorCobrado('120');
      else if (agendamentoSugerido.servico.toLowerCase().includes('manutenção')) setValorCobrado('90');
      else setValorCobrado('80');
      
      setAgendamentoSugerido(null);
    }
  };

  const handleGelChange = (id: string) => {
    setGelSelecionado(id);
    if (!gramatura) {
      setGramatura('2.0');
    }
  };

  const handleDescontar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gelSelecionado) {
      alert("Por favor, selecione qual gel foi utilizado.");
      return;
    }

    setLoading(true);
    try {
      const gel = pots.find(p => p.id === gelSelecionado);
      if (!gel) return;

      const qtdGasta = parseFloat(gramatura);
      const novaQtd = gel.quantidade_atual - qtdGasta;

      if (novaQtd < 0) {
        alert("Quantidade insuficiente no estoque!");
        setLoading(false);
        return;
      }

      await supabase
        .from('estoque')
        .update({ quantidade_atual: novaQtd })
        .eq('id', gelSelecionado);

      const totalFinal = (parseFloat(valorCobrado) || 0) + (parseFloat(valorExtra) || 0);
      const custoMaterial = (gel.preco / gel.quantidade_total) * qtdGasta;

      await supabase
        .from('atendimentos')
        .insert([{
          cliente_nome: clienteNome,
          servico: servico,
          valor_cobrado: totalFinal,
          custo_material: custoMaterial,
          gel_usado: gel.nome,
          quantidade_gasta: qtdGasta,
          data: new Date().toISOString()
        }]);

      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setClienteNome('');
        setServico('');
        setValorCobrado('');
        setValorExtra('');
        setGelSelecionado('');
        setGramatura('');
        fetchPots();
        fetchUpcomingAppointment();
      }, 2500);

    } catch (error) {
      console.error(error);
      alert('Erro ao processar atendimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      
      <AnimatePresence>
        {agendamentoSugerido && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 p-5 bg-white/60 backdrop-blur-xl rounded-[32px] border-2 border-[#e5b182]/20 flex items-center justify-between shadow-xl shadow-[#e5b182]/5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] rounded-2xl flex items-center justify-center text-[#e5b182] shadow-sm border border-white">
                <User size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#e5b182] uppercase tracking-[0.2em]">Sugerido agora</p>
                <h4 className="font-black text-slate-800 text-sm tracking-tight">{agendamentoSugerido.cliente_nome}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{agendamentoSugerido.servico}</p>
              </div>
            </div>
            <button 
              onClick={handleApplySuggestion}
              className="px-5 py-2.5 bg-slate-900 text-[#e5b182] text-[10px] font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md uppercase tracking-widest"
            >
              PREENCHER
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden mx-4">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#e5b182]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Scissors size={24} className="text-[#e5b182]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Protocolo de <span className="text-[#e5b182]">Elite</span></h2>
          </div>
          <p className="text-slate-400 max-w-[240px] text-xs leading-relaxed font-bold uppercase tracking-widest opacity-80">Gestão Superior de Atendimento e Insumos</p>
        </div>
      </div>

      <form onSubmit={handleDescontar} className="glass-card p-8 space-y-6 mt-[-50px] relative z-20 mx-6 shadow-2xl border-b-8 border-b-slate-900/10">
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identificação da Cliente</label>
            <input 
              required
              type="text" 
              placeholder="Nome completo" 
              className="input-glass w-full px-5 py-4 text-sm font-bold text-slate-800 bg-slate-50/50"
              value={clienteNome}
              onChange={e => setClienteNome(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Serviço Realizado</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Manutenção Gel" 
              className="input-glass w-full px-5 py-4 text-sm font-bold text-slate-800 bg-slate-50/50"
              value={servico}
              onChange={e => setServico(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Base (R$)</label>
            <input 
              required
              type="number" 
              step="0.01"
              placeholder="0,00" 
              className="input-glass w-full px-4 py-4 text-lg font-black text-slate-800"
              value={valorCobrado}
              onChange={e => setValorCobrado(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Extras / Arte (R$)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="+ 0,00" 
              className="input-glass w-full px-4 py-4 text-lg font-black text-[#e5b182]"
              value={valorExtra}
              onChange={e => setValorExtra(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consumo de Gel</label>
             <select 
              required
              className="input-glass w-full px-5 py-4 appearance-none font-bold text-slate-700"
              value={gelSelecionado}
              onChange={e => handleGelChange(e.target.value)}
            >
              <option value="" disabled>Selecione o Insumo...</option>
              {pots.map(pot => (
                <option key={pot.id} value={pot.id}>{pot.marca} - {pot.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gramatura (g)</label>
            <input 
              required
              type="number" 
              step="0.1"
              placeholder="Ex: 2.0"
              className="input-glass w-full px-5 py-4 text-slate-900 font-black text-xl"
              value={gramatura}
              onChange={e => setGramatura(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || sucesso}
          className="relative group w-full py-6 mt-4 flex items-center justify-center gap-3 disabled:opacity-50 font-black tracking-[0.2em] text-sm bg-slate-900 text-[#e5b182] rounded-[24px] shadow-2xl active:scale-[0.98] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <Sparkles size={18} />
          CONCLUIR ATENDIMENTO
        </button>
      </form>

      <AnimatePresence>
        {sucesso && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/20 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 p-12 bg-white rounded-[60px] border-4 border-[#e5b182]/40 shadow-[0_40px_100px_rgba(229,177,130,0.5)]"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] rounded-full flex items-center justify-center text-[#e5b182] shadow-inner">
                <CheckCircle2 size={60} />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-1">Finalizado</h3>
                <p className="text-xs font-black text-[#e5b182] uppercase tracking-widest">Protocolo Concluído com Sucesso</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

