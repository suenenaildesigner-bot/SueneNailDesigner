import React, { useState, useEffect } from 'react';
import { Scissors, DollarSign, Droplet, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Gel {
  id: string;
  marca: string;
  nome: string;
  quantidade_atual: number;
  quantidade_total: number;
  preco: number;
}

export function Atendimento() {
  const [valorCobrado, setValorCobrado] = useState('');
  const [gramatura, setGramatura] = useState('2');
  const [gelSelecionado, setGelSelecionado] = useState('');
  const [pots, setPots] = useState<Gel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPots();
  }, []);

  const fetchPots = async () => {
    const { data } = await supabase
      .from('estoque')
      .select('*')
      .gt('quantidade_atual', 0);
    if (data) setPots(data);
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

      // 1. Atualizar estoque
      const { error: stockError } = await supabase
        .from('estoque')
        .update({ quantidade_atual: novaQtd })
        .eq('id', gelSelecionado);

      if (stockError) throw stockError;

      // 2. Calcular custo proporcional: (Preço do Pote / Peso Total) * Peso Gasto
      const custoMaterial = (gel.preco / gel.quantidade_total) * qtdGasta;

      // 3. Registrar atendimento para o relatório
      // Assumindo a existência de uma tabela 'atendimentos' ou similar para o relatório
      const { error: serviceError } = await supabase
        .from('atendimentos')
        .insert([{
          valor_cobrado: parseFloat(valorCobrado),
          custo_material: custoMaterial,
          gel_usado: gel.nome,
          quantidade_gasta: qtdGasta,
          data: new Date().toISOString()
        }]);

      if (serviceError) {
        console.warn('Tabela atendimentos não encontrada, mas o estoque foi atualizado.');
      }

      alert(`Sucesso! Material descontado.\nCusto calculado: R$ ${custoMaterial.toFixed(2)}`);
      
      setValorCobrado('');
      setGelSelecionado('');
      setGramatura('2');
      fetchPots();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar atendimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-pink-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-pink-400 rounded-full blur-2xl opacity-50"></div>
        <h2 className="text-2xl font-bold flex items-center gap-2 relative z-10"><Scissors /> Novo Atendimento</h2>
        <p className="text-pink-100 mt-1 max-w-[200px] text-sm relative z-10">Registre o serviço e desconte automaticamente do estoque.</p>
      </div>

      <form onSubmit={handleDescontar} className="glass-card p-6 space-y-6 mt-[-20px] relative z-20 mx-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600 block">Valor Cobrado (R$)</label>
          <div className="w-full">
            <input 
              required
              type="number" 
              step="0.01"
              placeholder="0,00" 
              className="input-glass w-full text-lg font-bold text-gray-800"
              value={valorCobrado}
              onChange={e => setValorCobrado(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 block">
            Qual gel usou?
          </label>
          <div className="w-full">
             <select 
              required
              className="input-glass w-full appearance-none"
              value={gelSelecionado}
              onChange={e => setGelSelecionado(e.target.value)}
            >
              <option value="" disabled>Selecione um pote de gel...</option>
              {pots.map(pot => (
                <option key={pot.id} value={pot.id}>{pot.marca} - {pot.nome} ({pot.quantidade_atual.toFixed(1)}g rest.)</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 block text-gray-600">
             Quantidade gasta (g)
          </label>
          <input 
            required
            type="number" 
            step="0.1"
            className="input-glass w-full text-gray-900 font-bold"
            value={gramatura}
            onChange={e => setGramatura(e.target.value)}
          />
          <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            * MÉDIA: 1.5G A 3G POR SERVIÇO
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-gradient w-full py-4 text-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'PROCESSANDO...' : 'DESCONTAR MATERIAL'}
        </button>
      </form>
    </div>
  );
}
