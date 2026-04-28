import React, { useState } from 'react';
import { Scissors, DollarSign, Droplet, Calculator } from 'lucide-react';

export function Atendimento() {
  const [valorCobrado, setValorCobrado] = useState('');
  const [gramatura, setGramatura] = useState('2'); // default 2g per service typically
  const [gelSelecionado, setGelSelecionado] = useState('');

  // Dummy list of pots to populate the select.
  // In a real scenario, this would be fetched from Supabase / global state
  const pots = [
    { id: '1', name: 'Vólia Gel Classic Blank (Restante: 18g)' },
    { id: '2', name: 'Vólia Gel Classic Pink (Restante: 5g)' },
  ];

  const handleDescontar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gelSelecionado) {
      alert("Por favor, selecione qual gel foi utilizado.");
      return;
    }
    alert(`Material descontado com sucesso! \n\nValor: R$ ${valorCobrado}\nGel: ${pots.find(p=>p.id===gelSelecionado)?.name}\nQtd: ${gramatura}g`);
    // In production: Update Supabase estoque table (subtract gramatura), and add to relatorio (valorCobrado)
    setValorCobrado('');
    setGelSelecionado('');
    setGramatura('2');
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
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 group-focus-within:scale-110 transition-transform" />
            <input 
              required
              type="number" 
              step="0.01"
              placeholder="Ex: 120.00" 
              className="input-glass w-full pl-12 text-lg font-bold text-gray-800"
              value={valorCobrado}
              onChange={e => setValorCobrado(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 block flex items-center gap-2">
            <Droplet size={16} className="text-pink-500"/> Qual gel usou?
          </label>
          <div className="relative group">
             <select 
              required
              className="input-glass w-full appearance-none pr-10"
              value={gelSelecionado}
              onChange={e => setGelSelecionado(e.target.value)}
            >
              <option value="" disabled>Selecione um pote de gel...</option>
              {pots.map(pot => (
                <option key={pot.id} value={pot.id}>{pot.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-pink-500">
               <Calculator size={18} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 block flex items-center gap-2">
             <Calculator size={16} className="text-pink-500"/> Quantidade gasta (g)
          </label>
          <input 
            required
            type="number" 
            step="0.1"
            className="input-glass w-full text-gray-900 font-bold"
            value={gramatura}
            onChange={e => setGramatura(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">* A média de um alongamento / manutenção é de 1.5g a 3g.</p>
        </div>

        <button type="submit" className="btn-gradient w-full py-4 text-lg mt-4 flex items-center justify-center gap-2">
          DESCONTAR MATERIAL
        </button>
      </form>
    </div>
  );
}
