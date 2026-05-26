import type { Lead, LeadStatus } from '../types';
import { Trash2, CalendarClock } from 'lucide-react';
import { useState } from 'react';

interface Props {
  leads: Lead[];
  onRemoveLead: (id: string) => void;
}

export function TopLeads({ leads, onRemoveLead }: Props) {
  const [filter, setFilter] = useState<'All' | LeadStatus>('All');
  
  const displayLeads = filter === 'All' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="glass-panel p-6 flex flex-col h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Lead Status</h3>
        <button className="px-4 py-1.5 rounded-full border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5">See all</button>
      </div>

      <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5 mb-6 self-start overflow-x-auto w-full no-scrollbar">
        <button onClick={() => setFilter('All')} className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors ${filter === 'All' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>All</button>
        <button onClick={() => setFilter('Promised')} className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors ${filter === 'Promised' ? 'bg-[#F5B041]/20 text-[#F5B041]' : 'text-gray-400 hover:text-white'}`}>Promised</button>
        <button onClick={() => setFilter('Replied')} className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors ${filter === 'Replied' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-gray-400 hover:text-white'}`}>Replied</button>
        <button onClick={() => setFilter('Closed')} className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-colors ${filter === 'Closed' ? 'bg-[#10B981]/20 text-[#10B981]' : 'text-gray-400 hover:text-white'}`}>Closed</button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-4">
        {displayLeads.length === 0 && (
           <p className="text-sm text-gray-500 text-center mt-10">No leads found in this filter.</p>
        )}
        {displayLeads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between group p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${lead.status === 'Closed' ? 'bg-[#10B981] text-white' : lead.status === 'Replied' ? 'bg-[#3B82F6] text-white' : lead.status === 'Promised' ? 'bg-[#F5B041] text-white' : 'bg-[#EF4444] text-white'}`}>
                {lead.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{lead.name}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                   {lead.status}
                   {lead.status === 'Promised' && lead.promiseDate && (
                     <span className="text-[#F5B041] ml-1 flex items-center gap-1 font-medium bg-[#F5B041]/10 px-1.5 rounded-md">
                       <CalendarClock className="w-3 h-3" /> {lead.promiseDate}
                     </span>
                   )}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-white">{lead.value ? `R$ ${lead.value}` : '--'}</span>
                <span className="text-[10px] text-gray-400">Value</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveLead(lead.id); }} 
                className="p-1.5 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 rounded-md hover:bg-red-500/10"
                title="Delete Lead"
              >
                 <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
