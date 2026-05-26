import { Line } from 'react-chartjs-2';
import type { DailyMetrics } from '../types';

interface Props {
  metrics: DailyMetrics[];
}

export function ProfileChart({ metrics }: Props) {
  const lineData = {
    labels: metrics.map(m => m.date),
    datasets: [
      {
        label: 'Revenue',
        data: metrics.map(m => m.lpRevenue),
        borderColor: '#F5B041',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Traffic Spend',
        data: metrics.map(m => m.adSpend),
        borderColor: '#9333EA',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(20, 20, 22, 0.9)',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: { display: false },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#6b7280', font: { size: 10 } },
        border: { display: false }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Revenue vs Traffic Spend (30 Days)</h3>
        <button className="px-4 py-1.5 rounded-full border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5">See all</button>
      </div>

      <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5 mb-6 self-start">
        <button className="px-4 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-medium">Revenue</button>
        <button className="px-4 py-1.5 rounded-full text-gray-400 text-[11px] font-medium hover:text-white">Traffic Spend</button>
      </div>

      <div className="flex-1 min-h-[150px] relative">
        <Line data={lineData} options={lineOptions} />
      </div>

      <div className="flex items-center justify-between mt-4 px-2">
         <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
           <span className="w-1.5 h-1.5 rounded-full bg-[#F5B041]"></span>
           <span className="text-[10px] text-gray-300">Revenue <span className="font-bold ml-1">R$ {metrics[metrics.length-1]?.lpRevenue}</span></span>
         </div>
         <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
           <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span>
           <span className="text-[10px] text-gray-300">Traffic Spend <span className="font-bold ml-1">R$ {metrics[metrics.length-1]?.adSpend}</span></span>
         </div>
      </div>
    </div>
  );
}
