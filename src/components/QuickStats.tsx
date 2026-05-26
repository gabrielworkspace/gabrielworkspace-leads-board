import { Clock, Play, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import type { DailyMetrics } from '../types';

export function QuickStats({ metrics, onEditMetrics, onEditAds }: { metrics: DailyMetrics[], onEditMetrics?: () => void, onEditAds?: () => void }) {
  const latest = metrics[metrics.length - 1] || { messagesSent: 0, lpRevenue: 0, adSpend: 0 };

  return (
    <div className="holo-panel p-6 flex flex-col h-[340px] relative">
      <button className="absolute top-4 right-4 p-2 bg-[#1A1A1A] rounded-xl text-gray-400 hover:text-white transition-colors">
        <ArrowUpRight size={14} />
      </button>

      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300">Faturamento Diário</h3>
      </div>
      
      <div className="flex flex-col items-center justify-center mb-8">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Aguardando</span>
        <h2 className="text-4xl font-light text-white tabular-nums tracking-wider">R$ {latest.lpRevenue.toLocaleString('en-US')}</h2>
        <button className="flex items-center gap-2 text-[#A3FF12] text-xs font-semibold mt-4 hover:opacity-80 transition-opacity">
          <Play size={14} fill="currentColor" /> Iniciar Rastreador de Receita
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar pt-2 border-t border-white/5">
        <p className="text-[10px] text-gray-500 mb-2 mt-2 tracking-widest uppercase">Métricas Anteriores</p>
        
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#A3FF12]/10 flex items-center justify-center">
               <span className="w-3 h-3 bg-[#A3FF12] rounded-sm"></span>
             </div>
             <div className="flex flex-col">
               <span className="text-xs text-gray-200 font-medium">Mensagens Enviadas</span>
               <span className="text-[10px] text-gray-500">Volume de Abordagem</span>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-xs text-white font-medium">{latest.messagesSent} msg</span>
             <button onClick={onEditMetrics} className="p-1 hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
               <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
             </button>
           </div>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
               <span className="w-3 h-3 bg-[#EF4444] rounded-full"></span>
             </div>
             <div className="flex flex-col">
               <span className="text-xs text-gray-200 font-medium">Gasto com Anúncios</span>
               <span className="text-[10px] text-gray-500">Custos de Tráfego</span>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-xs text-white font-medium">R$ {latest.adSpend}</span>
             <button onClick={onEditAds} className="p-1 hover:bg-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
               <MoreHorizontal className="w-4 h-4 text-gray-400 hover:text-white" />
             </button>
           </div>
        </div>
      </div>
    </div>
  )
}
