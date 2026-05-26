import { X, Save, Trash2, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { DailyMetrics, LeadStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentMetrics: DailyMetrics | undefined;
  onSaveMetrics: (data: Partial<DailyMetrics>) => void;
  onAddLead: (lead: { name: string; status: LeadStatus; value?: number; promiseDate?: string }) => void;
  onClearData: () => void;
}

export function DataEntryModal({ isOpen, onClose, currentMetrics, onSaveMetrics, onAddLead, onClearData }: Props) {
  const [tab, setTab] = useState<'metrics' | 'leads' | 'settings'>('metrics');
  
  const [metricsForm, setMetricsForm] = useState({
    messagesSent: 0,
    messagesReplied: 0,
    adSpend: 0,
    lpRevenue: 0,
  });

  const [leadForm, setLeadForm] = useState({
    name: '',
    status: 'Replied' as LeadStatus,
    value: '',
    promiseDate: '',
  });

  useEffect(() => {
    if (currentMetrics && isOpen) {
      setMetricsForm({
        messagesSent: currentMetrics.messagesSent || 0,
        messagesReplied: currentMetrics.messagesReplied || 0,
        adSpend: currentMetrics.adSpend || 0,
        lpRevenue: currentMetrics.lpRevenue || 0,
      });
    }
  }, [currentMetrics, isOpen]);

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMetrics({
      messagesSent: Number(metricsForm.messagesSent),
      messagesReplied: Number(metricsForm.messagesReplied),
      adSpend: Number(metricsForm.adSpend),
      lpRevenue: Number(metricsForm.lpRevenue),
    });
    onClose();
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
      name: leadForm.name,
      status: leadForm.status,
      value: leadForm.value ? Number(leadForm.value) : undefined,
      promiseDate: leadForm.status === 'Promised' ? leadForm.promiseDate : undefined,
    });
    setLeadForm({ name: '', status: 'Replied', value: '', promiseDate: '' });
    onClose();
    setTab('metrics');
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja deletar todos os dados e resetar o Dashboard?')) {
      onClearData();
      onClose();
      setTab('metrics');
    }
  };

  // Helper function to handle empty vs 0 inputs
  const formatNumber = (val: number) => val === 0 ? '' : val;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111318] border border-white/10 p-6 z-50 rounded-[24px] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Ações do Painel</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-xl">
              <button type="button" onClick={() => setTab('metrics')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'metrics' ? 'bg-[#00A3FF] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Métricas</button>
              <button type="button" onClick={() => setTab('leads')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'leads' ? 'bg-[#00A3FF] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Adicionar Lead</button>
              <button type="button" onClick={() => setTab('settings')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'settings' ? 'bg-[#00A3FF] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Configurações</button>
            </div>

            {tab === 'metrics' && (
              <form className="space-y-5" onSubmit={handleSaveMetrics}>
                <div className="space-y-3">
                   <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5 pb-1">Métricas de Abordagem</h4>
                   <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Mensagens Enviadas</label>
                      <input required type="number" value={formatNumber(metricsForm.messagesSent)} onChange={e => setMetricsForm({...metricsForm, messagesSent: Number(e.target.value)})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Respondidas (Manual)</label>
                      <input required type="number" value={formatNumber(metricsForm.messagesReplied)} onChange={e => setMetricsForm({...metricsForm, messagesReplied: Number(e.target.value)})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5 pb-1">Financeiro</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Tráfego Pago (R$)</label>
                      <input required type="number" step="0.01" value={formatNumber(metricsForm.adSpend)} onChange={e => setMetricsForm({...metricsForm, adSpend: Number(e.target.value)})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Faturamento (R$)</label>
                      <input required type="number" step="0.01" value={formatNumber(metricsForm.lpRevenue)} onChange={e => setMetricsForm({...metricsForm, lpRevenue: Number(e.target.value)})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,163,255,0.4)]">
                    <Save className="w-4 h-4" /> Salvar Dados de Hoje
                  </button>
                </div>
              </form>
            )}

            {tab === 'leads' && (
              <form className="space-y-4" onSubmit={handleAddLead}>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Nome do Lead / Contato</label>
                  <input required type="text" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm" placeholder="Ex: João Silva (Insta)" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                  <select value={leadForm.status} onChange={e => setLeadForm({...leadForm, status: e.target.value as LeadStatus})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm appearance-none">
                    <option value="Replied">Respondeu</option>
                    <option value="Closed">Fechou</option>
                    <option value="Promised">Prometeu Responder</option>
                    <option value="Ignored">Ignorado</option>
                  </select>
                </div>
                
                {leadForm.status === 'Promised' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Data de Retorno</label>
                    <input required type="date" value={leadForm.promiseDate} onChange={e => setLeadForm({...leadForm, promiseDate: e.target.value})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Valor Fechado (R$) - Opcional</label>
                  <input type="number" value={leadForm.value} onChange={e => setLeadForm({...leadForm, value: e.target.value})} className="w-full bg-[#151210] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00A3FF] transition-colors text-sm" placeholder="Ex: 500" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,163,255,0.4)]">
                    <PlusCircle className="w-4 h-4" /> Adicionar Lead
                  </button>
                </div>
              </form>
            )}

            {tab === 'settings' && (
              <div className="space-y-4 pt-4">
                <p className="text-sm text-gray-400 text-center mb-6">Zerar todos os dados e começar do zero.</p>
                <button type="button" onClick={handleClear} className="w-full bg-transparent border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Apagar Todos os Dados
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
