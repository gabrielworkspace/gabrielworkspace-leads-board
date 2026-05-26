import { Clock, CheckCircle2, UserX } from 'lucide-react';
import type { Lead } from '../types';

interface Props {
  leads: Lead[];
}

export function Pipeline({ leads }: Props) {
  const evaluating = leads.filter(l => l.status === 'Evaluating');
  const success = leads.filter(l => l.status === 'Success');
  const ghosted = leads.filter(l => l.status === 'Ghosted');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0 pb-4 h-[200px]">
      {/* Evaluating */}
      <div className="glass-panel p-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1.5">
          <h3 className="text-xs font-semibold flex items-center gap-1.5 text-[#F5B041]">
            <Clock className="w-3 h-3" /> Avaliando ({evaluating.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
          {evaluating.map(lead => (
            <div key={lead.id} className="bg-[#1A1C23]/50 p-2 rounded-lg border border-white/5 hover:border-[#F5B041]/30 transition-colors">
              <div className="text-[10px] font-medium text-gray-200">{lead.name}</div>
              <div className="flex justify-between items-center mt-1 text-[8px]">
                <span className="text-gray-500">Retorno: {lead.deadline}</span>
                <span className="text-[#F5B041] font-semibold">R$ {lead.value?.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success */}
      <div className="glass-panel p-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1.5">
          <h3 className="text-xs font-semibold flex items-center gap-1.5 text-[#10B981]">
            <CheckCircle2 className="w-3 h-3" /> Sucessos ({success.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
          {success.map(lead => (
            <div key={lead.id} className="bg-[#1A1C23]/50 p-2 rounded-lg border border-white/5 hover:border-[#10B981]/30 transition-colors">
              <div className="text-[10px] font-medium text-gray-200">{lead.name}</div>
              <div className="flex justify-end items-center mt-1 text-[8px]">
                <span className="text-[#10B981] font-semibold">+ R$ {lead.value?.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ghosted */}
      <div className="glass-panel p-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1.5">
          <h3 className="text-xs font-semibold flex items-center gap-1.5 text-[#EF4444]">
            <UserX className="w-3 h-3" /> Ghosted ({ghosted.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
          {ghosted.map(lead => (
            <div key={lead.id} className="bg-[#1A1C23]/50 p-2 rounded-lg border border-white/5 hover:border-[#EF4444]/30 transition-colors">
              <div className="text-[10px] font-medium text-gray-200">{lead.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
