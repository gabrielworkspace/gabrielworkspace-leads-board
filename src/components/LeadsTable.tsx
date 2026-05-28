import { MoreHorizontal, History, Trash2, CalendarClock } from 'lucide-react';
import type { Lead } from '../types';

interface Props {
  leads: Lead[];
  onRemoveLead: (id: string) => void;
  onEditLead?: (lead: Lead) => void;
}

export function LeadsTable({ leads, onRemoveLead, onEditLead }: Props) {
  return (
    <div className="holo-panel p-6 flex flex-col min-h-[300px]">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300">Histórico de Leads</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
              <th className="pb-3 font-medium px-4">Nome</th>
              <th className="pb-3 font-medium">Serviço</th>
              <th className="pb-3 font-medium">Retorno</th>
              <th className="pb-3 font-medium">Valor</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm text-gray-500">Nenhum lead encontrado.</td>
              </tr>
            )}
            {leads.map(lead => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="py-4 px-4 text-sm font-medium text-white">{lead.name}</td>
                <td className="py-4 text-xs text-gray-400">
                  <span className="bg-white/5 px-2 py-1 rounded-md border border-white/10">{lead.serviceType || '--'}</span>
                </td>
                <td className="py-4 text-xs text-gray-400">
                  {lead.promiseDate ? (
                    <span className="flex items-center gap-2">
                      <CalendarClock className="w-3 h-3 text-[#00A3FF]" /> {lead.promiseDate}
                    </span>
                  ) : '--'}
                </td>
                <td className="py-4 text-xs">
                  {lead.value ? (
                    lead.status === 'Closed' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] tracking-wide">
                        R$ {lead.value.toLocaleString('pt-BR')}
                      </span>
                    ) : (
                      <span className="text-gray-300">R$ {lead.value.toLocaleString('pt-BR')}</span>
                    )
                  ) : (
                    <span className="text-gray-500">--</span>
                  )}
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                    lead.status === 'Replied' ? 'bg-[#10B981]/10 text-[#10B981]' :
                    lead.status === 'Closed' ? 'bg-[#00A3FF]/10 text-[#00A3FF]' :
                    lead.status === 'Promised' ? 'bg-[#A855F7]/10 text-[#A855F7]' :
                    lead.status === 'Refused' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                    'bg-[#6B7280]/10 text-[#6B7280]'
                  }`}>
                    {
                      lead.status === 'Replied' ? 'Respondeu' :
                      lead.status === 'Closed' ? 'Fechou' :
                      lead.status === 'Promised' ? 'Prometeu' : 
                      lead.status === 'Refused' ? 'Recusou' : 'Sem resposta'
                    }
                  </span>
                </td>
                <td className="py-4 px-4 flex justify-end gap-2">
                  <button onClick={() => onRemoveLead(lead.id)} className="w-8 h-8 rounded-full bg-[#121212] border border-white/5 flex items-center justify-center hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button onClick={() => onEditLead && onEditLead(lead)} className="w-8 h-8 rounded-full bg-[#121212] border border-white/5 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
