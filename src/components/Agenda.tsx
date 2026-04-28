import React, { useState, useEffect } from 'react';
import { User, Phone, Clock, FilePlus2, Sparkles, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';
import { WhatsAppModal } from './WhatsAppModal';

interface Appointment {
  id: string;
  name: string;
  whatsapp: string;
  date: string;
  service: string;
  status: 'pending' | 'completed';
}

export function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', date: '', service: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappData, setWhatsappData] = useState<{name: string, whatsapp: string, service: string, date: string} | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchAppointments();

    // Configuração Realtime
    const channel = supabase
      .channel('agenda_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda' },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await supabase
        .from('agenda')
        .select('id, cliente_nome, cliente_whatsapp, data_hora, servico, status')
        .order('data_hora', { ascending: true });

      if (error) throw error;
      
      const mappedData = (data || []).map((app: any) => ({
        id: app.id,
        name: app.cliente_nome,
        whatsapp: app.cliente_whatsapp,
        date: app.data_hora,
        service: app.servico,
        status: app.status
      }));

      setAppointments(mappedData);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      // Mantém os dados anteriores em caso de erro conforme solicitado
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Preparar dados para o formato do banco
    const dbPayload = {
      cliente_nome: formData.name,
      cliente_whatsapp: formData.whatsapp,
      data_hora: formData.date,
      servico: formData.service,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('agenda')
          .update(dbPayload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agenda')
          .insert([{ ...dbPayload, status: 'pending' }]);
        if (error) throw error;
      }
      
      const lastSavedData = { ...formData };
      setFormData({ name: '', whatsapp: '', date: '', service: '' });
      setEditingId(null);
      await fetchAppointments();

      // Abrir modal de WhatsApp para confirmação
      setWhatsappData(lastSavedData);
      setWhatsappModalOpen(true);
    } catch (error: any) {
      console.error('ERRO DETALHADO SUPABASE:', error);
      alert(`Erro ao salvar: ${error.message || 'Verifique o console'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (app: Appointment) => {
    setFormData({
      name: app.name,
      whatsapp: app.whatsapp,
      date: app.date.slice(0, 16), // Format for datetime-local
      service: app.service
    });
    setEditingId(app.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (app: Appointment) => {
    setItemToDelete({ id: app.id, name: app.name });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('agenda').delete().eq('id', itemToDelete.id);
      if (error) throw error;
      setModalOpen(false);
      setItemToDelete(null);
      fetchAppointments();
    } catch (error) {
      alert('Erro ao excluir');
      console.error(error);
    }
  };

  const markCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agenda')
        .update({ status: 'completed' })
        .eq('id', id);
      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Formulário */}
      <section className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilePlus2 className="text-pink-500" /> 
            {editingId ? 'Editar Agendamento' : 'Agendar Cliente'}
          </div>
          {editingId && (
            <button 
              onClick={() => { setEditingId(null); setFormData({ name: '', whatsapp: '', date: '', service: '' }); }}
              className="text-gray-400 hover:text-pink-500"
            >
              <X size={20} />
            </button>
          )}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full">
            <input 
              required
              type="text" 
              placeholder="Nome da Cliente" 
              className="input-glass w-full"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="w-full">
            <input 
              required
              type="text" 
              placeholder="WhatsApp" 
              className="input-glass w-full"
              value={formData.whatsapp}
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
          <div className="w-full">
            <input 
              required
              type="datetime-local" 
              className="input-glass w-full text-gray-900"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="w-full">
            <select 
              required
              className="input-glass w-full appearance-none text-gray-900"
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
          
          <button type="submit" className="btn-gradient w-full py-4 mt-2 font-bold text-lg">
            {editingId ? 'ATUALIZAR AGENDAMENTO' : 'SALVAR HORÁRIO'}
          </button>
        </form>
      </section>

      {/* Lista de Próximos Horários */}
      <section className="glass-card p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Próximos Horários</span>
            {isSyncing && (
               <div className="flex items-center gap-1 ml-2">
                 <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                 <span className="text-[9px] text-pink-400 font-bold uppercase tracking-tighter">Sincronizando...</span>
               </div>
            )}
          </div>
          <span className="text-[10px] bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase tracking-widest">{appointments.filter(a => a.status === 'pending').length} Ativos</span>
        </h2>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento.</p>
          ) : (
            appointments.map(app => (
              <div 
                key={app.id} 
                className={`group relative bg-white/40 border border-white/60 p-5 rounded-[24px] flex justify-between items-center transition-all hover:bg-white/80 hover:shadow-md ${
                  app.status === 'completed' ? 'opacity-60 bg-gray-50/30' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${app.status === 'completed' ? 'text-gray-400 line-through' : 'text-slate-800'}`}>
                    {app.name}
                  </h3>
                  <div className="text-[13px] text-gray-600 mt-2 space-y-1.5">
                    <p className="flex items-center gap-2 font-medium">
                      <Clock size={14} className="text-pink-400"/> 
                      {formatDate(app.date)}
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Sparkles size={14} className="text-pink-400"/> 
                      {app.service}
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Phone size={14} className="text-pink-400"/> 
                      {app.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {app.status === 'pending' && (
                    <button 
                      onClick={() => markCompleted(app.id)} 
                      className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all shadow-sm"
                      title="Concluir"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(app)} 
                      className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-all shadow-sm"
                      title="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(app)} 
                      className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <ConfirmModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={confirmDelete} 
        itemText={itemToDelete?.name} 
      />

      <WhatsAppModal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        data={whatsappData}
      />

    </div>
  );
}
