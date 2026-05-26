import { X, Trophy, MessageSquare, DollarSign, Target } from 'lucide-react';
import type { DailyMetrics, Lead } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  metrics: DailyMetrics | undefined;
  leads: Lead[];
}

export function DailyReportModal({ isOpen, onClose, metrics, leads }: Props) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const messagesSent = metrics?.messagesSent || 0;
  const messagesReplied = metrics?.messagesReplied || 0;
  const adSpend = metrics?.adSpend || 0;
  const paidRevenue = metrics?.lpRevenue || 0;
  
  const organicRevenue = leads
    .filter(l => l.status === 'Closed' && l.value && l.created_at?.startsWith(todayStr))
    .reduce((sum, lead) => sum + (lead.value || 0), 0);

  const totalRevenue = paidRevenue + organicRevenue;
  const totalProfit = totalRevenue - adSpend;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111318] border border-white/10 w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#A3FF12]/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A3FF12]/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#A3FF12]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">Desempenho Diário</h3>
              <p className="text-xs text-[#A3FF12] font-medium tracking-widest uppercase mt-0.5">Relatório das 22h</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
              <MessageSquare className="w-5 h-5 text-gray-400 mb-2" />
              <span className="text-2xl font-bold text-white">{messagesSent}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Enviadas</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
              <Target className="w-5 h-5 text-[#A3FF12] mb-2" />
              <span className="text-2xl font-bold text-white">{messagesReplied}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Respostas</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Resumo Financeiro Hoje</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Gasto em Ads</span>
                <span className="text-sm text-[#EF4444] font-medium">- R$ {adSpend.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Faturamento Total</span>
                <span className="text-sm text-[#10B981] font-medium">+ R$ {totalRevenue.toLocaleString('pt-BR')}</span>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm text-white font-medium">Lucro Líquido</span>
                <span className={`text-lg font-bold ${totalProfit >= 0 ? 'text-white' : 'text-[#EF4444]'}`}>
                  R$ {totalProfit.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={onClose} className="w-full btn-primary py-3">
            Excelente, fechar relatório
          </button>
        </div>

      </div>
    </div>
  );
}
