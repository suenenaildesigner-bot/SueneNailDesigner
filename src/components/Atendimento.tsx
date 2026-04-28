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

interface Servico {
  id: string;
  nome: string;
  preco_sugerido: number;
  gasto_estimado: number;
}

export function Atendimento() {
  const [clienteNome, setClienteNome] = useState('');
  const [servico, setServico] = useState('');
  const [tecnica, setTecnica] = useState('');
  const [valorCobrado, setValorCobrado] = useState('');
  const [valorExtra, setValorExtra] = useState('');
  const [gramatura, setGramatura] = useState('');
  const [gelSelecionado, setGelSelecionado] = useState('');
  const [pots, setPots] = useState<Gel[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [agendamentoSugerido, setAgendamentoSugerido] = useState<SugestaoAgenda | null>(null);

  const CUSTO_DESCARTAVEL = 5.00;

  useEffect(() => {
    fetchPots();
    fetchUpcomingAppointment();
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      const { data } = await supabase.from('servicos').select('*').order('nome');
      if (data && data.length > 0) {
        setServicos(data);
      } else {
        // Fallback hardcoded services
        setServicos([
          { id: '1', nome: 'Molde F1', preco_sugerido: 180, gasto_estimado: 3.5 },
          { id: '2', nome: 'Banho de Gel', preco_sugerido: 100, gasto_estimado: 1.5 },
          { id: '3', nome: 'Manutenção F1', preco_sugerido: 130, gasto_estimado: 2.5 },
          { id: '4', nome: 'Esmaltação em Gel', preco_sugerido: 70, gasto_estimado: 0 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleTecnicaChange = (val: string) => {
    setTecnica(val);
    setServico(val);
    
    const servicoSelecionado = servicos.find(s => s.nome === val);
    if (servicoSelecionado) {
      setGramatura(servicoSelecionado.gasto_estimado.toString());
      setValorCobrado(servicoSelecionado.preco_sugerido.toString());
    }
  };

  const calculateLucro = () => {
    const valor = (parseFloat(valorCobrado) || 0) + (parseFloat(valorExtra) || 0);
    const qtdGasta = parseFloat(gramatura) || 0;
    
    const gel = pots.find(p => p.id === gelSelecionado);
    let custoGel = 0;
    if (gel && qtdGasta > 0) {
      custoGel = (gel.preco / gel.quantidade_total) * qtdGasta;
    }
    
    const custoExtraEsmalte = tecnica === 'Esmaltação em Gel' ? 2.00 : 0;
    const lucroTotal = valor - custoGel - CUSTO_DESCARTAVEL - custoExtraEsmalte;
    
    return {
      valor,
      custoGel,
      custoExtraEsmalte,
      custoMaterial: custoGel + custoExtraEsmalte + CUSTO_DESCARTAVEL,
      lucro: Math.max(0, lucroTotal)
    };
  };

  const { lucro, custoMaterial: totalCustoReal } = calculateLucro();

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
      
      // Tentar encontrar uma técnica que bata com o serviço agendado
      const matchedServico = servicos.find(s => 
        agendamentoSugerido.servico.toLowerCase().includes(s.nome.toLowerCase()) || 
        s.nome.toLowerCase().includes(agendamentoSugerido.servico.toLowerCase())
      );

      if (matchedServico) {
        setTecnica(matchedServico.nome);
        setValorCobrado(matchedServico.preco_sugerido.toString());
        setGramatura(matchedServico.gasto_estimado.toString());
      } else {
        if (agendamentoSugerido.servico.toLowerCase().includes('alongamento')) setValorCobrado('120');
        else if (agendamentoSugerido.servico.toLowerCase().includes('manutenção')) setValorCobrado('90');
        else setValorCobrado('80');
      }
      
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
      const { custoGel, custoExtraEsmalte } = calculateLucro();
      const materialCostToSave = custoGel + custoExtraEsmalte;

      await supabase
        .from('atendimentos')
        .insert([{
          cliente_nome: clienteNome,
          servico: servico,
          tecnica: tecnica,
          valor_cobrado: totalFinal,
          custo_material: materialCostToSave,
          gel_usado: gel.nome || 'N/A',
          quantidade_gasta: qtdGasta,
          data: new Date().toISOString()
        }]);

      setSucesso(true);
      setTimeout(() => {
        setSucesso(false);
        setClienteNome('');
        setServico('');
        setTecnica('');
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
            className="mx-4 p-5 bg-white/60 backdrop-blur-xl rounded-[32px] border-2 border-pink-100 flex items-center justify-between shadow-xl shadow-pink-200/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-sm border border-white">
                <User size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Sugerido agora</p>
                <h4 className="font-black text-slate-800 text-sm tracking-tight">{agendamentoSugerido.cliente_nome}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{agendamentoSugerido.servico}</p>
              </div>
            </div>
            <button 
              onClick={handleApplySuggestion}
              className="px-5 py-2.5 bg-[#f21b7f] text-white text-[10px] font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md uppercase tracking-widest"
            >
              PREENCHER
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden mx-4">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
              <Scissors size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase">PROTOCOLO DE <span className="text-pink-100 italic">ELITE</span></h2>
          </div>
          <p className="text-pink-100 max-w-[240px] text-[10px] leading-relaxed font-black uppercase tracking-[0.2em] opacity-90">Gestão Superior de Atendimento e Insumos</p>
        </div>
      </div>

      <form onSubmit={handleDescontar} className="glass-card p-8 space-y-6 mt-[-50px] relative z-20 mx-6 shadow-2xl border-b-8 border-b-pink-100">
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Técnica Selecionada</label>
            <select 
              required
              className="input-glass w-full px-5 py-4 text-sm font-bold text-slate-800 bg-slate-50/50 appearance-none"
              value={tecnica}
              onChange={e => handleTecnicaChange(e.target.value)}
            >
              <option value="" disabled>Escolha a técnica...</option>
              {servicos.map(s => (
                <option key={s.id} value={s.nome}>{s.nome}</option>
              ))}
            </select>
          </div>

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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Base (R$)</label>
            <input 
              required
              type="number" 
              inputMode="decimal"
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
              inputMode="decimal"
              step="0.01"
              placeholder="+ 0,00" 
              className="input-glass w-full px-4 py-4 text-lg font-black text-pink-600"
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
              inputMode="decimal"
              step="0.1"
              placeholder="Ex: 2.0"
              className="input-glass w-full px-5 py-4 text-slate-900 font-black text-xl"
              value={gramatura}
              onChange={e => setGramatura(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 bg-pink-50/50 rounded-3xl border border-pink-100/50 flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest">Lucro Líquido Estimado</p>
              <p className="text-xl font-black text-pink-600">R$ {lucro.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Custo Total</p>
              <p className="text-xs font-bold text-slate-500">R$ {totalCustoReal.toFixed(2)}</p>
            </div>
          </div>
          
          {(valorCobrado || valorExtra) && lucro <= 2.00 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-3 py-2 bg-pink-100/50 rounded-xl border border-pink-200"
            >
              <p className="text-[10px] text-pink-600 font-bold flex items-center gap-2">
                <Sparkles size={12} /> Atenção: Margem de lucro muito baixa para este serviço
              </p>
            </motion.div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || sucesso}
          className="relative group w-full py-6 mt-4 flex items-center justify-center gap-3 disabled:opacity-50 font-black tracking-[0.2em] text-sm bg-[#f21b7f] text-white rounded-[24px] shadow-xl shadow-pink-200 active:scale-[0.98] transition-all overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
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
              className="flex flex-col items-center gap-6 p-12 bg-white rounded-[60px] border-4 border-pink-100 shadow-[0_40px_100px_rgba(242,27,127,0.15)]"
            >
              <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 shadow-inner relative overflow-hidden">
                <img 
                  src="/logo2.png" 
                  alt="Rose Logo" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // Fallback to Icon
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-1">Finalizado</h3>
                <p className="text-xs font-black text-pink-500 uppercase tracking-widest">Protocolo Concluído com Sucesso</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

