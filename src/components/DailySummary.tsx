import { Doughnut } from 'react-chartjs-2';
import { Activity, ArrowUpRight } from 'lucide-react';
import type { DailyMetrics, Lead } from '../types';

export function DailySummary({ metrics, leads }: { metrics: DailyMetrics[], leads: Lead[] }) {
  const latest = metrics[metrics.length - 1] || { messagesSent: 0, messagesReplied: 0 };
  const totalReplies = latest.messagesReplied || 0;
  
  const closedLeads = leads.filter(l => l.status === 'Closed').length;
  const repliedLeads = leads.filter(l => l.status === 'Replied').length + closedLeads;
  const promisedLeads = leads.filter(l => l.status === 'Promised').length;
  const refusedLeads = leads.filter(l => l.status === 'Refused').length;
  const ignored = leads.filter(l => l.status === 'Ignored').length;
  
  const chartData = {
    labels: ['Replied/Closed', 'Promised', 'Refused', 'Ignored/Lost'],
    datasets: [{
      data: [repliedLeads, promisedLeads, refusedLeads, ignored],
      backgroundColor: ['#10B981', '#A855F7', '#EF4444', '#6B7280'], // Emerald, Purple, Red, Gray
      borderWidth: 0,
      cutout: '80%',
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    animation: { animateScale: true }
  };

  return (
    <div className="holo-panel p-6 flex flex-col h-[360px] relative">
      <button className="absolute top-4 right-4 p-2 bg-[#1A1A1A] rounded-xl text-gray-400 hover:text-white transition-colors">
        <ArrowUpRight size={14} />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300">Resumo Diário</h3>
      </div>
      
      <div className="flex-1 relative flex items-center justify-center my-4">
         <div className="w-[140px] h-[140px]">
            <Doughnut data={chartData} options={options} />
         </div>
         {/* Inner text for doughnut */}
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center pt-2">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Leads</span>
            <span className="text-lg font-bold text-white">{leads.length}</span>
         </div>
      </div>
      
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/5">
          <div className="flex items-center gap-2 text-gray-300 font-bold">
             Total de Respostas
          </div>
          <span className="text-[#00A3FF] font-bold">{totalReplies} respostas</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Foco em Leads
          </div>
          <span className="text-white font-medium">{repliedLeads} responderam</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]"></span> Prometeram
          </div>
          <span className="text-white font-medium">{promisedLeads} pendentes</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Recusou
          </div>
          <span className="text-white font-medium">{refusedLeads} perdidos</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#6B7280]"></span> Sem Resposta
          </div>
          <span className="text-white font-medium">{ignored} perdidos</span>
        </div>
      </div>
    </div>
  )
}
