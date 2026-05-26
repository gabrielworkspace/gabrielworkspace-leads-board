import { Bar } from 'react-chartjs-2';
import { Zap, ArrowUpRight } from 'lucide-react';
import type { DailyMetrics, Lead } from '../types';

export function ProgressChart({ metrics, leads = [] }: { metrics: DailyMetrics[], leads?: Lead[] }) {
  const chartData = {
    labels: metrics.map(m => parseInt(m.date.split('-')[2]).toString()),
    datasets: [
      {
        label: 'Net Profit (R$)',
        data: metrics.map(m => {
          const dayLeads = leads.filter(l => l.created_at && l.created_at.startsWith(m.date));
          const dayOrganicRevenue = dayLeads
            .filter(l => l.status === 'Closed' && l.value)
            .reduce((sum, l) => sum + (l.value || 0), 0);
          return m.lpRevenue + dayOrganicRevenue - m.adSpend;
        }),
        backgroundColor: metrics.map((_, i) => i === metrics.length - 1 ? '#00A3FF' : '#ffffff'),
        borderRadius: 4,
        barThickness: 8,
      }
    ]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: true, grid: { display: false }, ticks: { color: '#666', font: { size: 10 } } },
      y: { display: false }
    }
  };

  const totalOrganicRevenue = leads
    .filter(l => l.status === 'Closed' && l.value)
    .reduce((sum, lead) => sum + (lead.value || 0), 0);
  const totalLpRevenue = metrics.reduce((acc, m) => acc + m.lpRevenue, 0);
  const totalAdSpend = metrics.reduce((acc, m) => acc + m.adSpend, 0);
  
  const totalProfit = totalLpRevenue + totalOrganicRevenue - totalAdSpend;

  const todayMetrics = metrics[metrics.length - 1] || { lpRevenue: 0, adSpend: 0, date: new Date().toISOString().split('T')[0] };
  const todayLeads = leads.filter(l => l.created_at && l.created_at.startsWith(todayMetrics.date));
  const todayOrganicRevenue = todayLeads
    .filter(l => l.status === 'Closed' && l.value)
    .reduce((sum, l) => sum + (l.value || 0), 0);
  const todayProfit = todayMetrics.lpRevenue + todayOrganicRevenue - todayMetrics.adSpend;

  return (
    <div className="holo-panel p-6 flex flex-col h-[340px] relative">
      <button className="absolute top-4 right-4 p-2 bg-[#1A1A1A] rounded-xl text-gray-400 hover:text-white transition-colors">
        <ArrowUpRight size={14} />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-300">Progresso</h3>
      </div>
      
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-wide">R$ {totalProfit.toLocaleString('en-US')}</h2>
        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Lucro Líquido no Período</p>
      </div>
      
      <div className="flex-1 w-full relative pt-4 flex items-end">
         <Bar data={chartData} options={options} />
         
         {/* Green tooltip simulator like the screenshot */}
         <div className="absolute right-0 top-1/2 -translate-y-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex items-center justify-center flex-col shadow-lg">
            <span className="text-white font-bold text-xs">Hoje</span>
            <span className="text-[9px] text-[#00A3FF] font-medium">{todayProfit >= 0 ? '+' : ''}R$ {todayProfit.toLocaleString('en-US')}</span>
         </div>
      </div>
    </div>
  )
}
