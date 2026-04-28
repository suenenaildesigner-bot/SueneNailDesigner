import React, { useState } from 'react';
import { User, Phone, Clock, FilePlus2, Sparkles, CheckCircle2 } from 'lucide-react';
// import { supabase } from '../lib/supabase'; // To be connected by the user

interface Appointment {
  id: string;
  name: string;
  whatsapp: string;
  date: string;
  service: string;
  status: 'pending' | 'completed';
}

export function Agenda() {
  // Using local state to demonstrate the UI. Later replaced by Supabase fetching.
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', name: 'Maria Silva', whatsapp: '11999999999', date: '2023-11-20T14:30', service: 'Manutenção Fibra', status: 'pending' },
    { id: '2', name: 'Joana Sousa', whatsapp: '11988888888', date: '2023-11-20T16:00', service: 'Esmaltação em Gel', status: 'pending' },
  ]);

  const [formData, setFormData] = useState({ name: '', whatsapp: '', date: '', service: '' });

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending'
    };
    setAppointments([...appointments, newAppointment]);
    setFormData({ name: '', whatsapp: '', date: '', service: '' });
    // In production: await supabase.from('agenda').insert([newAppointment]);
  };

  const markCompleted = (id: string) => {
    setAppointments(appointments.map(app => app.id === id ? { ...app, status: 'completed' } : app));
    // In production: await supabase.from('agenda').update({ status: 'completed' }).eq('id', id);
  };

  return (
    <div className="space-y-6">
      
      {/* Formulário */}
      <section className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FilePlus2 className="text-pink-500" /> Agendar Cliente
        </h2>
        
        <form onSubmit={handleAddAppointment} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#f21b7f] transition-colors" />
            <input 
              required
              type="text" 
              placeholder="Nome da Cliente" 
              className="input-glass w-full pl-12"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#f21b7f] transition-colors" />
            <input 
              required
              type="text" 
              placeholder="WhatsApp" 
              className="input-glass w-full pl-12"
              value={formData.whatsapp}
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
          <div className="relative group">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#f21b7f] transition-colors" />
            <input 
              required
              type="datetime-local" 
              className="input-glass w-full pl-12 text-gray-900"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="relative group">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#f21b7f] transition-colors" />
            <select 
              required
              className="input-glass w-full pl-12 appearance-none text-gray-900"
              value={formData.service}
              onChange={e => setFormData({...formData, service: e.target.value})}
            >
              <option value="" disabled>Qual Serviço?</option>
              <option value="Colocação Molde F1">Colocação do molde F1</option>
              <option value="Manutenção Molde F1">Manutenção do molde F1</option>
              <option value="Esmaltação em Gel">Esmaltação em Gel</option>
              <option value="Banho de Gel">Banho de Gel</option>
              <option value="Unha Simples">Unha (Simples)</option>
            </select>
          </div>
          
          <button type="submit" className="btn-gradient w-full py-3 mt-2">
            SALVAR HORÁRIO
          </button>
        </form>
      </section>

      {/* Lista de Próximos Horários */}
      <section className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Horários</h2>
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento.</p>
          ) : (
            appointments.map(app => (
              <div key={app.id} className="bg-white/50 border border-white/60 p-4 rounded-xl flex justify-between items-center shadow-sm">
                <div>
                  <h3 className={`font-semibold ${app.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{app.name}</h3>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <p className="flex items-center gap-1"><Clock size={12}/> {new Date(app.date).toLocaleString('pt-BR')}</p>
                    <p className="flex items-center gap-1"><Sparkles size={12}/> {app.service}</p>
                  </div>
                </div>
                {app.status === 'pending' && (
                  <button onClick={() => markCompleted(app.id)} className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors" aria-label="Marcar como concluído">
                    <CheckCircle2 size={24} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
